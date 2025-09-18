const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orders.controller");

router.get("/", orderController.getOrders);
router.get("/byClient", orderController.getUserOrders);
router.post("/close", orderController.closeOrder);
router.post("/cancel", orderController.cancelOrder);
router.get("/history", orderController.getHistory);
router.get("/history/byClient", orderController.getUserHistory);

module.exports = router;
