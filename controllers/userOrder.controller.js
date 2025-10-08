const sqlPool = require("../database");

const orderController = {
  getUserOrders: async (req, res) => {
    try {
      const page = parseInt(req.query.page);
      const perPage = parseInt(req.query.perPage);
      const userId = parseInt(req.query.userId);
      let orderImage = null;

      const [orderList] = await sqlPool.query(
        "select * from orders where userId=? LIMIT ? OFFSET ?",
        [userId, perPage, (page - 1) * perPage]
      );
      const [listCount] = await sqlPool.query(
        "Select count(*) as total From orders where userId=?",
        [userId]
      );
      for (let i = 0; i < orderList.length; i++) {
        const [productInfo] = await sqlPool.query(
          `select products.id as productId, products.productNameEn,products.productNameGe, products.productNameRu, 
                  brands.id as brandId, brands.brandName from products inner join brands on products.productBrand=brands.id where products.id=?`,
          [orderList[i].productId]
        );
        orderList[i].productInfo = productInfo;
        const [orderImages] = await sqlPool.query(
          `select productimages.id, productId, imgUrl from productimages inner join imagecolorsize on 
                productimages.id=imagecolorsize.imageId where modelId=? and sizeId=? and colorId=?`,
          [orderList[i].modelId, orderList[i].sizeId, orderList[i].colorId]
        );

        if (orderList[i].colorId > 0 && orderList[i].sizeId > 0) {
          const [modelInfo] = await sqlPool.query(
            `select models.id as modelId, models.nameEn as modelNameEn, models.nameGe as modelNameGe, models.nameRu as modelNameRu, 
                  modelsizes.id as sizeId, dimension, weight, price, discount, newPrice, count,  
                  colors.id as colorId, colors.nameEn as colorNameEn, colors.nameGe as colorNameGe, colors.nameRu as colorNameRu 
                  from models inner join modelsizes on models.id=modelsizes.modelId 
                  inner join modelcolors on models.id=modelcolors.modelId 
                  inner join colors on modelcolors.colorId=colors.id where productId=? and models.id=?`,
            [orderList[i].productId, orderList[i].modelId]
          );
          orderList[i].modelInfo = modelInfo.find(
            (m) =>
              m.colorId === orderList[i].colorId &&
              m.sizeId === orderList[i].sizeId
          );
        } else if (orderList[i].sizeId > 0) {
          const [modelInfo] = await sqlPool.query(
            `select models.id as modelId, models.nameEn as modelNameEn, models.nameGe as modelNameGe, models.nameRu as modelNameRu, 
                  modelsizes.id as sizeId, dimension, weight, price, discount, newPrice, count  
                  from models inner join modelsizes on models.id=modelsizes.modelId 
                   where productId=? and models.id=?`,
            [orderList[i].productId, orderList[i].modelId]
          );
          orderList[i].modelInfo = modelInfo.find(
            (m) => m.sizeId === orderList[i].sizeId
          );
        }
        if (orderImages.length > 0) {
          orderImage = orderImages[0];
        } else {
          const [images] = await sqlPool.query(
            "select * from productimages where productId=?",
            [orderList[i].productId]
          );
          if (images.length > 0) orderImage = images[0];
        }
        orderList[i].image = orderImage;
      }
      res.json({ orderList: orderList, total: listCount[0].total });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  addOrders: async (req, res) => {
    try {
      const { orders, totalPrice, orderDate } = req.body;

      const [orderID] = await sqlPool.query(
        "insert into orderdata(price, orderDate, orderState) values(?,?,?)",
        [totalPrice, orderDate, 0]
      );

      for (let i = 0; i < orders.length; i++) {
        const {
          id,
          userId,
          productId,
          modelId,
          sizeId,
          colorId,
          count,
          price,
        } = orders[i];

        await sqlPool.query(
          "INSERT INTO orders(orderId, userId, productId, modelId, sizeId, colorId, count, price) VALUES (?,?,?,?,?,?,?,?)",
          [
            orderID.insertId,
            userId,
            productId,
            modelId,
            sizeId,
            colorId,
            count,
            price,
          ]
        );

        await sqlPool.query("delete from basket where id=?", [id]);
      }
      res.json({ message: "done!" });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
  cancelOrder: async (req, res) => {
    try {
      const { orderId, actionType } = req.params;
      if (actionType == 2) {
        const [result] = await sqlPool.query(
          `UPDATE orders set state=2 where id=?`,
          [orderId]
        );
      } else if (actionType == 3) {
        
        const [currentOrder] = await sqlPool.query(
          `Select * From orders WHERE id=?`,
          [parseInt(orderId)]
        );
        const orderDataId = currentOrder.orderId;
        if (currentOrder[0].state === 0) {
          const [result] = await sqlPool.query(
            `DELETE from orders where id=?`,
            [orderId]
          );
          const [countOrders] = await sqlPool.query(
            "select count(*) as total from orders where orderId=?",
            [orderDataId]
          );
          const [countHistory] = await sqlPool.query(
            "select count(*) as total from orderhistory where orderId=?",
            [orderDataId]
          );
          if (countOrders[0].total === 0 && countHistory[0].total === 0) {
            await sqlPool.query("delete from orderdata where id=?", [
              orderDataId,
            ]);
          } else if (countOrders[0].total === 0 && countHistory[0].total > 0) {
            await sqlPool.query(
              "update orderdata set orderState=1 where id=?",
              [orderDataId]
            );
          } else {
            await sqlPool.query(
              "update orderdata set price=price-? where id=?",
              [currentOrder[0].price, orderDataId]
            );
          }
        } else if (currentOrder[0].state != 0) {
          const [result] = await sqlPool.query(
            `UPDATE orders set state=3 where id=?`,
            [orderId]
          );
        }
      }

      const rows = await sqlPool.query(`Select * From orders WHERE id=?`, [
        orderId,
      ]);
      res.json({ order: rows[0] });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
};

module.exports = orderController;
