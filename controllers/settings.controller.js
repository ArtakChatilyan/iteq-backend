const sqlPool = require("../database");

const settingsController = {
  getAbout: async (req, res) => {
    try {
      const [rows] = await sqlPool.query(
        "Select aboutEn, aboutGe, aboutRu From settings"
      );
      res.json({ about: rows[0] });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  getContacts: async (req, res) => {
    try {
      const [rows] = await sqlPool.query(
        "Select addressEn, addressGe, addressRu, email, phone From settings"
      );
      res.json({ contacts: rows[0] });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  updateAbout: async (req, res) => {
    try {
      const { aboutEn, aboutGe, aboutRu } = req.body;

      const [result] = await sqlPool.query(
        "UPDATE settings SET aboutEn=?, aboutGe=?, aboutRu=?",
        [aboutEn, aboutGe, aboutRu]
      );
      const [rows] = await sqlPool.query(
        "Select aboutEn, aboutGe, aboutRu From settings"
      );
      res.json({ about: rows[0] });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },

  updateContact: async (req, res) => {
    try {
      const { contact, value } = req.body;

      const [result] = await sqlPool.query(`UPDATE settings SET ${contact}=?`, [
        value,
      ]);
      const [rows] = await sqlPool.query(`Select ${contact} From settings`);
      res.json(rows[0]);
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
};

module.exports = settingsController;
