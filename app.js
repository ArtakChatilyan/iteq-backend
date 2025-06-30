const express = require("express");
const path = require("path");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dataAccess = require("./database");
const errorMiddleware = require("./middlewares/error-middleware.js");

app.use(
  cors({
    credentials: true,
    origin: "*",
    methods: ["GET, POST, PUT, DELETE"],
  })
);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

const categoryRouter = require("./routes/categories.router");
const subCategoryRouter = require("./routes/subcategories.router");
const brandRouter = require("./routes/brands.router");
const productRouter = require("./routes/products.router");
const colorRouter = require("./routes/color.router");
const sliderRouter = require("./routes/slider.router");
const partnerRouter = require("./routes/partners.router");
const portfolioRouter = require("./routes/portfolio.router");
const newsRouter = require("./routes/news.router");
const settingsRouter = require("./routes/settings.router");

const userCategoryRouter = require("./routes/userCategories.router");
const userProductRouter = require("./routes/userProducts.router");
const userPortfolioRouter = require("./routes/userPortfolio.router");
const userPartnerRouter = require("./routes/userPartner.router");
const userDiscountRouter = require("./routes/userDiscounts.router.js");
const userBrandsRouter = require("./routes/userBrands.router.js");
const userStoriesRouter = require("./routes/userStories.router.js");
const userSearchRouter = require("./routes/userSearch.router.js");

const userRouter = require("./routes/users.router.js");

app.use("/products", express.static("products"));
app.use("/categories", express.static("categories"));
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
app.use("/api/v1/colors", colorRouter);
app.use("/api/v1/slides", sliderRouter);
app.use("/api/v1/partners", partnerRouter);
app.use("/api/v1/portfolio", portfolioRouter);
app.use("/api/v1/news", newsRouter);
app.use("/api/v1/settings", settingsRouter);

app.use("/api/v1/user/categories", userCategoryRouter);
app.use("/api/v1/user/products", userProductRouter);
app.use("/api/v1/user/portfolio", userPortfolioRouter);
app.use("/api/v1/user/partners", userPartnerRouter);
app.use("/api/v1/user/discounts", userDiscountRouter);
app.use("/api/v1/user/brands", userBrandsRouter);
app.use("/api/v1/user/stories", userStoriesRouter);
app.use("/api/v1/user/search", userSearchRouter);

// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send("Something broke!");
// });

app.use(errorMiddleware);

const start = () => {
  try {
    app.listen(8080, () => {
      console.log("Server is running on port 8080");
    });
  } catch (error) {
    console.log(error);
  }
};

start();
