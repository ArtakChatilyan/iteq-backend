const sqlPool = require("../database");

const chatService = {
  getChatHistory: async (userId) => {
    try {
      const [rows] = await sqlPool.query(
        "SELECT id, user_id as userId, sender, message, created_at as time  FROM messages WHERE user_id=? ORDER BY created_at ASC",
        [userId]
      );
      return rows;
    } catch (error) {
      console.log(error);
    }
  },
  addChatMessage: async (msg) => {
    const  {
    userId,
    sender,
    message,
    time,
    is_seen
  }=msg;
  const mysqlDatetime = new Date().toISOString().slice(0, 19).replace("T", " ");
    await sqlPool.query(
      "INSERT INTO messages (user_id, sender, message, created_at, is_seen) VALUES (?, ?, ?, ?, ?)",
      [userId, sender, message, time, is_seen ? 1 : 0]
    );
  },
  
};

module.exports = chatService;
