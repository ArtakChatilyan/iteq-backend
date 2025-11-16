const sqlPool = require("../database");

const chatService = {
  getChatHistory: async (userId) => {
    try {
      const [rows] = await sqlPool.query(
        "SELECT * FROM messages WHERE user_id=? ORDER BY created_at ASC",
        [userId]
      );
      let resp={ userId, messages: rows };
      console.log(resp);
      return resp;
    } catch (error) {
      console.log(error);
    }
  },
  addChatMessage: async (userId, sender, message) => {
    await sqlPool.query(
      "INSERT INTO messages (user_id, sender, message) VALUES (?, ?, ?)",
      [userId, sender, message]
    );
  },
  // addChat: async (chatItem) => {
  //   const { roomId, message, messageType, messageTime } = chatItem;
  //   try {
  //     const [rows] = await sqlPool.query(
  //       "INSERT INTO chats(roomId, message, messageType, messageTime) VALUES (?,?,?, ?)",
  //       [roomId, message, messageType, messageTime]
  //     );

  //     return 0;
  //   } catch (error) {
  //     return -1;
  //   }
  // },
  // getChat: async () => {},
  // getChats: async () => {},
  // deleteChate: async () => {},
};

module.exports = chatService;
