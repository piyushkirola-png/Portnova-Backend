const express = require("express");
const router = express.Router();
const { authenticate, isAdmin } = require("../middleware/auth");
const paymentController = require("../controllers/paymentController");
const PaymentService = require("../services/paymentService");

router.post("/initiate", authenticate, paymentController.initiatePayment);

router.post("/verify", authenticate, paymentController.verifyPayment);

router.get(
  "/status/:orderId",
  authenticate,
  paymentController.getPaymentStatus,
);

router.get("/history", authenticate, paymentController.getPaymentHistory);

router.post(
  "/refund",
  [authenticate, isAdmin],
  paymentController.refundPayment,
);

module.exports = router;
