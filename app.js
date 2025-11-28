const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const https = require("https");
const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");

const app = express();
const errorMiddleware = require("./middlewares/error-middleware.js");

app.use(
  cors({
    credentials: true,
    origin: ["https://localhost:3000", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// app.use(
//   cors({
//     credentials: true,
//     origin: ["https://iteq.shop","https://www.iteq.shop"],
//     methods: ["GET", "POST", "PUT", "DELETE"],
//   })
// );

//  app.use((req, res, next) => {
//    const allowedOrigins = ['http://localhost:3000', 'https://iteq.shop','https://www.iteq.shop'];
//    const origin = req.headers.origin;

//    if (allowedOrigins.includes(origin)) {
//      res.setHeader('Access-Control-Allow-Origin', origin);
//    }

//    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//    res.setHeader('Access-Control-Allow-Credentials', true);
//    next();
//  });

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

const categoryRouter = require("./routes/categories.router");
const subCategoryRouter = require("./routes/subcategories.router");
const brandRouter = require("./routes/brands.router");
const productRouter = require("./routes/products.router");
const modelRouter = require("./routes/models.router");
const colorRouter = require("./routes/color.router");
const sliderRouter = require("./routes/slider.router");
const partnerRouter = require("./routes/partners.router");
const portfolioRouter = require("./routes/portfolio.router");
const newsRouter = require("./routes/news.router");
const questionsRouter = require("./routes/questions.router.js");
const settingsRouter = require("./routes/settings.router");
const ordersRouter = require("./routes/orders.router.js");
const visitRouter = require("./routes/visits.router.js");
const chatRouter = require("./routes/chat.router.js");

const userCategoryRouter = require("./routes/userCategories.router");
const userProductRouter = require("./routes/userProducts.router");
const userPortfolioRouter = require("./routes/userPortfolio.router");
const userPartnerRouter = require("./routes/userPartner.router");
const userDiscountRouter = require("./routes/userDiscounts.router.js");
const userBrandProductsRouter = require("./routes/userBrandProducts.router.js");
const userBrandsRouter = require("./routes/userBrands.router.js");
const userStoriesRouter = require("./routes/userStories.router.js");
const userQuestionsRouter = require("./routes/userQuestions.router.js");
const userSearchRouter = require("./routes/userSearch.router.js");

const userRouter = require("./routes/users.router.js");
const userBasketRouter = require("./routes/userBasket.router.js");
const userOrdersRouter = require("./routes/userOrder.router.js");
const userHistoryRouter = require("./routes/userHistory.router.js");
const chatService = require("./service/chat.service.js");

app.use("/categories", express.static("categories"));
app.use("/products", express.static("products"));
app.use("/slides", express.static("slides"));
app.use("/portfolio", express.static("portfolio"));
app.use("/partners", express.static("partners"));
app.use("/news", express.static("news"));
app.use("/brands", express.static("brands"));
app.use("/colors", express.static("colors"));
app.use("/media", express.static("media"));

app.use("/api/v1/users", userRouter);

app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/subcategories", subCategoryRouter);
app.use("/api/v1/brands", brandRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/models", modelRouter);
app.use("/api/v1/colors", colorRouter);
app.use("/api/v1/slides", sliderRouter);
app.use("/api/v1/partners", partnerRouter);
app.use("/api/v1/portfolio", portfolioRouter);
app.use("/api/v1/news", newsRouter);
app.use("/api/v1/questions", questionsRouter);
app.use("/api/v1/settings", settingsRouter);
app.use("/api/v1/orders", ordersRouter);
app.use("/api/v1/visits", visitRouter);
app.use("/api/v1/chat", chatRouter);

app.use("/api/v1/user/categories", userCategoryRouter);
app.use("/api/v1/user/products", userProductRouter);
app.use("/api/v1/user/portfolio", userPortfolioRouter);
app.use("/api/v1/user/partners", userPartnerRouter);
app.use("/api/v1/user/discounts", userDiscountRouter);
app.use("/api/v1/user/brandProducts", userBrandProductsRouter);
app.use("/api/v1/user/brands", userBrandsRouter);
app.use("/api/v1/user/stories", userStoriesRouter);
app.use("/api/v1/user/questions", userQuestionsRouter);
app.use("/api/v1/user/search", userSearchRouter);
app.use("/api/v1/user/basket", userBasketRouter);
app.use("/api/v1/user/orders", userOrdersRouter);
app.use("/api/v1/user/history", userHistoryRouter);

app.use(errorMiddleware);

const clients = new Map();

app.get("/events/:clientId", (req, res) => {
  const { clientId } = req.params;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  clients.set(clientId, res);

  req.on("close", () => {
    clients.delete(clientId);
  });
});

app.post("/send", async (req, res) => {

  const { sender, userId, message, time, is_seen } = req.body;

  chatService.addChatMessage({
    userId,
    sender,
    message,
    time,
    is_seen,
  });

  const payload = {
    sender,
    userId,
    message,
    time: time || new Date().toISOString(),
    is_seen: is_seen ?? 0,
  };
  
  if (sender === "user") {
    const adminClient = clients.get("admin");
    if (adminClient) {
      adminClient.write(`data: ${JSON.stringify(payload)}\n\n`);
    }
  }

  if (sender === "admin") {
    const userClient = clients.get(userId);
    if (userClient) {
      userClient.write(`data: ${JSON.stringify(payload)}\n\n`);
    }
  }

  return res.json({ ok: true });
});

app.get("/connected-users", (req, res) => {
  const list = [];

  for (const [id] of clients.entries()) {
    if (id !== "admin") list.push(id);
  }

  res.json(list);
});

app.listen(3001, () =>
  console.log("SSE server running on http://localhost:3001")
);

//const server = http.createServer(app);
// const server = https.createServer({
//   key: fs.readFileSync("/etc/letsencrypt/live/iteq.shop/privkey.pem"),
//   cert: fs.readFileSync("/etc/letsencrypt/live/iteq.shop/fullchain.pem"),
// });
// const io = new Server(server, {
//   path: "/socket.io/",
//   cors: {
//     origin: [
//       "https://iteq.shop",
//       "https://www.iteq.shop",
//       "https://localhost:3000",
//       "http://localhost:3000",
//     ],
//     methods: ["GET", "POST"],
//   },
// });

// const userSockets = new Map();
// const activeUsers = new Map();

// function updateAdmins() {
//   const activeUserList = Array.from(userSockets.keys()).map((userId) => ({
//     userId,
//     lastMessage: activeUsers.get(userId)?.lastMessage || "",
//     lastTime: activeUsers.get(userId)?.lastTime || null,
//   }));

//   io.sockets.sockets.forEach((s) => {
//     if (s.role === "admin") {
//       s.emit("activeUsers", activeUserList);
//     }
//   });
// }

// io.on("connection", (socket) => {
//   socket.on("joinChat", async ({ userId, role }) => {
//     if (!userId && role === "user") {
//       userId = uuidv4();
//     }

//     socket.userId = userId;
//     socket.role = role;

//     if (role === "user") userSockets.set(userId, socket.id);

//     if (!activeUsers.has(userId)) {
//       activeUsers.set(userId, { lastMessage: "", lastTime: null });
//     }

//     updateAdmins();
//     const history = (await chatService.getChatHistory(userId)) || {
//       messages: [],
//     };
//     socket.emit("chatHistory", { userId, messages: history });
//   });

//   socket.on("sendMessage", async ({ userId, sender, message, time }) => {
//     if (sender === "user") {
//       activeUsers.set(userId, { lastMessage: message, lastTime: time });
//       updateAdmins();
//     }
//     let isSeen = false;

//     await chatService.addChatMessage({ userId, sender, message, time, isSeen });
//     const msg = { userId, sender, message, time, isSeen };

//     if (sender === "user") {
//       // Send to all admins
//       io.sockets.sockets.forEach((s) => {
//         if (s.role === "admin") s.emit("newMessage", msg);
//       });
//     } else {
//       // Admin → specific user
//       const userSocketId = userSockets.get(userId);
//       if (userSocketId) io.to(userSocketId).emit("newMessage", msg);
//     }
//   });

//   socket.on("disconnect", () => {
//     if (socket.role === "user") {
//       userSockets.delete(socket.userId);
//       activeUsers.delete(socket.userId);
//       updateAdmins();
//     }
//   });
// });

// server.listen(3001, () => console.log("Socket.io server running on port 3001"));

const start = () => {
  try {
    app.listen(8080, () => {
      console.log("Server is running on port 8080");
    });
  } catch (error) {
    //console.log(error);
  }
};

start();
