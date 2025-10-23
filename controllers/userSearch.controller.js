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
      const [searchData] = await sqlPool.query(
        "select id from brands where brandName = ?",
        [term]
      );
      if (searchData.length > 0) {
        let [products] = await sqlPool.query(
          `Select products.id, productNameEn, productNameGe, productNameRu,productBrand, productInStock, 
        (Select imgUrl from productimages where productId=products.Id Limit 1) as imgUrl
        From products where productBrand=? LIMIT ? OFFSET ?`,
          [searchData[0].id, parseInt(perPage), (page - 1) * perPage]
        );

        for (let i = 0; i < products.length; i++) {
          products[i].prices = [];
          const [models] = await sqlPool.query(
            "select * from models where productId=?",
            [products[i].id]
          );
          if (models.length > 0) {
            products[i].modelInfo = models;
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
                  products[i].prices.push(
                    sizes[k].discount === 1 ? sizes[k].newPrice : sizes[k].price
                  );
                }
              }
            }
            products[i].viewInfo = models.sort(compareModels)[0];
          }
        }

        [countResult] = await sqlPool.query(
          `Select count(*) as total  from products where productBrand=?`,
          [searchData[0].id]
        );
        res.json({ products: products, total: countResult[0].total });
      } else {
        res.json({ products: [], total: 0 });
      }
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
  getByModel: async (req, res) => {
    try {
      const { term } = req.query;
      const [searchData] = await sqlPool.query(
        "select * from models where nameEn like ? or nameGe like ? or nameRu like ? LIMIT 5",
        ["%" + term + "%", "%" + term + "%", "%" + term + "%"]
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
      let [products] = await sqlPool.query(
        `Select products.id, productNameEn, productNameGe, productNameRu,productBrand, productInStock, 
        (Select imgUrl from productimages where productId=products.Id Limit 1) as imgUrl
        From products inner join models ON products.id=models.productId and models.nameEn=? LIMIT ? OFFSET ?`,
        [term, parseInt(perPage), (page - 1) * perPage]
      );

      for (let i = 0; i < products.length; i++) {
        products[i].prices = [];
        const [models] = await sqlPool.query(
          "select * from models where productId=?", // and nameEn=?
          [products[i].id, term]
        );
        if (models.length > 0) {
          products[i].modelInfo = models;
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
                products[i].prices.push(
                  sizes[k].discount === 1 ? sizes[k].newPrice : sizes[k].price
                );
              }
            }
          }
          products[i].viewInfo = models.sort(compareModels)[0];
        }
      }
      const [total] = await sqlPool.query(
        `Select count(*) as total  from products inner join models ON products.id=models.productId and models.nameEn=?`,
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
          `Select products.id, productNameEn, productNameGe, productNameRu,productBrand, productInStock, 
        (Select imgUrl from productimages where productId=products.Id Limit 1) as imgUrl
        From products inner join productcategories on products.id=productcategories.productId where productcategories.categoryId=? LIMIT ? OFFSET ?`,
          [catId[0].id, parseInt(perPage), (page - 1) * perPage]
        );

        for (let i = 0; i < products.length; i++) {
          products[i].prices = [];
          const [models] = await sqlPool.query(
            "select * from models where productId=?",
            [products[i].id]
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
                  products[i].prices.push(
                    sizes[k].discount === 1 ? sizes[k].newPrice : sizes[k].price
                  );
                }
              }
            }
            products[i].viewInfo = models.sort(compareModels)[0];
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
  getGeneral: async (req, res) => {
    try {
      const { term } = req.query;
      const terms = term.split(" ").filter(Boolean);

      const lastTerm = terms[terms.length - 1];

      const [resultBrands] = await sqlPool.query(
        "SELECT id, brandName as name, 'brand' AS type FROM brands WHERE LOWER(brandName) like LOWER(?) LIMIT 3",
        ["%" + lastTerm + "%"]
      );

      const [resultModels] = await sqlPool.query(
        "SELECT id, nameEn as name, 'model' AS type FROM models WHERE LOWER(nameEn) like LOWER(?) LIMIT 3",
        ["%" + lastTerm + "%"]
      );

      const [resultCategoriesEn] = await sqlPool.query(
        "SELECT id, nameEn as name, 'category' AS type FROM categories WHERE LOWER(nameEn) like LOWER(?) LIMIT 3",
        ["%" + lastTerm + "%"]
      );

      const [resultCategoriesGe] = await sqlPool.query(
        "SELECT id, nameGe as name, 'category' AS type FROM categories WHERE LOWER(nameGe) like LOWER(?) LIMIT 3",
        ["%" + lastTerm + "%"]
      );

      const [resultCategoriesRu] = await sqlPool.query(
        "select id, nameRu name, 'category' AS type from categories where LOWER(nameRu) like LOWER(?) LIMIT 3",
        ["%" + lastTerm + "%"]
      );

      res.json({
        searchData: [
          ...resultBrands,
          ...resultModels,
          ...resultCategoriesEn,
          ...resultCategoriesGe,
          ...resultCategoriesRu,
        ],
      });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
  getGeneralProducts: async (req, res) => {
    try {
      const { term, page, perPage } = req.query;
      const terms = term.trim().split(/\s+/).filter(Boolean);

      const whereClause = terms
        .map(
          () => `
        (Lower(categories.nameEn) like Lower(?) or Lower(categories.nameGe) like Lower(?) or Lower(categories.nameRu) like Lower(?)
              or Lower(brands.brandName) like Lower(?) or Lower(models.nameEn) like Lower(?))
      `
        )
        .join(" AND ");
      const queryString = `Select DISTINCT products.id, productNameEn, productNameGe, productNameRu,productBrand, productInStock, 
              (Select imgUrl from productimages where productId=products.Id Limit 1) as imgUrl
              From products inner join productcategories ON products.id=productcategories.productId 
              inner join categories on categories.id=productcategories.categoryId
              inner join models on products.id=models.productId 
              inner join brands on products.productBrand=brands.id
              inner join modelsizes on modelsizes.modelId=models.id
              where ${whereClause} and products.productInStock=1 LIMIT ? OFFSET ?`;

      let [products] = await sqlPool.query(queryString, [
        ...terms.flatMap((t) => Array(5).fill(`%${t}%`)),
        parseInt(perPage),
        (page - 1) * perPage,
      ]);

      for (let i = 0; i < products.length; i++) {
        products[i].prices = [];
        const [models] = await sqlPool.query(
          "select * from models where productId=?",
          [products[i].id]
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
                products[i].prices.push(
                  sizes[k].discount === 1 ? sizes[k].newPrice : sizes[k].price
                );
              }
            }
          }
          products[i].viewInfo = models.sort(compareModels)[0];
        }
      }

      const queryStringTotal = `Select count(DISTINCT products.id) as total
              From products inner join productcategories ON products.id=productcategories.productId 
              inner join categories on categories.id=productcategories.categoryId
              inner join models on products.id=models.productId 
              inner join brands on products.productBrand=brands.id
              inner join modelsizes on modelsizes.modelId=models.id
              where ${whereClause} and products.productInStock=1`;
      let [total] = await sqlPool.query(
        queryStringTotal,
        terms.flatMap((t) => Array(5).fill(`%${t}%`))
      );

      res.json({
        products: products,
        total: total[0].total,
      });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
};

module.exports = seaechController;
