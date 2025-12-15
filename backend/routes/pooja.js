const express = require("express");
const router = express.Router();
const {
  createPooja,
  getAllPoojas,
  getPoojaById,
  updatePooja,
  deletePooja,
  uploadPoojaFiles,
  handleFileUpload,
  ratePooja,
} = require("../controllers/poojaController");

// TEMPORARY: Auth disabled to let backend start
// const auth = require("../middleware/auth");

// Public routes
router.get("/", getAllPoojas);
router.get("/:id", getPoojaById);

// Protected routes - TEMPORARY: Auth disabled
router.post("/", createPooja);
router.post("/upload", uploadPoojaFiles, handleFileUpload);
router.put("/:id", updatePooja);
router.delete("/:id", deletePooja);
router.post("/:id/rate", ratePooja);

module.exports = router;
