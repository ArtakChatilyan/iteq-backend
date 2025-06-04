const sqlPool = require("../database");

const productController = {
  getProducts: async (req, res) => {
    try {
      const { catId, brands, minPrice, maxPrice, page, perPage } = req.query;
      let newMinPrice = 0;
      let newMaxPrice = 0;
      let brandIds = [];
      let priceFilteredProducts = [];

      if (brands.length > 0) {
        brandIds = brands.split(",");
      }
      // const [products] = await sqlPool.query(
      //   `Select products.id, productNameEn, productNameGe, productNameRu, productModel, productPrice, productInStock, productDiscount, productNewPrice,
      //   (Select imgUrl from productimages where productId=products.Id Limit 1) as imgUrl
      //   From products inner join productcategories ON products.id=productcategories.productId and productcategories.categoryId=? LIMIT ? OFFSET ?`,
      //   [catId, perPage, (page - 1) * perPage]
      // );

      const [products] = await sqlPool.query(
        `Select products.id, productNameEn, productNameGe, productNameRu, productModel, productPrice, productInStock, productDiscount, productNewPrice, 
        (Select imgUrl from productimages where productId=products.Id Limit 1) as imgUrl
        From products inner join productcategories ON products.id=productcategories.productId and productcategories.categoryId=?`,
        [catId]
      );

      if (brandIds.length > 0) {
        products = products.filter((p) => brandIds.includes(p.productBrand));
      }

      if (minPrice > -1) {
        for (let i = 0; i < products.length; i++) {
          let currentPrices = [];
          if (products[i].productMultyDimension === 1) {
            const [sizes] = await sqlPool.query(
              "select * from productsizes where productId=?",
              [products[i].id]
            );
            sizes.forEach((s) => {
              if (s.discount === 1) {
                currentPrices.push(s.newPrice);
                if (newMinPrice > s.newPrice) newMinPrice = s.newPrice;
                if (newMaxPrice < s.newPrice) newMaxPrice = s.newPrice;
              } else {
                currentPrices.push(s.price);
                if (newMinPrice > s.price) newMinPrice = s.price;
                if (newMaxPrice < s.price) newMaxPrice = s.price;
              }
            });
          } else {
            if (products[i].productDiscount === 1) {
              currentPrices.push(products[i].productNewPrice);
              if (newMinPrice > products[i].productNewPrice)
                newMinPrice = products[i].productNewPrice;
              if (newMaxPrice < products[i].productNewPrice)
                newMaxPrice = products[i].productNewPrice;
            } else {
              currentPrices.push(products[i].productPrice);
              if (newMinPrice > products[i].productPrice)
                newMinPrice = products[i].productPrice;
              if (newMaxPrice < products[i].productPrice)
                newMaxPrice = products[i].productPrice;
            }
          }
          if (currentPrices.some((p) => p >= minPrice && p <= maxPrice))
            priceFilteredProducts.push(products[i]);
        }
      } else {
        for (let i = 0; i < products.length; i++) {
          if (products[i].productMultyDimension === 1) {
            const [sizes] = await sqlPool.query(
              "select * from productsizes where productId=?",
              [products[i].id]
            );
            sizes.forEach((s) => {
              if (s.discount === 1) {
                if (newMinPrice > s.newPrice) newMinPrice = s.newPrice;
                if (newMaxPrice < s.newPrice) newMaxPrice = s.newPrice;
              } else {
                if (newMinPrice > s.price) newMinPrice = s.price;
                if (newMaxPrice < s.price) newMaxPrice = s.price;
              }
            });
          } else {
            if (products[i].productDiscount === 1) {
              if (newMinPrice > products[i].productNewPrice)
                newMinPrice = products[i].productNewPrice;
              if (newMaxPrice < products[i].productNewPrice)
                newMaxPrice = products[i].productNewPrice;
            } else {
              if (newMinPrice > products[i].productPrice)
                newMinPrice = products[i].productPrice;
              if (newMaxPrice < products[i].productPrice)
                newMaxPrice = products[i].productPrice;
            }
          }
        }
      }

      const total =
        minPrice > -1 ? priceFilteredProducts.length : products.length;
      const result =
        minPrice > -1 > 0
          ? priceFilteredProducts.slice((page - 1) * perPage, page * perPage)
          : products.slice((page - 1) * perPage, page * perPage);

      res.json({
        products: result,
        total: total,
        minPrice: newMinPrice,
        maxPrice: newMaxPrice,
      });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }

    // try {
    //   let result, resultCount, resultPrice;
    //   let query, queryCount, queryPrice, brandIds;
    //   const { brands, minPrice, maxPrice } = req.query;

    //   let priceStatement = "";
    //   if (minPrice > -1) {
    //     // if multidimension
    //     priceStatement = ` and products.productPrice>=${minPrice} and products.productPrice<=${maxPrice} `;
    //   }

    //   if (brands.length > 0) {
    //     brandIds = brands.split(",");
    //     let brandStatement = "?";

    //     for (let i = 1; i < brandIds.length; i++) brandStatement += ",?";

    //     query = `Select products.id, productNameEn, productNameGe, productNameRu, productModel, productPrice, productInStock, productDiscount, productNewPrice,
    //     (Select imgUrl from productimages where productId=products.Id Limit 1) as imgUrl
    //     From products inner join productcategories ON products.id=productcategories.productId and productcategories.categoryId=${
    //       req.query.catId
    //     } where products.productBrand in (${brandStatement}) ${priceStatement} LIMIT ${
    //       req.query.perPage
    //     } OFFSET ${(req.query.page - 1) * req.query.perPage}`;

    //     queryCount = `Select count(*) as total From products inner join productcategories ON products.id=productcategories.productId and productcategories.categoryId=${req.query.catId} where products.productBrand in (${brandStatement}) ${priceStatement}`;
    //     queryPrice = `Select MIN(productPrice) as minPrice,MAX(productPrice) as maxPrice  From products inner join productcategories ON products.id=productcategories.productId and productcategories.categoryId=${req.query.catId} where products.productBrand in (${brandStatement})`;

    //     result = await sqlPool.query(query, [
    //       ...brandIds.map((i) => parseInt(i)),
    //     ]);
    //     resultCount = await sqlPool.query(queryCount, [
    //       ...brandIds.map((i) => parseInt(i)),
    //     ]);
    //     resultPrice = await sqlPool.query(queryPrice, [
    //       ...brandIds.map((i) => parseInt(i)),
    //     ]);
    //   } else {
    //     query = `Select products.id, productNameEn, productNameGe, productNameRu, productModel, productPrice, productInStock, productDiscount, productNewPrice, (Select imgUrl from productimages where productId=products.Id Limit 1) as imgUrl
    //     From products inner join productcategories ON products.id=productcategories.productId and productcategories.categoryId=${
    //       req.query.catId
    //     } ${priceStatement}  LIMIT ${req.query.perPage} OFFSET ${
    //       (req.query.page - 1) * req.query.perPage
    //     }`;

    //     queryCount = `Select count(*) as total From products inner join productcategories ON products.id=productcategories.productId and productcategories.categoryId=${req.query.catId} ${priceStatement}`;
    //     queryPrice = `Select MIN(productPrice) as minPrice,MAX(productPrice) as maxPrice  From products inner join productcategories ON products.id=productcategories.productId and productcategories.categoryId=${req.query.catId}`;
    //     result = await sqlPool.query(query);
    //     resultCount = await sqlPool.query(queryCount);
    //     resultPrice = await sqlPool.query(queryPrice);
    //   }

    //   res.json({
    //     products: result[0],
    //     total: resultCount[0][0].total,
    //     minPrice: resultPrice[0][0].minPrice,
    //     maxPrice: resultPrice[0][0].maxPrice,
    //   });
    // } catch (error) {
    //   console.log(error);
    //   res.json({ state: error });
    // }
  },
  getProductCategories: async (req, res) => {
    try {
      const [categories] = await sqlPool.query(
        "Select * from categories inner join productcategories on categories.id=productcategories.categoryId where productcategories.productId=? ORDER BY categories.id",
        [req.params.id]
      );

      res.json({
        categories: categories,
      });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
  getProduct: async (req, res) => {
    try {
      const [product] = await sqlPool.query(
        "Select * from products where products.id=?",
        [req.params.id]
      );

      const [brand] = await sqlPool.query(
        "Select * from brands where brands.id=?",
        [product[0].productBrand]
      );
      // const [product] = await sqlPool.query(`Select *, brandName, brandUrl From products inner join brands on products.productBrand=brands.id WHERE products.id=?`, [
      //   req.params.id,
      // ]);
      const [images] = await sqlPool.query(
        `Select * From productimages WHERE productId=?`,
        [req.params.id]
      );
      const [sizes] = await sqlPool.query(
        `Select * From productsizes WHERE productId=?`,
        [req.params.id]
      );

      res.json({
        product: product[0],
        brand: brand[0],
        images: images,
        sizes: sizes,
      });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
};

module.exports = productController;
