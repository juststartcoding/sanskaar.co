const mongoose = require("mongoose");

const poojaTemplateStepSchema = new mongoose.Schema({
  step_code: {
    type: String,
    required: true,
  },
  step_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PoojaStepMaster",
  },
  mantra_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MantraMaster",
  },
  order: {
    type: Number,
    required: true,
  },
  custom_instruction_hi: {
    type: String,
    default: "",
  },
  custom_instruction_en: {
    type: String,
    default: "",
  },
  duration_minutes: {
    type: Number,
    default: 5,
  },
  is_optional: {
    type: Boolean,
    default: false,
  },
});

const poojaTemplateSchema = new mongoose.Schema(
  {
    pooja_name: {
      type: String,
      required: true,
    },
    pooja_name_hi: {
      type: String,
      default: "",
    },
    slug: {
      type: String,
      unique: true,
    },
    deity_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeityMaster",
    },
    category: {
      type: String,
      enum: ["DAILY", "FESTIVAL", "SPECIAL", "OCCASION", "SANATAN"],
      default: "DAILY",
    },
    description_hi: {
      type: String,
      default: "",
    },
    description_en: {
      type: String,
      default: "",
    },
    main_image_url: {
      type: String,
      default: "",
    },
    aarti_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AartiMaster",
    },
    steps: [poojaTemplateStepSchema],
    total_duration_minutes: {
      type: Number,
      default: 30,
    },
    difficulty_level: {
      type: String,
      enum: ["Easy", "Medium", "Advanced"],
      default: "Easy",
    },
    best_time: {
      type: String,
      default: "Morning",
    },
    samagri_list: [{
      item_name_hi: String,
      item_name_en: String,
      quantity: String,
      is_required: { type: Boolean, default: true },
    }],
    views: {
      type: Number,
      default: 0,
    },
    completions: {
      type: Number,
      default: 0,
    },
    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
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

// Pre-save hook for slug
poojaTemplateSchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = this.pooja_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

// Calculate total duration from steps
poojaTemplateSchema.methods.calculateTotalDuration = function () {
  return this.steps.reduce((total, step) => total + (step.duration_minutes || 5), 0);
};

// Indexes
poojaTemplateSchema.index({ slug: 1 });
poojaTemplateSchema.index({ category: 1 });
poojaTemplateSchema.index({ deity_id: 1 });
poojaTemplateSchema.index({ isFeatured: 1 });

module.exports = mongoose.model("PoojaTemplate", poojaTemplateSchema);
