const express = require("express");
const { upload } = require("../middleware/upload");
const { authenticate, authorize } = require("../middleware/auth");
const {
  uploadCSV,
  processProducts,
  getTemplate,
  previewCSV,
} = require("../controllers/bulkProductController");

const router = express.Router();

router.use(authenticate, authorize("admin"));

router.post("/upload-csv", upload.single("file"), uploadCSV);

router.post("/preview-csv", upload.single("file"), previewCSV);

router.post("/process", processProducts);

router.get("/template", getTemplate);

module.exports = router;
