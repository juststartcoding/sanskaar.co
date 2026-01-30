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
const MuhuratCalendar = require("../models/MuhuratCalendar");

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

// ============================================
// PUBLIC MUHURAT CALENDAR ROUTES
// ============================================

// Get today's muhurat
router.get("/calendar/today", async (req, res) => {
  try {
    const { city = "Delhi" } = req.query;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const entry = await MuhuratCalendar.findOne({
      date: { $gte: today, $lt: tomorrow },
      "location.city": city,
      isActive: true,
    }).populate(
      "recommended_poojas.pooja_id",
      "name thumbnail_url main_image_url slug",
    );

    res.json({ success: true, entry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get muhurat for specific date
router.get("/calendar/date/:date", async (req, res) => {
  try {
    const { date } = req.params;
    const { city = "Delhi" } = req.query;

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const entry = await MuhuratCalendar.findOne({
      date: { $gte: startOfDay, $lte: endOfDay },
      "location.city": city,
      isActive: true,
    }).populate(
      "recommended_poojas.pooja_id",
      "name thumbnail_url main_image_url slug",
    );

    res.json({ success: true, entry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get muhurat calendar for a month
router.get("/calendar/month/:year/:month", async (req, res) => {
  try {
    const { year, month } = req.params;
    const { city = "Delhi" } = req.query;

    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(
      parseInt(year),
      parseInt(month),
      0,
      23,
      59,
      59,
      999,
    );

    const entries = await MuhuratCalendar.find({
      date: { $gte: startDate, $lte: endDate },
      "location.city": city,
      isActive: true,
    })
      .populate("recommended_poojas.pooja_id", "name thumbnail_url slug")
      .sort({ date: 1 });

    res.json({
      success: true,
      entries,
      month: parseInt(month),
      year: parseInt(year),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get upcoming Tarpan days (public)
router.get("/calendar/tarpan", async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const entries = await MuhuratCalendar.find({
      date: { $gte: today },
      "tarpan_info.is_tarpan_day": true,
      isActive: true,
    })
      .sort({ date: 1 })
      .limit(parseInt(limit));

    res.json({ success: true, entries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get upcoming festivals (public)
router.get("/calendar/festivals", async (req, res) => {
  try {
    const { limit = 5, type } = req.query;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const query = {
      date: { $gte: today },
      "festival.is_festival": true,
      isActive: true,
    };

    if (type && type !== "ALL") query["festival.festival_type"] = type;

    const entries = await MuhuratCalendar.find(query)
      .sort({ date: 1 })
      .limit(parseInt(limit));

    res.json({ success: true, entries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
