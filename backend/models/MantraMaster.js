const mongoose = require("mongoose");

const mantraMasterSchema = new mongoose.Schema(
  {
    mantra_name: {
      type: String,
      required: true,
      trim: true,
    },
    mantra_code: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true,
    },
    text: {
      sa: { type: String, default: "" },
      hi: { type: String, default: "" },
      en: { type: String, default: "" },
    },
    meaning: {
      hi: { type: String, default: "" },
      en: { type: String, default: "" },
    },
    audio_url: {
      type: String,
      default: "",
    },
    video_url: {
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
    default_repeat: {
      type: Number,
      default: 11,
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
      enum: ["GENERAL", "DEITY_SPECIFIC", "OCCASION", "MORNING", "EVENING", "PROTECTION", "HEALING", "PROSPERITY"],
      default: "GENERAL",
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
mantraMasterSchema.index({ mantra_name: "text", "text.sa": "text" });
mantraMasterSchema.index({ deity_id: 1 });
mantraMasterSchema.index({ category: 1 });
mantraMasterSchema.index({ mantra_code: 1 });

module.exports = mongoose.model("MantraMaster", mantraMasterSchema);
