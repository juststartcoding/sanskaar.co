const express = require("express");
const Pandit = require("../models/Pandit");
const Booking = require("../models/Booking");
// TEMP: const auth = require('../middleware/auth');

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { language, specialty, region } = req.query;

    // Only show approved and active pandits
    let query = {
      isApproved: true,
      isActive: true,
    };

    if (language) query.languages = { $in: [language] };
    if (specialty) query.specialization = { $in: [specialty] };
    if (region) query["location.city"] = region;

    console.log("📥 Fetching pandits with query:", query);

    const pandits = await Pandit.find(query)
      .populate("userId", "name email phone profilePic")
      .sort({ createdAt: -1 });

    console.log("✅ Found", pandits.length, "approved pandits");

    res.json({
      success: true,
      pandits,
      total: pandits.length,
    });
  } catch (error) {
    console.error("❌ Error fetching pandits:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.get("/:id", async (req, res) => {
  const pandit = await Pandit.findById(req.params.id).populate("userId");
  res.json(pandit);
});

router.put("/:id", async (req, res) => {
  const pandit = await Pandit.findById(req.params.id);
  if (pandit.userId.toString() !== req.user.id)
    return res.status(403).json({ message: "Access denied" });
  const updated = await Pandit.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(updated);
});

router.post("/bookings", async (req, res) => {
  const { panditId, poojaId, method, dateTime, location } = req.body;
  const pandit = await Pandit.findById(panditId);
  if (!pandit) return res.status(404).json({ message: "Pandit not found" });
  const booking = new Booking({
    userId: req.user.id,
    panditId,
    poojaId,
    method,
    dateTime,
    location,
  });
  await booking.save();
  res.status(201).json(booking);
});

router.get("/bookings", async (req, res) => {
  const bookings = await Booking.find({ userId: req.user.id }).populate(
    "panditId poojaId"
  );
  res.json(bookings);
});

router.put("/bookings/:id", async (req, res) => {
  const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(booking);
});

module.exports = router;
