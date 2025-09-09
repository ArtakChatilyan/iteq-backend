const sqlPool = require("../database");

const orderController = {
  getOrders: async (req, res) => {
    try {
      const page = parseInt(req.query.page);
      const perPage = parseInt(req.query.perPage);
      const [orderList] = await sqlPool.query(
        `select orders.id, orders.orderId, orders.userId, orders.productId, orders.modelId, orders.sizeId, orders.colorId, 
        orders.count, orders.price, DATE_FORMAT(orderdata.orderDate, '%d-%m-%Y %H:%i:%s') AS orderDate, email 
        from orders inner join orderdata on orders.orderId=orderdata.id inner join users on orders.userId=users.userId ORDER BY orders.id DESC LIMIT ? OFFSET ?`,
        [perPage, (page - 1) * perPage]
      );
      const [listCount] = await sqlPool.query(
        "Select count(*) as total From orders"
      );
      for (let i = 0; i < orderList.length; i++) {
        const [productInfo] = await sqlPool.query(
          `select products.id as productId, products.productNameEn,products.productNameGe, products.productNameRu, 
                      brands.id as brandId, brands.brandName from products inner join brands on products.productBrand=brands.id where products.id=?`,
          [orderList[i].productId]
        );
        orderList[i].productInfo = productInfo;

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
        // const [modelInfo] = await sqlPool.query(
        //   `select models.id as modelId, models.nameEn as modelNameEn, models.nameGe as modelNameGe, models.nameRu as modelNameRu,
        //             modelsizes.id as sizeId, dimension, weight, price, discount, newPrice, count,
        //             colors.id as colorId, colors.nameEn as colorNameEn, colors.nameGe as colorNameGe, colors.nameRu as colorNameRu
        //             from models inner join modelsizes on models.id=modelsizes.modelId
        //             inner join modelcolors on models.id=modelcolors.modelId
        //             inner join colors on modelcolors.colorId=colors.id where productId=? and models.id=?`,
        //   [orderList[i].productId, orderList[i].modelId]
        // );
        // if (orderList[i].colorId > 0 && orderList[i].sizeId > 0) {
        //   orderList[i].modelInfo = modelInfo.find(
        //     (m) =>
        //       m.colorId === orderList[i].colorId &&
        //       m.sizeId === orderList[i].sizeId
        //   );
        // } else if (orderList[i].sizeId > 0) {
        //   orderList[i].modelInfo = modelInfo.find(
        //     (m) => m.sizeId === orderList[i].sizeId
        //   );
        // } else if (orderList[i].colorId > 0) {
        //   orderList[i].modelInfo = modelInfo.find(
        //     (m) => m.colorId === orderList[i].colorId
        //   );
        // } else {
        //   orderList[i].modelInfo = modelInfo.find(
        //     (m) => m.modelId === orderList[i].modelId
        //   );
        // }
      }
      res.json({ orderList: orderList, total: listCount[0].total });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
  getUserOrders: async (req, res) => {
    try {
      const page = parseInt(req.query.page);
      const perPage = parseInt(req.query.perPage);
      const userId = req.query.userId;
      const [orderList] = await sqlPool.query(
        `select orders.id, orders.orderId, orders.userId, orders.productId, orders.modelId, orders.sizeId, orders.colorId, 
        orders.count, orders.price, DATE_FORMAT(orderdata.orderDate, '%d-%m-%Y %H:%i:%s') AS orderDate, email 
        from orders inner join orderdata on orders.orderId=orderdata.id inner join users on orders.userId=users.userId 
        where orders.userId=? ORDER BY orders.id DESC LIMIT ? OFFSET ?`,
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
        // const [modelInfo] = await sqlPool.query(
        //   `select models.id as modelId, models.nameEn as modelNameEn, models.nameGe as modelNameGe, models.nameRu as modelNameRu,
        //             modelsizes.id as sizeId, dimension, weight, price, discount, newPrice, count,
        //             colors.id as colorId, colors.nameEn as colorNameEn, colors.nameGe as colorNameGe, colors.nameRu as colorNameRu
        //             from models inner join modelsizes on models.id=modelsizes.modelId
        //             inner join modelcolors on models.id=modelcolors.modelId
        //             inner join colors on modelcolors.colorId=colors.id where productId=? and models.id=?`,
        //   [orderList[i].productId, orderList[i].modelId]
        // );
        // if (orderList[i].colorId > 0 && orderList[i].sizeId > 0) {
        //   orderList[i].modelInfo = modelInfo.find(
        //     (m) =>
        //       m.colorId === orderList[i].colorId &&
        //       m.sizeId === orderList[i].sizeId
        //   );
        // } else if (orderList[i].sizeId > 0) {
        //   orderList[i].modelInfo = modelInfo.find(
        //     (m) => m.sizeId === orderList[i].sizeId
        //   );
        // } else if (orderList[i].colorId > 0) {
        //   orderList[i].modelInfo = modelInfo.find(
        //     (m) => m.colorId === orderList[i].colorId
        //   );
        // } else {
        //   orderList[i].modelInfo = modelInfo.find(
        //     (m) => m.modelId === orderList[i].modelId
        //   );
        // }
      }
      res.json({ orderList: orderList, total: listCount[0].total });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
  closeOrder: async (req, res) => {
    try {
      const { closeId, orderId } = req.body;

      const [orders] = await sqlPool.query("select * from orders where id=?", [
        closeId,
      ]);

      for (let i = 0; i < orders.length; i++) {
        await sqlPool.query(
          "INSERT INTO orderhistory(orderId, userId, productId, modelId, sizeId, colorId, count, price) VALUES (?,?,?,?,?,?,?,?)",
          [
            orders[i].orderId,
            orders[i].userId,
            orders[i].productId,
            orders[i].modelId,
            orders[i].sizeId,
            orders[i].colorId,
            orders[i].count,
            orders[i].price,
          ]
        );
        await sqlPool.query("delete from orders where id=?", [closeId]);
        const [count] = await sqlPool.query(
          "select count(*) as total from orders where orderId=?",
          [orderId]
        );
        console.log(count);

        if (count[0].total === 0) {
          await sqlPool.query("update orderdata set orderState=1 where id=?", [
            orderId,
          ]);
        }
      }
      res.json({ message: "done!" });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
  getHistory: async (req, res) => {
    try {
      const page = parseInt(req.query.page);
      const perPage = parseInt(req.query.perPage);
      const [historyList] = await sqlPool.query(
        `select orderhistory.id, orderhistory.orderId, orderhistory.userId, orderhistory.productId, orderhistory.modelId, orderhistory.sizeId, orderhistory.colorId, 
        orderhistory.count, orderhistory.price, DATE_FORMAT(orderdata.orderDate, '%d-%m-%Y %H:%i:%s') AS orderDate, email 
        from orderhistory inner join orderdata on orderhistory.orderId=orderdata.id inner join users on orderhistory.userId=users.userId ORDER BY orderhistory.id DESC LIMIT ? OFFSET ?`,
        [perPage, (page - 1) * perPage]
      );
      const [listCount] = await sqlPool.query(
        "Select count(*) as total From orderhistory"
      );
      for (let i = 0; i < historyList.length; i++) {
        const [productInfo] = await sqlPool.query(
          `select products.id as productId, products.productNameEn,products.productNameGe, products.productNameRu, 
                      brands.id as brandId, brands.brandName from products inner join brands on products.productBrand=brands.id where products.id=?`,
          [historyList[i].productId]
        );
        historyList[i].productInfo = productInfo;

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
        //             modelsizes.id as sizeId, dimension, weight, price, discount, newPrice, count,
        //             colors.id as colorId, colors.nameEn as colorNameEn, colors.nameGe as colorNameGe, colors.nameRu as colorNameRu
        //             from models inner join modelsizes on models.id=modelsizes.modelId
        //             inner join modelcolors on models.id=modelcolors.modelId
        //             inner join colors on modelcolors.colorId=colors.id where productId=? and models.id=?`,
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
      }
      res.json({ historyList: historyList, total: listCount[0].total });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
  getUserHistory: async (req, res) => {
    try {
      const page = parseInt(req.query.page);
      const perPage = parseInt(req.query.perPage);
      const userId = req.query.userId;
      const [historyList] = await sqlPool.query(
        `select orderhistory.id, orderhistory.orderId, orderhistory.userId, orderhistory.productId, orderhistory.modelId, orderhistory.sizeId, orderhistory.colorId, 
        orderhistory.count, orderhistory.price, DATE_FORMAT(orderdata.orderDate, '%d-%m-%Y %H:%i:%s') AS orderDate, email 
        from orderhistory inner join orderdata on orderhistory.orderId=orderdata.id inner join users on orderhistory.userId=users.userId 
        where orderhistory.userId=? ORDER BY orderhistory.id DESC LIMIT ? OFFSET ?`,
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
        //             modelsizes.id as sizeId, dimension, weight, price, discount, newPrice, count,
        //             colors.id as colorId, colors.nameEn as colorNameEn, colors.nameGe as colorNameGe, colors.nameRu as colorNameRu
        //             from models inner join modelsizes on models.id=modelsizes.modelId
        //             inner join modelcolors on models.id=modelcolors.modelId
        //             inner join colors on modelcolors.colorId=colors.id where productId=? and models.id=?`,
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
      }
      res.json({ historyList: historyList, total: listCount[0].total });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
};

module.exports = orderController;
