const fs = require("fs");
const path = require("path");
const sqlPool = require("../database");

const portfolioController = {
  getPorfolios: async (req, res) => {
    try {
      const page=parseInt(req.query.page);
      const perPage=parseInt(req.query.perPage);
      const [rows] = await sqlPool.query(
        `Select id, titleEn, titleGe, titleRu From portfolio LIMIT ? OFFSET ?`,
        [perPage, (page - 1) * perPage]
      );
      const [rowsCount] = await sqlPool.query(
        `Select count(*) as total From portfolio`
      );
      res.json({ data: rows, total: rowsCount[0].total });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  getPortfolio: async (req, res) => {
    try {
      const [rows] = await sqlPool.query(`Select * From portfolio WHERE id=?`, [
        req.params.id,
      ]);
      res.json({ data: rows[0] });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  addPortfolio: async (req, res) => {
    try {
      const { titleEn, titleGe, titleRu, contentEn, contentGe, contentRu } =
        req.body;
      const [result] = await sqlPool.query(
        `INSERT INTO portfolio(titleEn, titleGe, titleRu, contentEn, contentGe, contentRu) 
           VALUES (?,?,?,?,?,?)`,
        [titleEn, titleGe, titleRu, contentEn, contentGe, contentRu]
      );

      res.json({ id: result.insertId });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  updatePortfolio: async (req, res) => {
    try {
      const { titleEn, titleGe, titleRu, contentEn, contentGe, contentRu } =
        req.body;
      const { id } = req.params;
      const [result] = await sqlPool.query(
        `UPDATE portfolio SET titleEn=?,titleGe=?,titleRu=?, contentEn=?, contentGe=?,contentRu=? WHERE id=?`,
        [titleEn, titleGe, titleRu, contentEn, contentGe, contentRu, id]
      );
      const rows = await sqlPool.query(`Select * From portfolio WHERE id=?`, [
        id,
      ]);
      res.json({ data: rows[0] });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  deletePortfolio: async (req, res) => {
    try {
      const { id } = req.params;

      const [images] = await sqlPool.query(
        `Select imgUrl FROM portfolioimages WHERE portfolioId= ?`,
        [id]
      );
      for (let i = 0; i < images.length; i++) {
        if (fs.existsSync("../portfolio/" + path.basename(images[i].imgUrl))) {
          fs.unlink(
            "../portfolio/" + path.basename(images[i].imgUrl),
            (err) => {
              if (err) {
                console.error(`Error removing file: ${err}`);
                return;
              }
            }
          );
        }
      }

      await sqlPool.query(`DELETE FROM portfoliooptions WHERE portfolioId =?`, [
        id,
      ]);
      await sqlPool.query(`DELETE FROM portfolioimages WHERE portfolioId =?`, [
        id,
      ]);
      const [result] = await sqlPool.query(
        `DELETE FROM portfolio WHERE id =?`,
        [id]
      );
      res.json({ data: result });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  getPortfolioImages: async (req, res) => {
    try {
      const [rows] = await sqlPool.query(
        `Select * From portfolioimages WHERE portfolioId=?`,
        [req.params.id]
      );
      res.json({ data: rows });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  addPortfolioImage: async (req, res) => {
    try {
      const imgUrl =
        req.protocol +
        "://" +
        req.get("host") +
        "/portfolio/" +
        req.file.filename;

      const { portfolioId } = req.body;
      const [result] = await sqlPool.query(
        `INSERT INTO portfolioimages(imgUrl, portfolioId) VALUES (?,?)`,
        [imgUrl, portfolioId]
      );
      res.json({ id: result.insertId });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  deletePortfolioImage: async (req, res) => {
    try {
      const { id } = req.params;
      const [images] = await sqlPool.query(
        `Select imgUrl FROM portfolioimages WHERE id= ?`,
        [id]
      );

      for (let i = 0; i < images.length; i++) {
        if (fs.existsSync("./portfolio/" + path.basename(images[i].imgUrl))) {
          fs.unlink("./portfolio/" + path.basename(images[i].imgUrl), (err) => {
            if (err) {
              console.error(`Error removing file: ${err}`);
              return;
            }
          });
        }
      }

      const [result] = await sqlPool.query(
        `DELETE FROM portfolioimages WHERE id= ?`,
        [id]
      );

      res.json({ data: result });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
  getPortfolioOptions: async (req, res) => {
    try {
      const [rows] = await sqlPool.query(
        `Select * From portfoliooptions WHERE portfolioId=?`,
        [req.params.id]
      );

      res.json({ data: rows });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
  getPortfolioOption: async (req, res) => {
    try {
      const [rows] = await sqlPool.query(
        `Select * From portfoliooptions WHERE id=?`,
        [req.params.id]
      );
      res.json({ data: rows[0] });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
  addPortfolioOption: async (req, res) => {
    try {
      const id = req.body.id;
      const { optionEn, optionGe, optionRu } = req.body.data;
      const [result] = await sqlPool.query(
        `INSERT INTO portfoliooptions(portfolioId, optionEn, optionGe, optionRu) VALUES (?,?,?,?)`,
        [id, optionEn, optionGe, optionRu]
      );
      res.json({ id: result.insertId });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
  updatePortfolioOption: async (req, res) => {
    try {
      const { optionEn, optionGe, optionRu } = req.body;
      const { id } = req.params;
      const [result] = await sqlPool.query(
        `UPDATE portfoliooptions SET optionEn=?,optionGe=?,optionRu=? WHERE id=?`,
        [optionEn, optionGe, optionRu, id]
      );
      const rows = await sqlPool.query(
        `Select * From portfoliooptions WHERE id=?`,
        [id]
      );
      res.json({ data: rows[0] });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
  deletePortfolioOption: async (req, res) => {
    try {
      const { id } = req.params;
      const [result] = await sqlPool.query(
        `Delete FROM portfoliooptions WHERE id= ?`,
        [id]
      );

      res.json({ data: result });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
};

module.exports = portfolioController;
