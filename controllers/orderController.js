const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Voucher = require("../models/Voucher");
const Product = require("../models/Product");
const Card = require("../models/Card");
const mongoose = require("mongoose");
const moment = require("moment");
const qs = require("qs");
const crypto = require("crypto");

class OrderController {
  async getAll(req, res) {
    try {
      const orders = await Order.find()
        .populate("userId", "firstName lastName email")
        .populate("items.productId", "name price img brand");
      res.status(200).json(orders);
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error fetching orders", error: err.message });
    }
  }

  async getByUser(req, res) {
    try {
      const { userId } = req.params;
      if (req.user.id !== userId) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      const orders = await Order.find({ userId })
        .populate("items.productId", "name price img brand")
        .sort({ createdAt: -1 });

      res.status(200).json({
        message: "Get orders successfully",
        count: orders.length,
        orders,
      });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error fetching orders", error: err.message });
    }
  }

  async getOrderDetail(req, res) {
    try {
      const { orderId } = req.params;
      const userId = req.user.id;
      const order = await Order.findOne({ _id: orderId, userId: userId })
        .populate("items.productId", "name price img brand")
        .populate("cardId", "cardNumber cardName");
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.status(200).json({ message: "Get order detail successfully", order });
    } catch (err) {
      if (err.name === "CastError") {
        return res.status(400).json({ message: "Invalid order ID format" });
      }
      res
        .status(500)
        .json({ message: "Error fetching order detail", error: err.message });
    }
  }

