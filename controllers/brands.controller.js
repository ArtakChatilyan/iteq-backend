const fs = require("fs");
const path = require("path");
const sqlPool = require("../database");

const brandsController = {
  getBrandsAll: async (req, res) => {
    try {
      const [rows] = await sqlPool.query(`Select * From brands order by brandName`);

      res.json({ data: rows });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  getBrands: async (req, res) => {
    try {
      const page=parseInt(req.query.page);
      const perPage=parseInt(req.query.perPage);
      const [rows] = await sqlPool.query(
        "Select * From brands ORDER BY brandName LIMIT ? OFFSET ?",
        [perPage, (page - 1) * perPage]
      );
      const [rowsCount] = await sqlPool.query(
        'Select count(*) as total From brands'
      );
      res.json({ data: rows, total: rowsCount[0].total });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  getBrand: async (req, res) => {
    try {
      const [rows] = await sqlPool.query(`Select * From brands WHERE id=?`, [
        req.params.id,
      ]);
      res.json({ data: rows[0] });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  addBrand: async (req, res) => {
    try {
      const imgUrl =
        process.env.BASE_URL + "brands/" + req.file.filename;

      const { brandName, brandUrl } = req.body;
      const [result] = await sqlPool.query(
        `INSERT INTO brands(brandName, brandUrl, imgUrl) VALUES (?,?,?)`,
        [brandName, brandUrl, imgUrl]
      );
      res.json({ id: result.insertId });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  updateBrand: async (req, res) => {
    try {
      const imgUrl = req.file
        ? process.env.BASE_URL +
          "brands/" +
          req.file.filename
        : "";

      const { brandName, brandUrl } = req.body;
      const { id } = req.params;

      if (imgUrl) {
        const [images] = await sqlPool.query(
          `Select imgUrl FROM brands WHERE id = ?`,
          [id]
        );

        if (fs.existsSync("./brands/" + path.basename(images[0].imgUrl))) {
          fs.unlink("./brands/" + path.basename(images[0].imgUrl), (err) => {
            if (err) {
              console.error(`Error removing file: ${err}`);
              return;
            }
          });
        }

        const [result] = await sqlPool.query(
          `UPDATE brands SET brandName=?, brandUrl=?, imgUrl=? WHERE id=?`,
          [brandName, brandUrl, imgUrl, id]
        );
      } else {
        const [result] = await sqlPool.query(
          `UPDATE brands SET brandName=?, brandUrl=? WHERE id=?`,
          [brandName, brandUrl, id]
        );
      }

      const rows = await sqlPool.query(`Select * From brands WHERE id=?`, [id]);
      res.json({ data: rows[0] });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  deleteBrand: async (req, res) => {
    try {
      const { id } = req.params;
      const [brandInfo] = await sqlPool.query(
        "select Count(*) as count from products where productBrand=?",
        [id]
      );
      if (brandInfo[0].count > 0) {
        return { message: "Some products belong to this brand!" };
      } else {
        const [images] = await sqlPool.query(
          `Select imgUrl FROM brands WHERE id = ?`,
          [id]
        );

        if (fs.existsSync("./brands/" + path.basename(images[0].imgUrl))) {
          fs.unlink("./brands/" + path.basename(images[0].imgUrl), (err) => {
            if (err) {
              console.error(`Error removing file: ${err}`);
              return;
            }
          });
        }

        const [result] = await sqlPool.query(
          `DELETE FROM brands WHERE id = ?`,
          [id]
        );
        res.json({ data: result });
      }
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
};

module.exports = brandsController;
