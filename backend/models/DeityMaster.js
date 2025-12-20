const mongoose = require("mongoose");

const deityMasterSchema = new mongoose.Schema(
  {
    deity_code: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true,
    },
    name: {
      hi: { type: String, required: true },
      en: { type: String, required: true },
      sa: { type: String, default: "" },
    },
    icon_url: {
      type: String,
      default: "",
    },
    image_url: {
      type: String,
      default: "",
    },
    default_mantra_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MantraMaster",
    },
    description: {
      hi: { type: String, default: "" },
      en: { type: String, default: "" },
    },
    day_of_worship: {
      type: String,
      default: "",
    },
    associated_color: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      enum: ["TRIMURTI", "DEVI", "AVATAR", "GANA", "NAVAGRAHA", "OTHER"],
      default: "OTHER",
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
deityMasterSchema.index({ "name.en": "text", "name.hi": "text" });
deityMasterSchema.index({ deity_code: 1 });

module.exports = mongoose.model("DeityMaster", deityMasterSchema);
