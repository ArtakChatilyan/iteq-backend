const sqlPool = require("../database");
const compareModels = (model1, model2) => {
  if (!model1.viewInfo) return true;
  if (!model2.viewInfo) return false;
  const minPrice1 = model1.viewInfo.discount
    ? model1.viewInfo.newPrice
    : model1.viewInfo.price;
  const minPrice2 = model2.viewInfo.discount
    ? model2.viewInfo.newPrice
    : model2.viewInfo.price;
  return minPrice1 - minPrice2;
};
const discountController = {
  getDiscountsAll: async (req, res) => {
    try {
      let [discountProducts] = await sqlPool.query(
        `Select DISTINCT products.id, productNameEn, productNameGe, productNameRu,productBrand, productInStock, 
              (Select imgUrl from productimages where productId=products.Id Limit 1) as imgUrl
              From products inner join productcategories ON products.id=productcategories.productId 
              inner join models on products.id=models.productId 
              inner join modelsizes on modelsizes.modelId=models.id
              where products.productOnTop=1`
      );

      for (let i = 0; i < discountProducts.length; i++) {
        discountProducts[i].prices = [];
        const [models] = await sqlPool.query(
          "select * from models where productId=?",
          [discountProducts[i].id]
        );
        if (models.length > 0) {
          for (let j = 0; j < models.length; j++) {
            const [sizes] = await sqlPool.query(
              "select * from modelsizes where modelId=?",
              [models[j].id]
            );

            if (sizes.length > 0) {
              let sortedDiscounts = sizes
                .filter((s) => s.discount === 1)
                .sort((a, b) => a["newPrice"] - b["newPrice"]);
              const minDiscountSize =
                sortedDiscounts.length > 0 ? sortedDiscounts[0] : 0;
              let sorted = sizes
                .filter((s) => s.discount === 0)
                .sort((a, b) => a["price"] - b["price"]);
              const minSize = sorted.length > 0 ? sorted[0] : 0;

              if (!minDiscountSize) {
                models[j].viewInfo = minSize;
              } else if (!minSize) {
                models[j].viewInfo = minDiscountSize;
              } else {
                models[j].viewInfo =
                  minDiscountSize.newPrice > minSize.price
                    ? minSize
                    : minDiscountSize;
              }
              for (let k = 0; k < sizes.length; k++) {
                discountProducts[i].prices.push(
                  sizes[k].discount === 1 ? sizes[k].newPrice : sizes[k].price
                );
              }
            }
          }
          discountProducts[i].viewInfo = models.sort(compareModels)[0];
        }
      }
      res.json({ products: discountProducts });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
  getDiscounts: async (req, res) => {
    try {
      const page = parseInt(req.query.page);
      const perPage = parseInt(req.query.perPage);

      let [discountProducts] = await sqlPool.query(
        `Select DISTINCT products.id, productNameEn, productNameGe, productNameRu,productBrand, productInStock, 
              (Select imgUrl from productimages where productId=products.Id Limit 1) as imgUrl
              From products inner join productcategories ON products.id=productcategories.productId 
              inner join models on products.id=models.productId 
              inner join modelsizes on modelsizes.modelId=models.id
              where products.productOnTop=1 LIMIT ? OFFSET ?`,
        [perPage, (page - 1) * perPage]
      );

      for (let i = 0; i < discountProducts.length; i++) {
        discountProducts[i].prices = [];
        const [models] = await sqlPool.query(
          "select * from models where productId=?",
          [discountProducts[i].id]
        );
        if (models.length > 0) {
          for (let j = 0; j < models.length; j++) {
            const [sizes] = await sqlPool.query(
              "select * from modelsizes where modelId=?",
              [models[j].id]
            );

            if (sizes.length > 0) {
              let sortedDiscounts = sizes
                .filter((s) => s.discount === 1)
                .sort((a, b) => a["newPrice"] - b["newPrice"]);
              const minDiscountSize =
                sortedDiscounts.length > 0 ? sortedDiscounts[0] : 0;
              let sorted = sizes
                .filter((s) => s.discount === 0)
                .sort((a, b) => a["price"] - b["price"]);
              const minSize = sorted.length > 0 ? sorted[0] : 0;

              if (!minDiscountSize) {
                models[j].viewInfo = minSize;
              } else if (!minSize) {
                models[j].viewInfo = minDiscountSize;
              } else {
                models[j].viewInfo =
                  minDiscountSize.newPrice > minSize.price
                    ? minSize
                    : minDiscountSize;
              }
              for (let k = 0; k < sizes.length; k++) {
                discountProducts[i].prices.push(
                  sizes[k].discount === 1 ? sizes[k].newPrice : sizes[k].price
                );
              }
            }
          }
          discountProducts[i].viewInfo = models.sort(compareModels)[0];
        }
      }

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
