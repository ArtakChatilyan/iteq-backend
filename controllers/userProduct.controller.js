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
const productController = {
  getProducts: async (req, res) => {
    try {
      const { catId, brands, minPrice, maxPrice, page, perPage } = req.query;

      let newMinPrice = 0;
      let newMaxPrice = 0;

      let brandCondition = "";
      if (brands!=='0') {
        brandCondition = " and products.productBrand in (" + brands.split('_') + ") ";
      }

      let priceCondition = "";
      if (minPrice > -1) {
        priceCondition = `and ((modelsizes.price>=${minPrice} and modelsizes.price<=${maxPrice}) or(modelsizes.newPrice>=${minPrice} and modelsizes.newPrice<=${maxPrice} and modelsizes.newPrice>0))`;
      }

      let [MinMaxPrices] = await sqlPool.query(
        `Select MIN(modelsizes.price) as minPrice, MIN(modelsizes.newPrice) as minNewPrice,
        MAX(modelsizes.price) as maxPrice
        From products inner join productcategories ON products.id=productcategories.productId 
        inner join models on products.id=models.productId 
        inner join modelsizes on modelsizes.modelId=models.id
        where productcategories.categoryId=? ${brandCondition} and modelsizes.price>0`,
        [catId]
      );

      let [MinNewPrice] = await sqlPool.query(
        `Select MIN(modelsizes.newPrice) as minNewPrice
        From products inner join productcategories ON products.id=productcategories.productId 
        inner join models on products.id=models.productId 
        inner join modelsizes on modelsizes.modelId=models.id
        where productcategories.categoryId=? ${brandCondition} and modelsizes.newPrice>0`,
        [catId]
      );

      newMinPrice = MinNewPrice[0].minNewPrice>0
        ? Math.min(MinMaxPrices[0].minPrice, MinNewPrice[0].minNewPrice)
        : MinMaxPrices[0].minPrice;

      newMaxPrice = MinMaxPrices[0].maxPrice;

      let [products] = await sqlPool.query(
        `Select DISTINCT products.id, productNameEn, productNameGe, productNameRu,productBrand, productInStock, 
        (Select imgUrl from productimages where productId=products.Id Limit 1) as imgUrl
        From products inner join productcategories ON products.id=productcategories.productId 
        inner join models on products.id=models.productId 
        inner join modelsizes on modelsizes.modelId=models.id
        where productcategories.categoryId=? and products.productInStock=1 ${brandCondition} ${priceCondition} LIMIT ? OFFSET ?`,
        [catId, parseInt(perPage), (page - 1) * perPage]
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

      let [total] = await sqlPool.query(
        `Select count(DISTINCT products.id) as total
        From products inner join productcategories ON products.id=productcategories.productId 
        inner join models on products.id=models.productId 
        inner join modelsizes on modelsizes.modelId=models.id
        where productcategories.categoryId=? and products.productInStock=1 ${brandCondition} ${priceCondition}`,
        [catId]
      );

      res.json({
        products: products,
        total: total[0].total,
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

        const [imageLinks] = await sqlPool.query(
          "Select imagecolorsize.id, modelId, imageId, colorId, sizeId, imgUrl from imagecolorsize inner join productimages on productimages.id=imagecolorsize.imageId where modelId=?",
          models[i].id
        );

        const [descriptionLinks] = await sqlPool.query(
          "Select descriptioncolorsize.id, modelId, descriptionId, colorId, sizeId, descriptionEn, descriptionGe, descriptionRu from descriptioncolorsize inner join descriptions on descriptions.id=descriptioncolorsize.descriptionId where modelId=?",
          models[i].id
        );

        models[i].colors = colors;
        models[i].sizes = sizes;
        models[i].imageLinks = imageLinks;
        models[i].descriptionLinks = descriptionLinks;
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
