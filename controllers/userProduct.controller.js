const sqlPool = require("../database");

const compareModels = (model1, model2) => {
  const minPrice1 = model1.viewInfo.discount
    ? model1.viewInfo.newPrice
    : model1.viewInfo.price;
  const minPrice2 = model2.viewInfo.discount
    ? model2.viewInfo.newPrice
    : model2.viewInfo.price;
  return minPrice1 - minPrice2;
};
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
      brandIds = brandIds.map((b) => parseInt(b));

      let [products] = await sqlPool.query(
        `Select products.id, productNameEn, productNameGe, productNameRu,productBrand, productInStock, 
        (Select imgUrl from productimages where productId=products.Id Limit 1) as imgUrl
        From products inner join productcategories ON products.id=productcategories.productId and productcategories.categoryId=?`,
        [catId]
      );

      if (brandIds.length > 0) {
        products = products.filter((p) => brandIds.includes(p.productBrand));
      }

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
              [models[i].id]
            );

            if (sizes.length > 0) {
              const minDiscountSize = sizes
                .filter((s) => s.discount === 1)
                .sort((a, b) => a["newPrice"] - b["newPrice"])[0];
              const minSize = sizes
                .filter((s) => s.discount === 0)
                .sort((a, b) => a["price"] - b["price"])[0];
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

        if (products[i].prices.length > 0) {
          if (newMinPrice === 0) {
            newMinPrice = Math.min(...products[i].prices);
          } else {
            newMinPrice =
              newMinPrice > Math.min(...products[i].prices)
                ? Math.min(...products[i].prices)
                : newMinPrice;
          }
          newMaxPrice =
            newMaxPrice < Math.max(...products[i].prices)
              ? Math.max(...products[i].prices)
              : newMaxPrice;

          if (minPrice > -1) {
            if (products[i].prices.some((p) => p >= minPrice && p <= maxPrice))
              priceFilteredProducts.push(products[i]);
          }
        }
      }

      // for (let i = 0; i < products.length; i++) {
      //   if (products[i].productMultyDimension === 1) {
      //     const [sizes] = await sqlPool.query(
      //       "select * from productsizes where productId=?",
      //       [products[i].id]
      //     );
      //     if (sizes.length > 0) {
      //       const minDiscountSize = sizes
      //         .filter((s) => s.discount === 1)
      //         .sort((a, b) => a["newPrice"] - b["newPrice"])[0];
      //       const minSize = sizes
      //         .filter((s) => s.discount === 0)
      //         .sort((a, b) => a["price"] - b["price"])[0];
      //       if (!minDiscountSize) {
      //         products[i].viewInfo = minSize;
      //       } else if (!minSize) {
      //         products[i].viewInfo = minDiscountSize;
      //       } else {
      //         products[i].viewInfo =
      //           minDiscountSize.newPrice > minSize.price
      //             ? minSize
      //             : minDiscountSize;
      //       }
      //     }
      //   } else {
      //     products[i].viewInfo = {
      //       count: products[i].productCount,
      //       dimension: products[i].productDimension,
      //       weight: products[i].productWeight,
      //       discount: products[i].productDiscount,
      //       inStock: products[i].productInStock,
      //       price: products[i].productPrice,
      //       newPrice: products[i].productNewPrice,
      //     };
      //   }
      // }

      // if (minPrice > -1) {
      //   for (let i = 0; i < products.length; i++) {
      //     let currentPrices = [];
      //     if (products[i].productMultyDimension === 1) {
      //       const [sizes] = await sqlPool.query(
      //         "select * from productsizes where productId=?",
      //         [products[i].id]
      //       );
      //       sizes.forEach((s) => {
      //         if (s.discount === 1) {
      //           currentPrices.push(s.newPrice);
      //           if (newMinPrice > s.newPrice) newMinPrice = s.newPrice;
      //           if (newMaxPrice < s.newPrice) newMaxPrice = s.newPrice;
      //         } else {
      //           currentPrices.push(s.price);
      //           if (newMinPrice > s.price) newMinPrice = s.price;
      //           if (newMaxPrice < s.price) newMaxPrice = s.price;
      //         }
      //       });
      //     } else {
      //       if (products[i].productDiscount === 1) {
      //         currentPrices.push(products[i].productNewPrice);
      //         if (newMinPrice > products[i].productNewPrice)
      //           newMinPrice = products[i].productNewPrice;
      //         if (newMaxPrice < products[i].productNewPrice)
      //           newMaxPrice = products[i].productNewPrice;
      //       } else {
      //         currentPrices.push(products[i].productPrice);
      //         if (newMinPrice > products[i].productPrice)
      //           newMinPrice = products[i].productPrice;
      //         if (newMaxPrice < products[i].productPrice)
      //           newMaxPrice = products[i].productPrice;
      //       }
      //     }
      //     if (currentPrices.some((p) => p >= minPrice && p <= maxPrice))
      //       priceFilteredProducts.push(products[i]);
      //   }
      // } else {
      //   for (let i = 0; i < products.length; i++) {
      //     if (products[i].productMultyDimension === 1) {
      //       const [sizes] = await sqlPool.query(
      //         "select * from productsizes where productId=?",
      //         [products[i].id]
      //       );
      //       sizes.forEach((s) => {
      //         if (s.discount === 1) {
      //           if (newMinPrice > s.newPrice) newMinPrice = s.newPrice;
      //           if (newMaxPrice < s.newPrice) newMaxPrice = s.newPrice;
      //         } else {
      //           if (newMinPrice > s.price) newMinPrice = s.price;
      //           if (newMaxPrice < s.price) newMaxPrice = s.price;
      //         }
      //       });
      //     } else {
      //       if (products[i].productDiscount === 1) {
      //         if (newMinPrice > products[i].productNewPrice)
      //           newMinPrice = products[i].productNewPrice;
      //         if (newMaxPrice < products[i].productNewPrice)
      //           newMaxPrice = products[i].productNewPrice;
      //       } else {
      //         if (newMinPrice > products[i].productPrice)
      //           newMinPrice = products[i].productPrice;
      //         if (newMaxPrice < products[i].productPrice)
      //           newMaxPrice = products[i].productPrice;
      //       }
      //     }
      //   }
      // }

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

      const [models] = await sqlPool.query(
        "Select * from models where productId=?",
        [req.params.id]
      );

      for (let i = 0; i < models.length; i++) {
        const [colors] = await sqlPool.query(
          `Select colors.id, colors.nameEn, colors.nameGe, colors.nameRu, colors.iconUrl From colors inner join modelcolors on colors.id=modelcolors.colorId WHERE modelcolors.modelId=?`,
          [models[i].id]
        );

        const [sizes] = await sqlPool.query(
          `Select * From modelsizes WHERE modelId=?`,
          [models[i].id]
        );

        const [imageLinks]=await sqlPool.query("Select imagecolorsize.id, modelId, imageId, colorId, sizeId, imgUrl from imagecolorsize inner join productimages on productimages.id=imagecolorsize.imageId where modelId=?", models[i].id);

        const [descriptionLinks]=await sqlPool.query("Select descriptioncolorsize.id, modelId, descriptionId, colorId, sizeId, descriptionEn, descriptionGe, descriptionRu from descriptioncolorsize inner join descriptions on descriptions.id=descriptioncolorsize.descriptionId where modelId=?", models[i].id);

        
        models[i].colors=colors;
        models[i].sizes=sizes;
        models[i].imageLinks=imageLinks;
        models[i].descriptionLinks=descriptionLinks;
      }
      // const [images] = await sqlPool.query(
      //   `Select * From productimages WHERE productId=?`,
      //   [req.params.id]
      // );
      // const [colors] = await sqlPool.query(
      //   `Select colors.id, colors.nameEn, colors.nameGe, colors.nameRu, colors.iconUrl From colors inner join productcolors on colors.id=productcolors.colorId WHERE productcolors.productId=?`,
      //   [req.params.id]
      // );

      // const [sizes] = await sqlPool.query(
      //   `Select * From productsizes WHERE productId=?`,
      //   [req.params.id]
      // );

      res.json({
        product: product[0],
        brand: brand[0],
        models: models,
        // colors: colors,
        // sizes: sizes,
      });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
  getImagesDefault: async (req, res) => {
    try {
      const [images] = await sqlPool.query(
        `Select * From productimages WHERE productId=?`,
        [req.params.id]
      );
      res.json({ images: images });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
  getImagesByColor: async (req, res) => {
    try {
      const [images] = await sqlPool.query(
        `Select productimages.id, imagecolorsize.colorId, productimages.productId, productimages.imgUrl From productimages inner join imagecolorsize
        on productimages.id=imagecolorsize.imageId WHERE productimages.productId=?`,
        [req.params.id]
      );
      res.json({ images: images });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
  getImagesBySize: async (req, res) => {
    try {
      const [images] = await sqlPool.query(
        `Select productimages.id, imagecolorsize.sizeId, productimages.productId, productimages.imgUrl From productimages inner join imagecolorsize
        on productImages.id=imagecolorsize.imageId WHERE productimages.productId=?`,
        [req.params.id]
      );
      res.json({ images: images });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
  getImagesMix: async (req, res) => {
    try {
      const [images] = await sqlPool.query(
        `Select productimages.id, imagecolorsize.sizeId, imagecolorsize.colorId, productimages.productId, productimages.imgUrl From productimages inner join imagecolorsize
        on productImages.id=imagecolorsize.imageId WHERE productimages.productId=?`,
        [req.params.id]
      );
      res.json({ images: images });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
};

module.exports = productController;
