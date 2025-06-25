const sqlPool = require("../database");

const userPartnerController = {
  getPartners: async (req, res) => {
    try {
      const page=parseInt(req.query.page);
      const perPage=parseInt(req.query.perPage);
      const [rows] = await sqlPool.query(
        `Select * from partners LIMIT ? OFFSET ?`,
        [perPage, (page - 1) * perPage]
      );
      const [count] = await sqlPool.query(
        "Select count(*) as total from partners"
      );
      res.json({ data: rows, total: count[0] });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
};

module.exports = userPartnerController;
