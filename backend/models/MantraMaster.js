const mongoose = require("mongoose");

const mantraMasterSchema = new mongoose.Schema(
  {
    mantra_name: {
      type: String,
      required: true,
      trim: true,
    },
    text_sa: {
      type: String,
      default: "",
    },
    text_hi: {
      type: String,
      default: "",
    },
    text_en: {
      type: String,
      default: "",
    },
    audio_url: {
      type: String,
      default: "",
    },
    duration_sec: {
      type: Number,
      default: 0,
    },
    repeat_allowed: {
      type: [Number],
      default: [11, 21, 108],
    },
    safe_for_all: {
      type: Boolean,
      default: true,
    },
    deity_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeityMaster",
    },
    category: {
      type: String,
      enum: ["General", "Deity Specific", "Occasion", "Morning", "Evening", "Protection"],
      default: "General",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
mantraMasterSchema.index({ mantra_name: "text" });
mantraMasterSchema.index({ deity_id: 1 });
mantraMasterSchema.index({ category: 1 });

module.exports = mongoose.model("MantraMaster", mantraMasterSchema);
