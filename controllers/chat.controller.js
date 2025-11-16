const fs = require("fs");
const path = require("path");
const sqlPool = require("../database");

const chatController = {
  getMessages: async (req, res) => {
    try {
      const [rows] = await db.query(`
    SELECT user_id, 
           MAX(created_at) as last_time,
           SUBSTRING_INDEX(GROUP_CONCAT(message ORDER BY created_at DESC SEPARATOR '||'), '||', 1) as last_message
    FROM messages
    GROUP BY user_id
    ORDER BY last_time DESC
  `);
      res.json({ users: rows });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  getUserMessages: async (req, res) => {
    try {
      const [rows] = await db.query(
        "SELECT * FROM messages WHERE user_id=? ORDER BY created_at ASC",
        [req.params.userId]
      );
      res.json({messages:rows});
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  getBrand: async (req, res) => {
    try {
      //   const [rows] = await sqlPool.query(`Select * From brands WHERE id=?`, [
      //     req.params.id,
      //   ]);
      //   res.json({ data: rows[0] });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  addBrand: async (req, res) => {
    try {
      //   const imgUrl =
      //     req.protocol + "://" + req.get("host") + "/brands/" + req.file.filename;
      //   const { brandName, brandUrl } = req.body;
      //   const [result] = await sqlPool.query(
      //     `INSERT INTO brands(brandName, brandUrl, imgUrl) VALUES (?,?,?)`,
      //     [brandName, brandUrl, imgUrl]
      //   );
      //   res.json({ id: result.insertId });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  updateBrand: async (req, res) => {
    try {
      //   const imgUrl = req.file
      //     ? req.protocol +
      //       "://" +
      //       req.get("host") +
      //       "/brands/" +
      //       req.file.filename
      //     : "";
      //   const { brandName, brandUrl } = req.body;
      //   const { id } = req.params;
      //   if (imgUrl) {
      //     const [images] = await sqlPool.query(
      //       `Select imgUrl FROM brands WHERE id = ?`,
      //       [id]
      //     );
      //     if (fs.existsSync("./brands/" + path.basename(images[0].imgUrl))) {
      //       fs.unlink("./brands/" + path.basename(images[0].imgUrl), (err) => {
      //         if (err) {
      //           console.error(`Error removing file: ${err}`);
      //           return;
      //         }
      //       });
      //     }
      //     const [result] = await sqlPool.query(
      //       `UPDATE brands SET brandName=?, brandUrl=?, imgUrl=? WHERE id=?`,
      //       [brandName, brandUrl, imgUrl, id]
      //     );
      //   } else {
      //     const [result] = await sqlPool.query(
      //       `UPDATE brands SET brandName=?, brandUrl=? WHERE id=?`,
      //       [brandName, brandUrl, id]
      //     );
      //   }
      //   const rows = await sqlPool.query(`Select * From brands WHERE id=?`, [id]);
      //   res.json({ data: rows[0] });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  deleteBrand: async (req, res) => {
    try {
      //   const { id } = req.params;
      //   const [brandInfo] = await sqlPool.query(
      //     "select Count(*) as count from products where productBrand=?",
      //     [id]
      //   );
      //   if (brandInfo[0].count > 0) {
      //     return { message: "Some products belong to this brand!" };
      //   } else {
      //     const [images] = await sqlPool.query(
      //       `Select imgUrl FROM brands WHERE id = ?`,
      //       [id]
      //     );
      //     if (fs.existsSync("./brands/" + path.basename(images[0].imgUrl))) {
      //       fs.unlink("./brands/" + path.basename(images[0].imgUrl), (err) => {
      //         if (err) {
      //           console.error(`Error removing file: ${err}`);
      //           return;
      //         }
      //       });
      //     }
      //     const [result] = await sqlPool.query(
      //       `DELETE FROM brands WHERE id = ?`,
      //       [id]
      //     );
      //     res.json({ data: result });
      //  }
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
};

module.exports = chatController;
