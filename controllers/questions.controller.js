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
      res.json({ data: rows, total: rowsCount[0].total });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
  getQuestionById: async (req, res) => {
    try {
      const { id } = req.params;
      const [rows] = await sqlPool.query(`Select * From questions Where id=?`, [id]);
      res.json({ question: rows[0] });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
  addQuestion: async (req, res) => {
    try {
      const { questionEn, questionGe, questionRu, answerEn, answerGe, answerRu } =
        req.body;
      const [result] = await sqlPool.query(
        `INSERT INTO questions(questionEn, questionGe, questionRu, answerEn, answerGe, answerRu ) VALUES (?,?,?,?,?,?)`,
        [questionEn, questionGe, questionRu, answerEn, answerGe, answerRu ]
      );
      res.json({ id: result.insertId });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  updateQuestion: async (req, res) => {
    try {
      const { questionEn, questionGe, questionRu, answerEn, answerGe, answerRu  } =
        req.body;
      const { id } = req.params;
      
        const [result] = await sqlPool.query(
          `UPDATE questions SET questionEn=?, questionGe=?, questionRu=?, answerEn=?, answerGe=?, answerRu=? WHERE id=?`,
          [questionEn, questionGe, questionRu, answerEn, answerGe, answerRu , id]
        );
      
      const rows = await sqlPool.query(`Select * From questions WHERE id=?`, [id]);
      res.json({ data: rows[0] });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  deleteQuestion: async (req, res) => {
    try {
      const { id } = req.params;

      const [result] = await sqlPool.query(`DELETE FROM questions WHERE id = ?`, [
        id,
      ]);
      res.json({ data: result });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
};

module.exports = questionsController;
