const mongoose = require("mongoose");

const deityMasterSchema = new mongoose.Schema(
  {
    name_hi: {
      type: String,
      required: true,
    },
    name_en: {
      type: String,
      required: true,
    },
    name_sa: {
      type: String,
      default: "",
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
    description_hi: {
      type: String,
      default: "",
    },
    description_en: {
      type: String,
      default: "",
    },
    day_of_worship: {
      type: String,
      default: "",
    },
    associated_color: {
      type: String,
      default: "",
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
deityMasterSchema.index({ name_en: "text", name_hi: "text" });

module.exports = mongoose.model("DeityMaster", deityMasterSchema);
