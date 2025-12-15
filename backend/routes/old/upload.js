const express = require("express");
const { upload } = require("../config/cloudinary");
const auth = require("../middleware/auth");

const router = express.Router();

// Single image upload
router.post("/single", auth(), upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    res.json({
      success: true,
      url: req.file.path,
      publicId: req.file.filename,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Multiple images upload
router.post("/multiple", auth(), upload.array("images", 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const urls = req.files.map((file) => ({
      url: file.path,
      publicId: file.filename,
    }));

    res.json({
      success: true,
      images: urls,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete image
router.delete("/:publicId", auth(), async (req, res) => {
  try {
    const { cloudinary } = require("../config/cloudinary");
    const result = await cloudinary.uploader.destroy(req.params.publicId);

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
