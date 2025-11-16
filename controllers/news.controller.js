const fs = require("fs");
const path = require("path");
const sqlPool = require("../database");

const newsController = {
  getNews: async (req, res) => {
    try {
      const page=parseInt(req.query.page);
      const perPage=parseInt(req.query.perPage);
      const [rows] = await sqlPool.query(
        `Select * From news LIMIT ? OFFSET ?`,
        [perPage, (page - 1) * perPage]
      );
      const [rowsCount] = await sqlPool.query(
        `Select count(*) as total From news`
      );
      res.json({ data: rows, total: rowsCount[0].total });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
  getNewsById: async (req, res) => {
    try {
      const { id } = req.params;
      const [rows] = await sqlPool.query(`Select * From news Where id=?`, [id]);
      res.json({ data: rows[0] });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
  addNews: async (req, res) => {
    try {
      const imgUrl =
        process.env.BASE_URL + "news/" + req.file.filename;
      console.log(req.body);

      const { titleEn, titleGe, titleRu, contentEn, contentGe, contentRu } =
        req.body;
      const [result] = await sqlPool.query(
        `INSERT INTO news(titleEn, titleGe, titleRu, imgUrl, contentEn, contentGe, contentRu) VALUES (?,?,?,?,?,?,?)`,
        [titleEn, titleGe, titleRu, imgUrl, contentEn, contentGe, contentRu]
      );
      res.json({ id: result.insertId });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  updateNews: async (req, res) => {
    try {
      const imgUrl = req.file
        ? process.env.BASE_URL + "news/" + req.file.filename
        : "";

      const { titleEn, titleGe, titleRu, contentEn, contentGe, contentRu } =
        req.body;
      const { id } = req.params;
      if (imgUrl) {
        const [images] = await sqlPool.query(
          `Select imgUrl FROM news WHERE id = ?`,
          [id]
        );

        if (fs.existsSync("./news/" + path.basename(images[0].imgUrl))) {
          fs.unlink("./news/" + path.basename(images[0].imgUrl), (err) => {
            if (err) {
              console.error(`Error removing file: ${err}`);
              return;
            }
          });
        }

        const [result] = await sqlPool.query(
          `UPDATE news SET titleEn=?, titleGe=?, titleRu=?, contentEn=?, contentGe=?, contentRu=?, imgUrl=? WHERE id=?`,
          [
            titleEn,
            titleGe,
            titleRu,
            contentEn,
            contentGe,
            contentRu,
            imgUrl,
            id,
          ]
        );
      } else {
        const [result] = await sqlPool.query(
          `UPDATE news SET titleEn=?, titleGe=?, titleRu=?, contentEn=?, contentGe=?, contentRu=? WHERE id=?`,
          [titleEn, titleGe, titleRu, contentEn, contentGe, contentRu, id]
        );
      }
      const rows = await sqlPool.query(`Select * From news WHERE id=?`, [id]);
      res.json({ data: rows[0] });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  deleteNews: async (req, res) => {
    try {
      const { id } = req.params;

      const [images] = await sqlPool.query(
        `Select imgUrl FROM news WHERE id = ?`,
        [id]
      );

      if (fs.existsSync("./news/" + path.basename(images[0].imgUrl))) {
        fs.unlink("./news/" + path.basename(images[0].imgUrl), (err) => {
          if (err) {
            console.error(`Error removing file: ${err}`);
            return;
          }
        });
      }

      const [result] = await sqlPool.query(`DELETE FROM news WHERE id = ?`, [
        id,
      ]);
      res.json({ data: result });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
};

module.exports = newsController;
