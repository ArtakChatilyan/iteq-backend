const fs = require("fs");
const path = require("path");
const sqlPool = require("../database");

const partnersController = {
  getPartners: async (req, res) => {
    try {
      const page=parseInt(req.query.page);
      const perPage=parseInt(req.query.perPage);
      const [rows] = await sqlPool.query(
        `Select * From partners LIMIT ? OFFSET ?`, [perPage, (page - 1) * perPage]
      );
      const [rowsCount] = await sqlPool.query(
        `Select count(*) as total From partners`
      );
      res.json({ data: rows, total: rowsCount[0].total });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
  getPartner: async (req, res) => {
    try {
      const { id } = req.params;
      const [rows] = await sqlPool.query(`Select * From partners Where id=?`, [
        id,
      ]);
      res.json({ data: rows[0] });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
  addPartner: async (req, res) => {
    try {
      const imgUrl =
        req.protocol +
        "://" +
        req.get("host") +
        "/partners/" +
        req.file.filename;

      const { name, partnerUrl, contentEn, contentGe, contentRu } = req.body;
      const [result] = await sqlPool.query(
        `INSERT INTO partners(name, imgUrl, partnerUrl, contentEn, contentGe, contentRu) VALUES (?,?,?,?,?,?)`,
        [name, imgUrl, partnerUrl, contentEn, contentGe, contentRu]
      );
      res.json({ id: result.insertId });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  updatePartner: async (req, res) => {
    try {
      const imgUrl = req.file
        ? req.protocol +
          "://" +
          req.get("host") +
          "/partners/" +
          req.file.filename
        : "";

      const { name, partnerUrl, contentEn, contentGe, contentRu } = req.body;
      const { id } = req.params;
      if (imgUrl) {
        const [images] = await sqlPool.query(
          `Select imgUrl FROM partners WHERE id = ?`,
          [id]
        );

        if (fs.existsSync("./partners/" + path.basename(images[0].imgUrl))) {
          fs.unlink("./partners/" + path.basename(images[0].imgUrl), (err) => {
            if (err) {
              console.error(`Error removing file: ${err}`);
              return;
            }
          });
        }

        const [result] = await sqlPool.query(
          `UPDATE partners SET name=?, partnerUrl=?, contentEn=?, contentGe=?, contentRu=?, imgUrl=? WHERE id=?`,
          [name, partnerUrl, contentEn, contentGe, contentRu, imgUrl, id]
        );
      } else {
        const [result] = await sqlPool.query(
          `UPDATE partners SET name=?, partnerUrl=?, contentEn=?, contentGe=?, contentRu=? WHERE id=?`,
          [name, partnerUrl, contentEn, contentGe, contentRu, id]
        );
      }
      const rows = await sqlPool.query(`Select * From partners WHERE id=?`, [
        id,
      ]);
      res.json({ data: rows[0] });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  deletePartner: async (req, res) => {
    try {
      const [images] = await sqlPool.query(
        `Select imgUrl FROM partners WHERE id = ?`,
        [id]
      );

      if (fs.existsSync("./partners/" + path.basename(images[0].imgUrl))) {
        fs.unlink("./partners/" + path.basename(images[0].imgUrl), (err) => {
          if (err) {
            console.error(`Error removing file: ${err}`);
            return;
          }
        });
      }

      const [result] = await sqlPool.query(
        `DELETE FROM partners WHERE id = ?`,
        [id]
      );
      res.json({ data: result });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
};

module.exports = partnersController;
