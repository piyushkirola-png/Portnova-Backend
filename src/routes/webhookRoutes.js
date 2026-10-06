const express = require("express");
const router = express.Router();
const { validateWebhook } = require("../middleware/webhook");
const paymentController = require("../controllers/paymentController");
const { authenticate, isAdmin } = require("../middleware/auth");

router.post("/razorpay", validateWebhook, paymentController.handleWebhook);

router.get("/logs", [authenticate, isAdmin], paymentController.getWebhookLogs);
router.get(
  "/stats",
  [authenticate, isAdmin],
  paymentController.getWebhookStats,
);

module.exports = router;