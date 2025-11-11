const fs = require("fs");
const path = require("path");
const sqlPool = require("../database");

const categoryController = {
  getCategories: async (req, res) => {
    try {
      const page = parseInt(req.query.page);
      const perPage = parseInt(req.query.perPage);
      const [rows] = await sqlPool.query(
        `Select * From categories where parentId=0 LIMIT ? OFFSET ?`,
        [perPage, (page - 1) * perPage]
      );
      const [rowsCount] = await sqlPool.query(
        `Select count(*) as total From categories where parentId=0`
      );
      res.json({ data: rows, total: rowsCount[0].total });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  getCategoriesForProduct: async (req, res) => {
    try {
      const [rows] = await sqlPool.query(`Select * From categories`);

      res.json({ data: rows });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  getCategoriesMain: async (req, res) => {
    try {
      const [rows] = await sqlPool.query(
        `Select * From categories where parentId=0`
      );

      res.json({ data: rows });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  getCategory: async (req, res) => {
    try {
      const [rows] = await sqlPool.query(
        `Select * From categories WHERE id=?`,
        [req.params.id]
      );
      res.json({ data: rows[0] });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  addCategory: async (req, res) => {
    try {
      const { nameEn, nameGe, nameRu, categoryOrder, onTop } = req.body;
      const imgUrl =
        req.protocol +
        "://" +
        req.get("host") +
        "/categories/" +
        req.file.filename;
      const [result] = await sqlPool.query(
        `INSERT INTO categories(nameEn, nameGe, nameRu, categoryOrder, imgUrl, onTop, parentId) VALUES (?,?,?,?,?,?,?)`,
        [nameEn, nameGe, nameRu, categoryOrder, imgUrl, onTop === "true", 0]
      );
      res.json({ id: result.insertId });
    } catch (error) {
      res.json({ state: error });
    }
  },

  updateCategory: async (req, res) => {
    try {
      const imgUrl = req.file
        ? req.protocol +
          "://" +
          req.get("host") +
          "/categories/" +
          req.file.filename
        : "";

      const { nameEn, nameGe, nameRu, categoryOrder, onTop } = req.body;

      const { id } = req.params;
      if (imgUrl) {
        const [images] = await sqlPool.query(
          `Select imgUrl FROM categories WHERE id = ?`,
          [id]
        );

        if (fs.existsSync("./categories/" + path.basename(images[0].imgUrl))) {
          fs.unlink(
            "./categories/" + path.basename(images[0].imgUrl),
            (err) => {
              if (err) {
                console.error(`Error removing file: ${err}`);
                return;
              }
            }
          );
        }

        const [result] = await sqlPool.query(
          `UPDATE categories SET nameEn=?, nameGe=?, nameRu=?, categoryOrder=?, imgUrl=?, onTop=? WHERE id=?`,
          [nameEn, nameGe, nameRu, categoryOrder, imgUrl, onTop === "true", id]
        );
      } else {
        const [result] = await sqlPool.query(
          `UPDATE categories SET nameEn=?, nameGe=?, nameRu=?,categoryOrder=?, onTop=? WHERE id=?`,
          [nameEn, nameGe, nameRu, categoryOrder, onTop === "true", id]
        );
      }
      const rows = await sqlPool.query(`Select * From categories WHERE id=?`, [
        id,
      ]);
      res.json({ data: rows[0] });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  deleteCategory: async (req, res) => {
    try {
      const { id } = req.params;

      const [categoryInfo] = await sqlPool.query(
        "select Count(*) as count from categories where parentId=?",
        [id]
      );
      if (categoryInfo[0].count > 0) {
        return { message: "Category contains sub categories!" };
      } else {
        const [images] = await sqlPool.query(
          `Select imgUrl FROM categories WHERE id = ?`,
          [id]
        );

        if (fs.existsSync("./categories/" + path.basename(images[0].imgUrl))) {
          fs.unlink(
            "./categories/" + path.basename(images[0].imgUrl),
            (err) => {
              if (err) {
                console.error(`Error removing file: ${err}`);
                return;
              }
            }
          );
        }

        await sqlPool.query(
          `DELETE FROM productcategories WHERE categoryId = ?`,
          [id]
        );
        const [result] = await sqlPool.query(
          `DELETE FROM categories WHERE id = ?`,
          [id]
        );
        res.json({ data: result });
      }
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  getCategoryBrands: async (req, res) => {
    try {
      const [rows] = await sqlPool.query(
        `Select categorybrands.id, categoryId, brandId, brandName From categorybrands inner join brands on categorybrands.brandId=brands.id WHERE categoryId=?`,
        [req.params.id]
      );
      res.json({ data: rows });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  setCategoryBrands: async (req, res) => {
    try {
      const { id, result } = req.body;
      await sqlPool.query(`delete from categorybrands where categoryId=?`, [
        id,
      ]);
      for (let i = 0; i < result.length; i++) {
        await sqlPool.query(
          `insert into categorybrands(categoryId, brandId) values(?,?)`,
          [id, result[i]]
        );
      }
      res.json({ message: "done!" });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
};

module.exports = categoryController;
