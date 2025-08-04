const sqlPool = require("../database");

const modelsController = {
  getModels: async (req, res) => {
    try {
      const [rows] = await sqlPool.query(
        "select * from models where productId=?",
        [req.query.productId]
      );

      res.json({ models: rows });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  getModel: async (req, res) => {
    try {
      const [rows] = await sqlPool.query(`Select * From models WHERE id=?`, [
        req.params.id,
      ]);
      res.json({ model: rows[0] });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  addModel: async (req, res) => {
    try {
      const { productId } = req.body;
      const { nameEn, nameGe, nameRu } = req.body.modelData;
      const [result] = await sqlPool.query(
        `INSERT INTO models(nameEn, nameGe, nameRu, productId) VALUES (?,?,?,?)`,
        [nameEn, nameGe, nameRu, productId]
      );
      res.json({ id: result.insertId });
    } catch (error) {
      console.log(error);
      return { state: error };
    }
  },

  updateModel: async (req, res) => {
    try {
      const { nameEn, nameGe, nameRu } = req.body;
      const { id } = req.params;
      const [result] = await sqlPool.query(
        `UPDATE models SET nameEn=?, nameGe=?, nameRu=? WHERE id=?`,
        [nameEn, nameGe, nameRu, id]
      );

      const rows = await sqlPool.query(`Select * From models WHERE id=?`, [id]);
      res.json({ data: rows[0] });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  deleteModel: async (req, res) => {
    try {
      const { id } = req.params;
      const [result] = await sqlPool.query(`DELETE FROM models WHERE id = ?`, [
        id,
      ]);

      await sqlPool.query("DELETE FROM modelsizes where modelId=?", [id]);
      await sqlPool.query("DELETE FROM modelcolors where modelId=?", [id]);
      await sqlPool.query("DELETE FROM imagecolorsize where modelId=?", [id]);
      await sqlPool.query("DELETE FROM descriptioncolorsize where modelId=?", [
        id,
      ]);

      res.json({ data: result });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  getModelColors: async (req, res) => {
    try {
      const [rows] = await sqlPool.query(
        `Select modelcolors.id as modelId, modelcolors.modelId, modelcolors.colorId, colors.id as colorId, colors.nameRu 
        From modelcolors inner join colors on modelcolors.colorId=colors.id WHERE modelId=?`,
        [req.params.id]
      );
      res.json({ mColors: rows });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  setModelColors: async (req, res) => {
    try {
      const { id, result } = req.body;
      await sqlPool.query(`delete from modelcolors where modelId=?`, [id]);
      for (let i = 0; i < result.length; i++) {
        await sqlPool.query(
          `insert into modelcolors(modelId, colorId) values(?,?)`,
          [id, result[i]]
        );
      }
      res.json({ message: "done!" });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  getModelSizes: async (req, res) => {
    try {
      const [rows] = await sqlPool.query(
        `Select * From modelsizes WHERE modelId=?`,
        [req.params.id]
      );
      res.json({ data: rows });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  addModelSize: async (req, res) => {
    try {
      const {
        modelId,
        dimension,
        weight,
        price,
        discount,
        newPrice,
        count,
        inStock,
      } = req.body;
      const [result] = await sqlPool.query(
        `INSERT INTO modelsizes(modelId, dimension, weight, price, 
                                  discount, newPrice, count, inStock) 
           VALUES (?,?,?,?,?,?,?,?)`,
        [modelId, dimension, weight, price, discount, newPrice, count, inStock]
      );

      res.json({ id: result.insertId });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  updateModelSize: async (req, res) => {
    try {
      const { id } = req.params;
      const { dimension, weight, price, discount, newPrice, count, inStock } =
        req.body;
      const [result] = await sqlPool.query(
        `UPDATE modelsizes SET dimension=?, weight=?, price=?, 
                                  discount=?, newPrice=?, count=?, inStock=? WHERE id=?`,
        [dimension, weight, price, discount, newPrice, count, inStock, id]
      );
      const rows = await sqlPool.query(`Select * From modelsizes WHERE id=?`, [
        id,
      ]);
      res.json({ data: rows[0] });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  getModelSize: async (req, res) => {
    try {
      const [rows] = await sqlPool.query(
        `Select * From modelsizes WHERE id=?`,
        [req.params.id]
      );
      res.json({ data: rows[0] });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  deleteModelSize: async (req, res) => {
    try {
      const { id } = req.params;
      const [result] = await sqlPool.query(
        `DELETE FROM modelsizes WHERE id =?`,
        [id]
      );
      await sqlPool.query(`DELETE FROM imagecolorsize WHERE sizeId =?`, [id]);
      res.json({ data: result });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
  getImageColorSize: async (req, res) => {
    try {
      const [rows] = await sqlPool.query(
        `Select * From imagecolorsize WHERE modelId=? and imageId=?`,
        [req.params.modelId, req.params.imageId]
      );
      res.json({ colorSize: rows });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  setImageColorSize: async (req, res) => {
    try {
      const { imageId, modelId, color, size } = req.body;

      await sqlPool.query(
        `insert into imagecolorsize(imageId, modelId, colorId, sizeId) values(?,?,?,?)`,
        [imageId, modelId, color ? color : null, size ? size : null]
      );

      res.json({ message: "done!" });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  deleteImageColorSize: async (req, res) => {
    try {
      const { id } = req.params;

      await sqlPool.query(`delete from imagecolorsize where id=?`, [id]);

      res.json({ message: "done!" });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
  getDescriptionColorSize: async (req, res) => {
    try {
      const [rows] = await sqlPool.query(
        `Select * From descriptioncolorsize WHERE modelId=? and descriptionId=?`,
        [req.params.modelId, req.params.descriptionId]
      );
      res.json({ colorSize: rows });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  setDescriptionColorSize: async (req, res) => {
    try {
      const { modelId, descriptionId, color, size } = req.body;

      await sqlPool.query(
        `insert into descriptioncolorsize(modelId, descriptionId, colorId, sizeId) values(?,?,?,?)`,
        [modelId, descriptionId, color ? color : null, size ? size : null]
      );

      res.json({ message: "done!" });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  deleteDescriptionColorSize: async (req, res) => {
    try {
      const { id } = req.params;

      await sqlPool.query(`delete from descriptioncolorsize where id=?`, [id]);

      res.json({ message: "done!" });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
};

module.exports = modelsController;
