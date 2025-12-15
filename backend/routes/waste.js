const express = require("express");
const WasteRequest = require("../models/WasteRequest");
// TEMP: const auth = require('../middleware/auth');

const router = express.Router();

// Get all waste collection requests
router.get("/requests", async (req, res) => {
  try {
    let query = {};

    // If user is not admin, only show their own requests
    if (req.user.role !== "admin") {
      query.userId = req.user.id;
    }

    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    const requests = await WasteRequest.find(query)
      .populate("userId", "name email phone")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching waste requests", error: error.message });
  }
});

// Get single waste request
router.get("/requests/:id", async (req, res) => {
  try {
    const request = await WasteRequest.findById(req.params.id).populate(
      "userId",
      "name email phone"
    );

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Check if user has permission to view
    if (
      req.user.role !== "admin" &&
      request.userId._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(request);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching request", error: error.message });
  }
});

// Create new waste collection request
router.post("/requests", async (req, res) => {
  try {
    console.log("📥 Creating waste request:", req.body);

    const wasteRequest = new WasteRequest({
      ...req.body,
      userId: req.user?.id || null, // Optional user
      status: "pending",
    });

    await wasteRequest.save();
    console.log("✅ Waste request created:", wasteRequest._id);

    // Populate user data for response if userId exists
    if (wasteRequest.userId) {
      await wasteRequest.populate("userId", "name email phone");
    }

    res.status(201).json({
      success: true,
      message: "Waste collection request created successfully",
      request: wasteRequest,
    });
  } catch (error) {
    console.error("❌ Create request error:", error);
    res.status(400).json({
      success: false,
      message: "Error creating request",
      error: error.message,
    });
  }
});

// Update waste request (for users to update their own requests)
router.put("/requests/:id", async (req, res) => {
  try {
    const request = await WasteRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Check if user has permission to update
    if (
      req.user.role !== "admin" &&
      request.userId.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Don't allow users to change status
    if (req.user.role !== "admin") {
      delete req.body.status;
      delete req.body.assignedTo;
      delete req.body.collectedAt;
    }

    Object.assign(request, req.body);
    await request.save();

    await request.populate("userId", "name email phone");
    res.json(request);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating request", error: error.message });
  }
});

// Update request status (admin only)
router.patch("/requests/:id/status", async (req, res) => {
  try {
    const { status, assignedTo } = req.body;

    const request = await WasteRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = status;

    if (assignedTo) {
      request.assignedTo = assignedTo;
    }

    if (status === "collected") {
      request.collectedAt = new Date();
    }

    await request.save();
    await request.populate("userId", "name email phone");

    res.json(request);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error updating status", error: error.message });
  }
});

// Track waste request (public - by trackingId)
router.get("/track/:trackingId", async (req, res) => {
  try {
    const request = await WasteRequest.findOne({
      trackingId: req.params.trackingId,
    }).select("-userId");

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.json({
      trackingId: request.trackingId,
      status: request.status,
      wasteType: request.wasteType,
      scheduledDate: request.scheduledDate,
      collectedAt: request.collectedAt,
      createdAt: request.createdAt,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error tracking request", error: error.message });
  }
});

// Delete waste request
router.delete("/requests/:id", async (req, res) => {
  try {
    const request = await WasteRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Check if user has permission to delete
    if (
      req.user.role !== "admin" &&
      request.userId.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Don't allow deletion if already collected
    if (request.status === "collected") {
      return res
        .status(400)
        .json({ message: "Cannot delete collected requests" });
    }

    await request.deleteOne();
    res.json({ message: "Request deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting request", error: error.message });
  }
});

// Get waste collection statistics (admin only)
router.get("/stats", async (req, res) => {
  try {
    const stats = await WasteRequest.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalWeight: { $sum: "$estimatedWeight" },
        },
      },
    ]);

    const typeStats = await WasteRequest.aggregate([
      {
        $group: {
          _id: "$wasteType",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      byStatus: stats,
      byType: typeStats,
      total: await WasteRequest.countDocuments(),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching statistics", error: error.message });
  }
});

module.exports = router;
