const fs = require("fs");
const path = require("path");
const sqlPool = require("../database");

const questionsController = {
  getQuestions: async (req, res) => {
    try {
      const page=parseInt(req.query.page);
      const perPage=parseInt(req.query.perPage);
      const [rows] = await sqlPool.query(
        `Select * From questions LIMIT ? OFFSET ?`,
        [perPage, (page - 1) * perPage]
      );
      const [rowsCount] = await sqlPool.query(
        `Select count(*) as total From questions`
      );
      res.json({ faqs: rows, total: rowsCount[0].total });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
};

module.exports = questionsController;
