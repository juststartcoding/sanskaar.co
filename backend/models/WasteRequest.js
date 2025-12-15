const mongoose = require("mongoose");

const wasteRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Optional - guest users can submit
    },

    // Item details
    itemType: {
      type: String,
      required: true,
      enum: [
        "flowers",
        "leaves",
        "coconut",
        "cloth",
        "incense",
        "oil",
        "paper",
        "idols",
        "other",
      ],
    },

    quantity: {
      amount: { type: Number, required: true },
      unit: {
        type: String,
        enum: ["kg", "bags", "pieces", "bundles"],
        default: "kg",
      },
    },

    source: {
      type: String,
      enum: ["household", "temple", "event"],
      default: "household",
    },

    // Address
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: String,
    },

    // Preferred pickup
    preferredDate: Date,
    preferredTime: {
      type: String,
      enum: ["morning", "afternoon", "evening"],
    },

    // Contact
    phone: {
      type: String,
      required: true,
    },

    // Additional info
    notes: String,

    // Priority
    priority: {
      type: String,
      enum: ["low", "normal", "high"],
      default: "normal",
    },

    // Status
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "cancelled"],
      default: "pending",
    },

    // Images
    images: [String],

    // Assignment
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Tracking
    trackingId: String,

    // Collection details
    collectedAt: Date,
    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Recycling details
    recycledAt: Date,
    recyclingNotes: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
wasteRequestSchema.index({ status: 1 });
wasteRequestSchema.index({ userId: 1 });
wasteRequestSchema.index({ createdAt: -1 });
wasteRequestSchema.index({ "address.city": 1 });

module.exports = mongoose.model("WasteRequest", wasteRequestSchema);