  async createOrder(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const userId = req.user.id;
      const {
        selectedItems,
        shippingMethod,
        address,
        paymentMethod,
        voucherCode,
        cardId,
        cvv,
      } = req.body;

      if (!selectedItems || selectedItems.length === 0) {
        return res
          .status(400)
          .json({ message: "No items selected for checkout" });
      }

      const cart = await Cart.findOne({ userId })
        .session(session)
        .populate("items.productId");
      if (!cart) return res.status(404).json({ message: "Cart not found" });

      const orderItems = [];
      let totalPrice = 0;
      const stockUpdates = [];

      for (const item of selectedItems) {
        const found = cart.items.find(
          (ci) =>
            ci.productId._id.toString() === item.productId &&
            ci.size === item.size &&
            ci.color === item.color,
        );

        if (!found)
          throw new Error(`Item ${item.productId} not found in cart.`);
        const product = await Product.findById(found.productId._id).session(
          session,
        );
        if (!product)
          throw new Error(`Product ${found.productId.name} not found.`);
        if (product.quantity < found.quantity) {
          throw new Error(
            `Not enough stock for ${product.name}. Only ${product.quantity} left.`,
          );
        }
        totalPrice += found.productId.price * found.quantity;
        orderItems.push({
          productId: found.productId._id,
          quantity: found.quantity,
          price: found.productId.price,
        });
        stockUpdates.push({
          updateOne: {
            filter: { _id: product._id },
            update: { $inc: { quantity: -found.quantity } },
          },
        });
      }

      let discount = 0;
      if (voucherCode) {
        const voucher = await Voucher.findOne({
          code: voucherCode,
          isActive: true,
          startDate: { $lte: new Date() },
          endDate: { $gte: new Date() },
        }).session(session);

        if (!voucher)
          return res
            .status(400)
            .json({ message: "Invalid or expired voucher" });
        if (totalPrice < voucher.minOrderValue) {
          return res
            .status(400)
            .json({
              message: `Order must be at least $${voucher.minOrderValue} to use voucher`,
            });
        }
        discount =
          voucher.discountType === "percent"
            ? (totalPrice * voucher.discountValue) / 100
            : voucher.discountValue;
        if (discount > totalPrice) discount = totalPrice;
      }

      const shippingFee = shippingMethod === "express" ? 5 : 0;
      const finalPrice = totalPrice - discount + shippingFee;

      let initialStatus = "pending";
      let paymentCardId = undefined;

      if (paymentMethod === "credit_card") {
        if (!cardId) {
          throw new Error("Please select a card for payment.");
        }
        if (!cvv) {
          throw new Error("Please enter CVV/Password to confirm payment.");
        }

        const card = await Card.findOne({ _id: cardId, userId }).session(
          session,
        );
        if (!card) {
          throw new Error("Card not found or you don't own this card.");
        }

        if (card.cvv !== cvv) {
          throw new Error("Invalid CVV/Password.");
        }
        const currentBalance = card.balance || 0;
        if (currentBalance < finalPrice) {
          throw new Error(
            `Insufficient funds. Current balance is $${currentBalance.toFixed(2)}.`,
          );
        }
        card.balance = currentBalance - finalPrice;

        await card.save({ session });

        initialStatus = "paid";
        paymentCardId = card._id;
      }

      const newOrder = new Order({
        userId,
        items: orderItems,
        shippingMethod,
        shippingFee,
        address,
        paymentMethod,
        cardId: paymentCardId,
        voucherCode,
        discount,
        totalPrice: finalPrice,
        status: initialStatus,
      });

      await newOrder.save({ session });

      if (stockUpdates.length > 0) {
        await Product.bulkWrite(stockUpdates, { session });
      }

      cart.items = cart.items.filter(
        (ci) =>
          !selectedItems.some(
            (si) =>
              si.productId === ci.productId._id.toString() &&
              si.size === ci.size &&
              si.color === ci.color,
          ),
      );
      await cart.save({ session });

      await session.commitTransaction();

      res.status(201).json({
        message:
          initialStatus === "paid"
            ? "Order placed and paid successfully"
            : "Order placed successfully",
        order: newOrder,
      });
    } catch (err) {
      await session.abortTransaction();
      console.error("Create order error:", err);
      if (
        err.message.includes("Not enough stock") ||
        err.message.includes("Insufficient funds") ||
        err.message.includes("CVV") ||
        err.message.includes("Please select a card")
      ) {
        res.status(400).json({ message: err.message });
      } else {
        res.status(500).json({ message: err.message || "Server error" });
      }
    } finally {
      session.endSession();
    }
  }

  generateVNPURL = async (req, orderId, amount) => {
    let date = new Date();
    let createDate = moment(date).format("YYYYMMDDHHmmss");
    let ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    let tmnCode = process.env.VNP_TMN_CODE;
    let secretKey = process.env.VNP_HASH_SECRET;
    let vnpUrl = process.env.VNP_URL;
    let returnUrl = process.env.VNP_RETURN_URL;

    let vnp_Params = {};
    vnp_Params["vnp_Version"] = "2.1.0";
    vnp_Params["vnp_Command"] = "pay";
    vnp_Params["vnp_TmnCode"] = tmnCode;
    vnp_Params["vnp_Locale"] = "vn";
    vnp_Params["vnp_CurrCode"] = "VND";
    vnp_Params["vnp_TxnRef"] = orderId;
    vnp_Params["vnp_OrderInfo"] = "Thanh toan don hang: " + orderId;
    vnp_Params["vnp_OrderType"] = "other";
    vnp_Params["vnp_Amount"] = Math.round(amount * 25000 * 100);
    vnp_Params["vnp_ReturnUrl"] = returnUrl;
    vnp_Params["vnp_IpAddr"] = ipAddr;
    vnp_Params["vnp_CreateDate"] = createDate;

    vnp_Params = Object.keys(vnp_Params)
      .sort()
      .reduce((obj, key) => {
        obj[key] = vnp_Params[key];
        return obj;
      }, {});

    let signData = qs.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");
    vnp_Params["vnp_SecureHash"] = signed;

    return vnpUrl + "?" + qs.stringify(vnp_Params, { encode: false });
  };

  createOrder = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const userId = req.user.id;
      const {
        selectedItems,
        shippingMethod,
        address,
        paymentMethod,
        voucherCode,
      } = req.body;

      if (!selectedItems || selectedItems.length === 0) {
        throw new Error("No items selected for checkout");
      }

      const cart = await Cart.findOne({ userId })
        .session(session)
        .populate("items.productId");
      if (!cart) throw new Error("Cart not found");

      const orderItems = [];
      let subtotal = 0;

      for (const item of selectedItems) {
        const found = cart.items.find(
          (ci) => ci.productId._id.toString() === item.productId,
        );
        if (!found) throw new Error(`Product not found in cart`);

        const product = await Product.findById(found.productId._id).session(
          session,
        );
        if (product.quantity < found.quantity)
          throw new Error(`Not enough stock for ${product.name}`);

        subtotal += product.price * found.quantity;
        orderItems.push({
          productId: product._id,
          quantity: found.quantity,
          price: product.price,
        });
      }

      const shippingFee = shippingMethod === "express" ? 5 : 0;
      const finalPrice = subtotal + shippingFee;

      const newOrder = new Order({
        userId,
        items: orderItems,
        shippingMethod,
        shippingFee,
        address,
        paymentMethod,
        totalPrice: finalPrice,
        status: "pending",
      });

      await newOrder.save({ session });

      if (paymentMethod === "vnpay") {
        const vnpayUrl = this.generateVNPURL(
          req,
          newOrder._id.toString(),
          finalPrice,
        );

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({
          message: "Redirect to VNPay",
          vnpayUrl: vnpayUrl,
        });
      }

      await session.commitTransaction();
      res
        .status(201)
        .json({ message: "Order placed successfully", order: newOrder });
    } catch (err) {
      await session.abortTransaction();
      res.status(400).json({ message: err.message });
    } finally {
      session.endSession();
    }
  };

  vnpayReturn = async (req, res) => {
    try {
      let vnp_Params = req.query;
      let secureHash = vnp_Params["vnp_SecureHash"];

      delete vnp_Params["vnp_SecureHash"];
      delete vnp_Params["vnp_SecureHashType"];

      vnp_Params = Object.keys(vnp_Params)
        .sort()
        .reduce((obj, key) => {
          obj[key] = vnp_Params[key];
          return obj;
        }, {});

      let secretKey = process.env.VNP_HASH_SECRET;
      let signData = qs.stringify(vnp_Params, { encode: false });
      let hmac = crypto.createHmac("sha512", secretKey);
      let signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");

      if (secureHash === signed) {
        const orderId = vnp_Params["vnp_TxnRef"];
        const responseCode = vnp_Params["vnp_ResponseCode"];

        if (responseCode === "00") {
          await Order.findByIdAndUpdate(orderId, { status: "paid" });
          res.redirect("http://localhost:8081/payment-success");
        } else {
          await Order.findByIdAndUpdate(orderId, { status: "cancelled" });
          res.redirect("http://localhost:8081/payment-failed");
        }
      } else {
        res.status(400).json({ message: "Invalid signature" });
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

  async updateStatus(req, res) {
    try {
      const { orderId } = req.params;
      const { status } = req.body;

      const order = await Order.findByIdAndUpdate(
        orderId,
        { status },
        { new: true },
      );
      if (!order) return res.status(404).json({ message: "Order not found" });

      res.status(200).json({ message: "Order status updated", order });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error updating order", error: err.message });
    }
  }

  async cancelOrder(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { orderId } = req.params;
      const userId = req.user.id;

      const order = await Order.findOne({ _id: orderId, userId }).session(
        session,
      );

      if (!order) {
        await session.abortTransaction();
        return res
          .status(404)
          .json({ message: "Order not found or unauthorized" });
      }

      if (!["pending", "paid"].includes(order.status)) {
        await session.abortTransaction();
        return res.status(400).json({
          message: `Cannot cancel order with status "${order.status}". Only "pending" or "paid" orders can be cancelled.`,
        });
      }

      if (
        order.status === "paid" &&
        order.paymentMethod === "credit_card" &&
        order.cardId
      ) {
        const card = await Card.findById(order.cardId).session(session);
        if (card) {
          card.balance += order.totalPrice;
          await card.save({ session });
        } else {
          console.warn(`Cannot refund order!`);
        }
      }

      const stockUpdates = order.items.map((item) => ({
        updateOne: {
          filter: { _id: item.productId },
          update: { $inc: { quantity: item.quantity } },
        },
      }));

      if (stockUpdates.length > 0) {
        await Product.bulkWrite(stockUpdates, { session });
      }

      const previousStatus = order.status;
      order.status = "cancelled";
      const updatedOrder = await order.save({ session });

      await session.commitTransaction();
      await updatedOrder.populate([
        { path: "items.productId", select: "name price img brand" },
        { path: "cardId", select: "cardNumber cardName" },
      ]);

      let message = "Order cancelled successfully";
      if (previousStatus === "paid") {
        message = "Order cancelled and refunded successfully";
      }

      res.status(200).json({ message, order: updatedOrder });
    } catch (err) {
      await session.abortTransaction();
      res
        .status(500)
        .json({ message: "Server error cancelling order", error: err.message });
    } finally {
      session.endSession();
    }
  }

  async deleteOrder(req, res) {
    try {
      const { orderId } = req.params;
      const userId = req.user.id;
      const deletedOrder = await Order.findOneAndDelete({
        _id: orderId,
        userId: userId,
        status: "cancelled",
      });
      if (!deletedOrder) {
        const order = await Order.findOne({ _id: orderId, userId: userId });
        if (!order) {
          return res
            .status(404)
            .json({ message: "Order not found or you are not authorized" });
        }
        return res.status(400).json({
          message: `Order cannot be deleted. Its status is "${order.status}", not "cancelled".`,
        });
      }
      res.status(200).json({ message: "Order successfully deleted" });
    } catch (err) {
      if (err.name === "CastError") {
        return res.status(400).json({ message: "Invalid order ID format" });
      }
      res
        .status(500)
        .json({
          message: "Server error while deleting order",
          error: err.message,
        });
    }
  }
}

module.exports = new OrderController();
