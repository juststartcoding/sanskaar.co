const mongoose = require("mongoose");

const aartiMasterSchema = new mongoose.Schema(
  {
    aarti_code: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true,
    },
    title: {
      hi: { type: String, required: true },
      en: { type: String, required: true },
      sa: { type: String, default: "" },
    },
    deity_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeityMaster",
    },
    lyrics: {
      hi: { type: String, default: "" },
      en: { type: String, default: "" },
      sa: { type: String, default: "" },
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
    time_of_day: {
      type: String,
      enum: ["MORNING", "EVENING", "NIGHT", "ANY"],
      default: "ANY",
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
aartiMasterSchema.index({ deity_id: 1 });
aartiMasterSchema.index({ aarti_code: 1 });

module.exports = mongoose.model("AartiMaster", aartiMasterSchema);
