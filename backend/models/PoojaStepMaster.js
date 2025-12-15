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
    title_hi: {
      type: String,
      required: true,
    },
    title_en: {
      type: String,
      required: true,
    },
    instruction_hi: {
      type: String,
      default: "",
    },
    instruction_en: {
      type: String,
      default: "",
    },
    icon_url: {
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

module.exports = mongoose.model("PoojaStepMaster", poojaStepMasterSchema);
