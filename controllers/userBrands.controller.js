const sqlPool = require("../database");

const brandController = {
  getBrands: async (req, res) => {
    try {
      const [brands] = await sqlPool.query(`Select * from brands`);
      res.json({ brands: brands });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
};

module.exports = brandController;
