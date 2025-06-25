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
  getBrandsForCategory: async(req, res)=>{
    try {
      let {catId}=req.query;
      
      let searchId = catId;
      let [category]=await sqlPool.query('select * from categories where id=?', [catId]);
      let searchParentId = category[0].parentId;

      while (searchParentId > 0) {
        searchId = searchParentId;
        [category]=await sqlPool.query('select * from categories where id=?', [searchParentId]);
        searchParentId = category[0].parentId;
      }
      const [brands] = await sqlPool.query(`Select * from brands inner join categorybrands on brands.id=categorybrands.brandId where categorybrands.categoryId=?`,[searchId]);
      res.json({ brands: brands });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  }
};

module.exports = brandController;
