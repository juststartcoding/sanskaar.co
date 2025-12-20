const mongoose = require("mongoose");

const poojaStepMasterSchema = new mongoose.Schema(
  {
    step_code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    title: {
      hi: { type: String, required: true },
      en: { type: String, required: true },
      sa: { type: String, default: "" },
    },
    instruction: {
      hi: { type: String, default: "" },
      en: { type: String, default: "" },
    },
    description: {
      hi: { type: String, default: "" },
      en: { type: String, default: "" },
    },
    icon_url: {
      type: String,
      default: "",
    },
    image_url: {
      type: String,
      default: "",
    },
    audio_url: {
      type: String,
      default: "",
    },
    video_url: {
      type: String,
      default: "",
    },
    is_mandatory: {
      type: Boolean,
      default: false,
    },
    order_hint: {
      type: Number,
      default: 0,
    },
    duration_minutes: {
      type: Number,
      default: 5,
    },
    background_color: {
      type: String,
      default: "#FFF7ED",
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
poojaStepMasterSchema.index({ step_code: 1 });
poojaStepMasterSchema.index({ order_hint: 1 });
poojaStepMasterSchema.index({ "title.hi": "text", "title.en": "text" });

module.exports = mongoose.model("PoojaStepMaster", poojaStepMasterSchema);
