const fs = require("fs");
const path = require("path");
const sqlPool = require("../database");

const chatController = {
  getUsers: async (req, res) => {
    try {
      const [rows] = await sqlPool.query(
        `SELECT 
            user_id AS userId,
            MAX(created_at) AS lastTime,
            SUBSTRING_INDEX(GROUP_CONCAT(message ORDER BY created_at DESC), ',', 1) AS lastMessage
            FROM messages GROUP BY user_id ORDER BY lastTime DESC`
      );

      res.json({ users: rows });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
  getUserMessages: async (req, res) => {
    try {
      const [rows] = await sqlPool.query(
        "SELECT id, user_id as userId, sender, message, created_at as time FROM messages WHERE user_id=? ORDER BY created_at ASC",
        [req.params.userId]
      );

      res.json({ messages: rows });
    } catch (error) {
      console.log(error);
      res.json({ state: error });
    }
  },
  getUnreadUsers: async (req, res) => {
    try {
      const [rows] = await sqlPool.query(`
    SELECT user_id, COUNT(*) AS unread
    FROM messages
    WHERE is_seen = 0
    GROUP BY user_id
  `);

      res.json(rows);
    } catch (error) {
      console.log(error);
      res.json(error);
    }
  },
  markAsSeen: async (req, res) => {
    try {
      await sqlPool.query(
        "UPDATE messages SET is_seen = 1 WHERE user_id=? AND is_seen=0",
        [req.params.userId]
      );
      res.json("done!");
    } catch (error) {
      console.log(error);
      res.json(error);
    }
  },
};

module.exports = chatController;
