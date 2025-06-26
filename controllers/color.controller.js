const sqlPool = require("../database");

const colorController = {
  getColors: async (req, res) => {
    try {
      const [rows] = await sqlPool.query(
        "select * from colors order by nameRu"
      );
      res.json({ colors: rows });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  getColor: async (req, res) => {
    try {
      const [rows] = await sqlPool.query(`Select * From colors WHERE id=?`, [
        req.params.id,
      ]);
      res.json({ color: rows[0] });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  addColor: async (req, res) => {
    try {
      const { nameEn, nameGe, nameRu } = req.body;
      const [result] = await sqlPool.query(
        `INSERT INTO colors(nameEn, nameGe, nameRu) VALUES (?,?,?)`,
        [nameEn, nameGe, nameRu]
      );
      res.json({ id: result.insertId });
    } catch (error) {
      console.log(error);
      return { state: error };
    }
  },

  updateColor: async (req, res) => {
    try {
      const { nameEn, nameGe, nameRu } = req.body;
      const { id } = req.params;
      const [result] = await sqlPool.query(
        `UPDATE colors SET nameEn=?, nameGe=?, nameRu=? WHERE id=?`,
        [nameEn, nameGe, nameRu, id]
      );

      const rows = await sqlPool.query(`Select * From colors WHERE id=?`, [id]);
      res.json({ color: rows[0] });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  deleteColor: async (req, res) => {
    try {
      const { id } = req.params;

      const [result] = await sqlPool.query(`DELETE FROM colors WHERE id = ?`, [
        id,
      ]);
      await sqlPool.query(`DELETE FROM imagecolorsize WHERE colorId = ?`, [
        id,
      ]);
      await sqlPool.query(`DELETE FROM productcolors WHERE colorId = ?`, [
        id,
      ]);
      res.json({ data: result });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  getProductColors: async (req, res) => {
    try {
      const [rows] = await sqlPool.query(
        `Select colors.id, nameEn, nameGe, nameRu From colors inner join productcolors on colors.id=productcolors.colorId WHERE productcolors.productId=?`,
        [req.params.id]
      );
      res.json({ colors: rows });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
};

module.exports = colorController;
