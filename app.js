const express = require("express");
const path = require("path");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");

//const http = require("http");
//const { Server } = require("socket.io");

//const dataAccess = require("./database");
const errorMiddleware = require("./middlewares/error-middleware.js");

//app.use(cors());

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
const questionsRouter=require("./routes/questions.router.js");
const settingsRouter = require("./routes/settings.router");
const ordersRouter=require("./routes/orders.router.js");

const userCategoryRouter = require("./routes/userCategories.router");
const userProductRouter = require("./routes/userProducts.router");
const userPortfolioRouter = require("./routes/userPortfolio.router");
const userPartnerRouter = require("./routes/userPartner.router");
const userDiscountRouter = require("./routes/userDiscounts.router.js");
const userBrandProductsRouter = require("./routes/userBrandProducts.router.js");
const userBrandsRouter = require("./routes/userBrands.router.js");
const userStoriesRouter = require("./routes/userStories.router.js");
const userQuestionsRouter=require("./routes/userQuestions.router.js");
const userSearchRouter = require("./routes/userSearch.router.js");

const userRouter = require("./routes/users.router.js");
const userBasketRouter=require("./routes/userBasket.router.js");
const userOrdersRouter=require("./routes/userOrder.router.js");
const userHistoryRouter=require("./routes/userHistory.router.js");
//const chatService = require("./service/chat.service.js");

app.use("/categories", express.static("categories"));
app.use("/products", express.static("products"));
app.use("/slides", express.static("slides"));
app.use("/portfolio", express.static("portfolio"));
app.use("/partners", express.static("partners"));
app.use("/news", express.static("news"));
app.use("/brands", express.static("brands"));
app.use("/colors", express.static("colors"));

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

// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send("Something broke!");
// });

app.use(errorMiddleware);

//const server = http.createServer(app);
// const io = new Server(server, {
//   cors: {
//     credentials: true,
//     origin: ["https://localhost:3000", "http://localhost:3000"],
//     methods: ["GET", "POST", "PUT", "DELETE"],
//   },
// });

// io.on("connection", (socket) => {
//   console.log("new user id:"+socket.id);
  
//   socket.on("send_message", (data)=>{
//     io.emit("to_admin", data);
//     console.log("data from user:"+socket.id);
//     console.log(data);
//   })
// });

// const start = () => {
//   try {
//     server.listen(8080, () => {
//       console.log("Server is running on port 8080");
//     });
//   } catch (error) {
//     console.log(error);
//   }
// };

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
