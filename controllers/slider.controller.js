const fs = require("fs");
const path = require("path");
const sqlPool = require("../database");

const sliderController = {
  getSlides: async (req, res) => {
    try {
      const [rows] = await sqlPool.query(`Select * From slider`);
      res.json({ data: rows });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
  addSlide: async (req, res) => {
    try {
      const itemUrl =
        req.protocol + "://" + req.get("host") + "/slides/" + req.file.filename;

      const { itemType } = req.body;
      const [result] = await sqlPool.query(
        `INSERT INTO slider(itemUrl, itemType) VALUES (?,?)`,
        [itemUrl, itemType]
      );
      res.json({ id: result.insertId });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
  deleteSlide: async (req, res) => {
    try {
      const { id } = req.params;
      const [items] = await sqlPool.query(
        `Select itemUrl FROM slider WHERE id= ?`,
        [id]
      );

      for (let i = 0; i < items.length; i++) {
        if (fs.existsSync("./slides/" + path.basename(items[i].itemUrl))) {
          fs.unlink("./slides/" + path.basename(items[i].itemUrl), (err) => {
            if (err) {
              console.error(`Error removing file: ${err}`);
              return;
            }
          });
        }
      }

      const [result] = await sqlPool.query(`DELETE FROM slider WHERE id= ?`, [
        id,
      ]);

      res.json({ data: result });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
};

module.exports = sliderController;
