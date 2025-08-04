const sqlPool = require("../database");

const basketController = {
  getUserBasket: async (req, res) => {
    try {
      const page = parseInt(req.query.page);
      const perPage = parseInt(req.query.perPage);
      const userId = parseInt(req.query.userId);
      let basketImage = null;

      const [basketList] = await sqlPool.query(
        "select * from basket where userId=? and itemType=0 LIMIT ? OFFSET ?",
        [userId, perPage, (page - 1) * perPage]
      );
      const [listCount] = await sqlPool.query(
        "Select count(*) as total From basket where userId=? and itemType=0",
        [userId]
      );
      for (let i = 0; i < basketList.length; i++) {
        const [productInfo] = await sqlPool.query(
          `select products.id as productId, products.productNameEn,products.productNameGe, products.productNameRu, 
            brands.id as brandId, brands.brandName from products inner join brands on products.productBrand=brands.id where products.id=?`,
          [basketList[i].productId]
        );
        basketList[i].productInfo = productInfo;
        const [basketImages] = await sqlPool.query(
          `select productimages.id, productId, imgUrl from productimages inner join imagecolorsize on 
          productimages.id=imagecolorsize.imageId where modelId=? and sizeId=? and colorId=?`,
          [basketList[i].modelId, basketList[i].sizeId, basketList[i].colorId]
        );
        const [modelInfo] = await sqlPool.query(
          `select models.id as modelId, models.nameEn as modelNameEn, models.nameGe as modelNameGe, models.nameRu as modelNameRu, 
          modelsizes.id as sizeId, dimension, weight, price, discount, newPrice, count,  
          colors.id as colorId, colors.nameEn as colorNameEn, colors.nameGe as colorNameGe, colors.nameRu as colorNameRu 
          from models inner join modelsizes on models.id=modelsizes.modelId 
          inner join modelcolors on models.id=modelcolors.modelId 
          inner join colors on modelcolors.colorId=colors.id where productId=? and models.id=?`,
          [basketList[i].productId, basketList[i].modelId]
        );
        if (basketList[i].colorId > 0 && basketList[i].sizeId > 0) {
          basketList[i].modelInfo = modelInfo.find(
            (m) =>
              m.colorId === basketList[i].colorId &&
              m.sizeId === basketList[i].sizeId
          );
        } else if (basketList[i].sizeId > 0) {
          basketList[i].modelInfo = modelInfo.find(
            (m) => m.sizeId === basketList[i].sizeId
          );
        } else if (basketList[i].colorId > 0) {
          basketList[i].modelInfo = modelInfo.find(
            (m) => m.colorId === basketList[i].colorId
          );
        } else {
          basketList[i].modelInfo = modelInfo.find(
            (m) => m.modelId === basketList[i].modelId
          );
        }
        //basketList[i].modelInfo = modelInfo;

        if (basketImages.length > 0) {
          basketImage = basketImages[0];
        } else {
          const [images] = await sqlPool.query(
            "select * from productimages where productId=?",
            [basketList[i].productId]
          );
          if (images.length > 0) basketImage = images[0];
        }
        basketList[i].image = basketImage;
      }
      res.json({ basketList: basketList, total: listCount[0].total });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  getUserTotal: async (req, res) => {
    try {
      const userId = req.params.userId;
      const [rowsCount] = await sqlPool.query(
        "Select count(*) as total From basket where userId=? and itemType=0",
        [userId]
      );
      res.json({ total: rowsCount[0].total });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  getBasket: async (req, res) => {
    try {
      const [rows] = await sqlPool.query(`Select * From basket WHERE id=?`, [
        req.params.id,
      ]);
      res.json({ basket: rows[0] });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  updateBasketCount: async (req, res) => {
    try {
      const { basketId, count } = req.body;
      const [result] = await sqlPool.query(
        "update basket set count=? where id=?",
        [count, basketId]
      );
      res.json({ result: result });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  addBasket: async (req, res) => {
    try {
      const { userId, productId, modelId, sizeId, colorId, count } = req.body;
      const [checkBasket] = await sqlPool.query(
        "select * from basket where userId=? and productId=? and modelId=? and sizeId=? and colorId=?",
        [userId, productId, modelId, sizeId, colorId]
      );
      if (checkBasket.length > 0) {
        res.json({ state: "The product is already exists in your basket list." });
      } else {
        const [result] = await sqlPool.query(
          `INSERT INTO basket(userId, productId, modelId, sizeId, colorId, count) VALUES (?,?,?,?,?,?)`,
          [userId, productId, modelId, sizeId, colorId, count]
        );
        res.json({ id: result.insertId });
      }
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  deleteBasket: async (req, res) => {
    try {
      const { id } = req.params;

      const [result] = await sqlPool.query(`DELETE FROM basket WHERE id = ?`, [
        id,
      ]);
      res.json({ data: result });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
};

module.exports = basketController;
