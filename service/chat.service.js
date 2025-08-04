const sqlPool = require("../database");

const chatService = {
  addChat: async (chatItem) => {
    const { roomId, message, messageType, messageTime } = chatItem;
    try {
      const [rows] = await sqlPool.query(
        "INSERT INTO chats(roomId, message, messageType, messageTime) VALUES (?,?,?, ?)",
        [roomId, message, messageType, messageTime]
      );

      return 0;
    } catch (error) {
      return -1;
    }
  },
  getChat: async () => {},
  getChats: async () => {},
  deleteChate: async () => {},
};

module.exports = chatService;
