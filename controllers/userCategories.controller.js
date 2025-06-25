const sqlPool = require("../database");

const categoryController = {
  getCategories: async (req, res) => {
    try {
      const [rows] = await sqlPool.query(`Select * From categories `);
      res.json({ categories: rows });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
  getCategoriesById: async (req, res) => {
    try {
      const [rows] = await sqlPool.query(`Select * From categories `);
      res.json({ data: rows });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
  getMain: async (req, res) => {
    try {
      const [rows] = await sqlPool.query(
        "Select * from categories where parentId=0"
      );
      res.json({ categories: rows });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
};

module.exports = categoryController;
