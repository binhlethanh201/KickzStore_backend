const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const verifyToken = require("../middlewares/auth");

router.delete("/:orderId", verifyToken, orderController.deleteOrder)
router.put("/:orderId/cancel", verifyToken, orderController.cancelOrder)
router.get("/detail/:orderId", verifyToken, orderController.getOrderDetail)
router.get("/:userId", verifyToken, orderController.getByUser);
router.post("/", verifyToken, orderController.createOrder);
router.get("/", verifyToken, orderController.getAll);
router.put("/:orderId/status", verifyToken, orderController.updateStatus);

module.exports = router;
