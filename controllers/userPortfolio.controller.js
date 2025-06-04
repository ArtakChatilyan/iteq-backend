const sqlPool = require("../database");

const userPortfolioController = {
  getPortfolio: async (req, res) => {
    try {
      const page=parseInt(req.query.page);
      const perPage=parseInt(req.query.perPage);
      const [rows] = await sqlPool.query(
        `Select id, titleEn, titleGe, titleRu, (Select imgUrl from portfolioimages where portfolioId=portfolio.id Limit 1) as imgUrl From portfolio LIMIT ? OFFSET ?`,
        [perPage, (page - 1) * perPage]
      );
      const [count] = await sqlPool.query(
        "Select count(*) as total from portfolio"
      );
      res.json({ data: rows, total: count[0] });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
  getPortfolioById: async (req, res) => {
    try {
      const [rows] = await sqlPool.query("Select * from portfolio where id=?", [
        req.params.id,
      ]);
      const [images] = await sqlPool.query(
        `Select * From portfolioimages WHERE portfolioId=?`,
        [req.params.id]
      );
      res.json({ data: rows });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
};

module.exports = userPortfolioController;
