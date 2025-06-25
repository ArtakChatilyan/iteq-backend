const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const multer  = require('multer')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "portfolio/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });
const portfolioController = require("../controllers/portfolio.controller");

router.get('/', portfolioController.getPorfolios);

router.get('/:id', portfolioController.getPortfolio);

router.post('/', portfolioController.addPortfolio);

router.put('/:id', portfolioController.updatePortfolio);

router.delete('/:id', portfolioController.deletePortfolio);

router.get('/portfolioImages/:id', portfolioController.getPortfolioImages);

router.post('/portfolioImages',upload.single("imgUrl"), portfolioController.addPortfolioImage);

router.delete('/portfolioImages/:id', portfolioController.deletePortfolioImage);

router.get('/portfolioOptions/:id', portfolioController.getPortfolioOptions);

router.get('/portfolioOption/:id', portfolioController.getPortfolioOption);

router.post('/portfolioOptions', portfolioController.addPortfolioOption); // need portfolio Id

router.put('/portfolioOption/:id', portfolioController.updatePortfolioOption);

router.delete('/portfolioOptions/:id', portfolioController.deletePortfolioOption);

module.exports=router;