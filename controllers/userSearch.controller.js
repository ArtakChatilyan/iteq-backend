const sqlPool = require("../database");

const seaechController = {
  getByBrand: async (req, res) => {
    try {
      const { term } = req.query;
      const [searchData] = await sqlPool.query(
        "select * from brands where brandName like ? LIMIT 5",
        ["%" + term + "%"]
      );

      res.json(searchData);
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
  getProductsByBrand: async (req, res) => {
    try {
      const { term, page, perPage } = req.query;
      let result = [];
      let count = 0;
      const [searchData] = await sqlPool.query(
        "select id from brands where brandName = ?",
        [term]
      );
      if (searchData.length > 0) {
        [products] = await sqlPool.query(
          `Select products.id, productNameEn, productNameGe, productNameRu, productModel,productMultyDimension, productPrice, productInStock, productDiscount, productNewPrice, 
                (Select imgUrl from productimages where productId=products.Id Limit 1) as imgUrl from products where productBrand=? LIMIT ? OFFSET ? `,
          [searchData[0].id, parseInt(perPage), (page - 1) * perPage]
        );

        for (let i = 0; i < products.length; i++) {
          if (products[i].productMultyDimension === 1) {
            const [sizes] = await sqlPool.query(
              "select * from productsizes where productId=?",
              [products[i].id]
            );
            if (sizes.length > 0) {
              const minDiscountSize = sizes
                .filter((s) => s.discount === 1)
                .sort((a, b) => a["newPrice"] - b["newPrice"])[0];
              const minSize = sizes
                .filter((s) => s.discount === 0)
                .sort((a, b) => a["price"] - b["price"])[0];
              if (!minDiscountSize) {
                products[i].viewInfo = minSize;
              } else if (!minSize) {
                products[i].viewInfo = minDiscountSize;
              } else {
                products[i].viewInfo =
                  minDiscountSize.newPrice > minSize.price
                    ? minSize
                    : minDiscountSize;
              }
            }
          } else {
            products[i].viewInfo = {
              count: products[i].productCount,
              dimension: products[i].productDimension,
              weight: products[i].productWeight,
              discount: products[i].productDiscount,
              inStock: products[i].productInStock,
              price: products[i].productPrice,
              newPrice: products[i].productNewPrice,
            };
          }
        }

        [countResult] = await sqlPool.query(
          `Select count(*) as total  from products where productBrand=?`,
          [searchData[0].id]
        );
        count = countResult[0].total;
      }
      res.json({ products: products, total: count });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
  getByModel: async (req, res) => {
    try {
      const { term } = req.query;
      const [searchData] = await sqlPool.query(
        "select * from products where productModel like ? LIMIT 5",
        ["%" + term + "%"]
      );

      res.json(searchData);
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
  getProductsByModel: async (req, res) => {
    try {
      const { term, page, perPage } = req.query;
      const [products] = await sqlPool.query(
        `Select products.id, productNameEn, productNameGe, productNameRu, productModel, productMultyDimension, productPrice, productInStock, productDiscount, productNewPrice, 
                (Select imgUrl from productimages where productId=products.Id Limit 1) as imgUrl from products where productModel=? LIMIT ? OFFSET ? `,
        [term, parseInt(perPage), (page - 1) * perPage]
      );

      for (let i = 0; i < products.length; i++) {
        if (products[i].productMultyDimension === 1) {
          const [sizes] = await sqlPool.query(
            "select * from productsizes where productId=?",
            [products[i].id]
          );
          if (sizes.length > 0) {
            const minDiscountSize = sizes
              .filter((s) => s.discount === 1)
              .sort((a, b) => a["newPrice"] - b["newPrice"])[0];
            const minSize = sizes
              .filter((s) => s.discount === 0)
              .sort((a, b) => a["price"] - b["price"])[0];
            if (!minDiscountSize) {
              products[i].viewInfo = minSize;
            } else if (!minSize) {
              products[i].viewInfo = minDiscountSize;
            } else {
              products[i].viewInfo =
                minDiscountSize.newPrice > minSize.price
                  ? minSize
                  : minDiscountSize;
            }
          }
        } else {
          products[i].viewInfo = {
            count: products[i].productCount,
            dimension: products[i].productDimension,
            weight: products[i].productWeight,
            discount: products[i].productDiscount,
            inStock: products[i].productInStock,
            price: products[i].productPrice,
            newPrice: products[i].productNewPrice,
          };
        }
      }

      const [total] = await sqlPool.query(
        `Select count(*) as total  from products where productModel=?`,
        [term]
      );
      res.json({ products: products, total: total[0].total });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
  getByCategory: async (req, res) => {
    try {
      const { term } = req.query;
      const [searchData] = await sqlPool.query(
        "select * from categories where nameEn like ? or nameGe like ? or nameRu like ? LIMIT 5",
        ["%" + term + "%", "%" + term + "%", "%" + term + "%"]
      );

      res.json(searchData);
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
  getProductsByCategory: async (req, res) => {
    try {
      const { term, page, perPage } = req.query;
      let products = [];
      let count = 0;
      const [catId] = await sqlPool.query(
        "select id from categories where nameEn=? or nameGe=? or nameRu=?",
        [term, term, term]
      );

      if (catId.length > 0) {
        [products] = await sqlPool.query(
          `Select products.id, productNameEn, productNameGe, productNameRu, productModel, productMultyDimension, productPrice, productInStock, productDiscount, productNewPrice, 
                (Select imgUrl from productimages where productId=products.Id Limit 1) as imgUrl from products inner join productcategories on products.id=productcategories.productId
                 where productcategories.categoryId=? LIMIT ? OFFSET ? `,
          [catId[0].id, parseInt(perPage), (page - 1) * perPage]
        );

        for (let i = 0; i < products.length; i++) {
          if (products[i].productMultyDimension === 1) {
            const [sizes] = await sqlPool.query(
              "select * from productsizes where productId=?",
              [products[i].id]
            );
            if (sizes.length > 0) {
              const minDiscountSize = sizes
                .filter((s) => s.discount === 1)
                .sort((a, b) => a["newPrice"] - b["newPrice"])[0];
              const minSize = sizes
                .filter((s) => s.discount === 0)
                .sort((a, b) => a["price"] - b["price"])[0];
              if (!minDiscountSize) {
                products[i].viewInfo = minSize;
              } else if (!minSize) {
                products[i].viewInfo = minDiscountSize;
              } else {
                products[i].viewInfo =
                  minDiscountSize.newPrice > minSize.price
                    ? minSize
                    : minDiscountSize;
              }
            }
          } else {
            products[i].viewInfo = {
              count: products[i].productCount,
              dimension: products[i].productDimension,
              weight: products[i].productWeight,
              discount: products[i].productDiscount,
              inStock: products[i].productInStock,
              price: products[i].productPrice,
              newPrice: products[i].productNewPrice,
            };
          }
        }

        [countResult] = await sqlPool.query(
          `Select count(*) as total  from products inner join productcategories on products.id=productcategories.productId where productcategories.categoryId=?`,
          [catId[0].id]
        );
        count = countResult[0].total;
      }

      res.json({ products: products, total: count });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
};

module.exports = seaechController;
