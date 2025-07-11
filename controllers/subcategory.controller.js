const sqlPool = require("../database");

const subcategoryController = {
  getSubCategories: async (req, res) => {
    try {
      const [rows] = await sqlPool.query(
        'select categories.id, categories.nameEn, categories.nameGe, categories.nameRu,(select nameEn from categories where id=? LIMIT 1) from categories where parentId=? LIMIT ? OFFSET ?',
        [
          req.query.parentId,
          req.query.parentId,
          parseInt(req.query.perPage),
          (parseInt(req.query.page) - 1) * parseInt(req.query.perPage),
        ]
      );

      const [rowsCount] = await sqlPool.query(
        "select count(*) as total from categories where parentId=?",
        [req.query.parentId]
      );
      res.json({ data: rows, total: rowsCount[0].total });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  getSubCategory: async (req, res) => {
    try {
      const [rows] = await sqlPool.query(
        `Select * From categories WHERE id=?`,
        [req.params.id]
      );
      res.json({ data: rows[0] });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  addSubCategory: async (req, res) => {
    try {
      const { nameEn, nameGe, nameRu, onTop, parent } = req.body.data;
      const [result] = await sqlPool.query(
        `INSERT INTO categories(nameEn, nameGe, nameRu, parentId, onTop) VALUES (?,?,?,?,?)`,
        [nameEn, nameGe, nameRu, req.body.parentId, onTop]
      );
      res.json({ id: result.insertId });
    } catch (error) {
      console.log(error);
      return { state: error };
    }
  },

  updateSubCategory: async (req, res) => {
    try {
      const { nameEn, nameGe, nameRu, onTop } = req.body;
      const { id } = req.params;
      const [result] = await sqlPool.query(
        `UPDATE categories SET nameEn=?, nameGe=?, nameRu=?, onTop=? WHERE id=?`,
        [nameEn, nameGe, nameRu, onTop, id]
      );

      const rows = await sqlPool.query(`Select * From categories WHERE id=?`, [
        id,
      ]);
      res.json({ data: rows[0] });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  deleteSubCategory: async (req, res) => {
    try {
      const { id } = req.params;

      const [categoryInfo] = await sqlPool.query(
        "select Count(*) as count from categories where parentId=?",
        [id]
      );
      if (categoryInfo[0].count > 0) {
        res.json({ message: "Category contains sub categories!" });
      } else {
        await sqlPool.query(
          `DELETE FROM productcategories WHERE categoryId = ?`,
          [id]
        );
        const [result] = await sqlPool.query(
          `DELETE FROM categories WHERE id = ?`,
          [id]
        );
        res.json({ data: result });
      }
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
  getParents: async (req, res) => {
    let { id } = req.params;
    const result = [];
    let rows = await sqlPool.query("select * from categories where id=?", id);

    while (rows[0].length > 0) {
      result.push({ id: rows[0][0].id, name: rows[0][0].nameEn });
      rows = await sqlPool.query("select * from categories where id=?", [
        rows[0][0].parentId,
      ]);
    }
    res.json({ result: result });
  },
};

module.exports = subcategoryController;
