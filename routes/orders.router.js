const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orders.controller");

router.get("/", orderController.getOrders);
router.get("/byClient", orderController.getUserOrders);
router.post("/", orderController.closeOrder);
router.get("/history", orderController.getHistory);
router.get("/history/byClient", orderController.getUserHistory);

module.exports = router;
