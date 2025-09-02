const sqlPool = require("../database");

const discountController = {
  getDiscountsAll: async (req, res) => {
    try {
      const [discountProducts] = await sqlPool.query(
        `Select products.id, productNameEn, productNameGe, productNameRu, productModel, productPrice, productInStock, productDiscount, productNewPrice, productOnTop, (Select imgUrl from productimages where productId=products.Id Limit 1) as imgUrl
        From products WHERE products.productOnTop=1`
      );
      res.json({ products: discountProducts });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
  getDiscounts: async (req, res) => {
    try {
      const page=parseInt(req.query.page);
      const perPage=parseInt(req.query.perPage);
      
      const [discountProducts] = await sqlPool.query(
        `Select products.id, productNameEn, productNameGe, productNameRu, productModel, productPrice, productInStock, productDiscount, productNewPrice, 
        (Select imgUrl from productimages where productId=products.Id Limit 1) as imgUrl
        From products WHERE products.productOnTop=1 LIMIT ? OFFSET ?`,
        [perPage, (page - 1)*perPage]
      );

      const [total] = await sqlPool.query(
        `Select count(*) as total From products WHERE products.productOnTop=1`
      );
      res.json({ products: discountProducts, total: total[0].total });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
};

module.exports = discountController;
