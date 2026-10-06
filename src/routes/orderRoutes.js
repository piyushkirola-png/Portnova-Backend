const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { authenticate } = require("../middleware/auth");
const { uploadReportImage } = require("../middleware/upload");

router.get("/addresses", authenticate, orderController.getUserAddresses);

router.post("/addresses", authenticate, orderController.addAddress);

router.put(
  "/addresses/:addressId/default",
  authenticate,
  orderController.setDefaultAddress,
);

router.get("/user", authenticate, orderController.getUserOrders);

router.get("/user/activity", authenticate, orderController.getUserActivity);

router.get(
  "/user/recommended",
  authenticate,
  orderController.getRecommendedProducts,
);

router.post("/create", authenticate, orderController.createOrder);

router.get("/:id", authenticate, orderController.getOrderById);

router.get("/:id/invoice", authenticate, orderController.getOrderInvoice);

router.get(
  "/:id/invoice/pdf",
  authenticate,
  orderController.downloadInvoicePDF,
);

router.post("/:id/cancel", authenticate, orderController.cancelOrder);

router.post(
  "/:id/report",
  authenticate,
  uploadReportImage.single("file"),
  orderController.reportIssue,
);

router.get("/:id/status", authenticate, orderController.getOrderStatus);

router.get("/admin", authenticate, orderController.getAllOrders);

router.get(
  "/admin/analytics",
  authenticate,
  orderController.getAnalyticsSummary,
);

router.put("/:id/status", authenticate, orderController.updateOrderStatus);

router.put(
  "/:id/payment",
  authenticate,
  orderController.updateOrderPaymentStatus,
);

module.exports = router;
