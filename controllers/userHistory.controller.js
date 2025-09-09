const sqlPool = require("../database");

const historyController = {
  getUserHistory: async (req, res) => {
    try {
      const page = parseInt(req.query.page);
      const perPage = parseInt(req.query.perPage);
      const userId = parseInt(req.query.userId);
      let historyImage = null;

      const [historyList] = await sqlPool.query(
        "select * from orderhistory where userId=? LIMIT ? OFFSET ?",
        [userId, perPage, (page - 1) * perPage]
      );
      const [listCount] = await sqlPool.query(
        "Select count(*) as total From orderhistory where userId=?",
        [userId]
      );
      for (let i = 0; i < historyList.length; i++) {
        const [productInfo] = await sqlPool.query(
          `select products.id as productId, products.productNameEn,products.productNameGe, products.productNameRu, 
                  brands.id as brandId, brands.brandName from products inner join brands on products.productBrand=brands.id where products.id=?`,
          [historyList[i].productId]
        );
        historyList[i].productInfo = productInfo;
        const [historyImages] = await sqlPool.query(
          `select productimages.id, productId, imgUrl from productimages inner join imagecolorsize on 
                productimages.id=imagecolorsize.imageId where modelId=? and sizeId=? and colorId=?`,
          [
            historyList[i].modelId,
            historyList[i].sizeId,
            historyList[i].colorId,
          ]
        );

        if (historyList[i].colorId > 0 && historyList[i].sizeId > 0) {
          const [modelInfo] = await sqlPool.query(
            `select models.id as modelId, models.nameEn as modelNameEn, models.nameGe as modelNameGe, models.nameRu as modelNameRu, 
                  modelsizes.id as sizeId, dimension, weight, price, discount, newPrice, count,  
                  colors.id as colorId, colors.nameEn as colorNameEn, colors.nameGe as colorNameGe, colors.nameRu as colorNameRu 
                  from models inner join modelsizes on models.id=modelsizes.modelId 
                  inner join modelcolors on models.id=modelcolors.modelId 
                  inner join colors on modelcolors.colorId=colors.id where productId=? and models.id=?`,
            [historyList[i].productId, historyList[i].modelId]
          );
          historyList[i].modelInfo = modelInfo.find(
            (m) =>
              m.colorId === historyList[i].colorId &&
              m.sizeId === historyList[i].sizeId
          );
        } else if (historyList[i].sizeId > 0) {
          const [modelInfo] = await sqlPool.query(
            `select models.id as modelId, models.nameEn as modelNameEn, models.nameGe as modelNameGe, models.nameRu as modelNameRu, 
                  modelsizes.id as sizeId, dimension, weight, price, discount, newPrice, count  
                  from models inner join modelsizes on models.id=modelsizes.modelId 
                   where productId=? and models.id=?`,
            [historyList[i].productId, historyList[i].modelId]
          );
          historyList[i].modelInfo = modelInfo.find(
            (m) => m.sizeId === historyList[i].sizeId
          );
        }

        // const [modelInfo] = await sqlPool.query(
        //   `select models.id as modelId, models.nameEn as modelNameEn, models.nameGe as modelNameGe, models.nameRu as modelNameRu,
        //         modelsizes.id as sizeId, dimension, weight, price, discount, newPrice, count,
        //         colors.id as colorId, colors.nameEn as colorNameEn, colors.nameGe as colorNameGe, colors.nameRu as colorNameRu
        //         from models inner join modelsizes on models.id=modelsizes.modelId
        //         inner join modelcolors on models.id=modelcolors.modelId
        //         inner join colors on modelcolors.colorId=colors.id where productId=? and models.id=?`,
        //   [historyList[i].productId, historyList[i].modelId]
        // );

        // if (historyList[i].colorId > 0 && historyList[i].sizeId > 0) {
        //   historyList[i].modelInfo = modelInfo.find(
        //     (m) =>
        //       m.colorId === historyList[i].colorId &&
        //       m.sizeId === historyList[i].sizeId
        //   );
        // } else if (historyList[i].sizeId > 0) {
        //   historyList[i].modelInfo = modelInfo.find(
        //     (m) => m.sizeId === historyList[i].sizeId
        //   );
        // } else if (historyList[i].colorId > 0) {
        //   historyList[i].modelInfo = modelInfo.find(
        //     (m) => m.colorId === historyList[i].colorId
        //   );
        // } else {
        //   historyList[i].modelInfo = modelInfo.find(
        //     (m) => m.modelId === historyList[i].modelId
        //   );
        // }

        if (historyImages.length > 0) {
          historyImage = historyImages[0];
        } else {
          const [images] = await sqlPool.query(
            "select * from productimages where productId=?",
            [historyList[i].productId]
          );
          if (images.length > 0) historyImage = images[0];
        }
        historyList[i].image = historyImage;
      }
      res.json({ historyList: historyList, total: listCount[0].total });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
};

module.exports = historyController;
