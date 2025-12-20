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
  custom_instruction: {
    hi: { type: String, default: "" },
    en: { type: String, default: "" },
  },
  duration_minutes: {
    type: Number,
    default: 5,
  },
  mantra_repeat_count: {
    type: Number,
    default: 11,
  },
  is_optional: {
    type: Boolean,
    default: false,
  },
});

const samagriItemSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  product_name: {
    type: String,
    default: "",
  },
  product_image: {
    type: String,
    default: "",
  },
  quantity: {
    type: String,
    default: "1",
  },
  is_required: {
    type: Boolean,
    default: true,
  },
});

const poojaTemplateSchema = new mongoose.Schema(
  {
    name: {
      hi: { type: String, required: true },
      en: { type: String, required: true },
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
      enum: ["DAILY", "FESTIVAL", "SPECIAL", "OCCASION", "NAVAGRAHA", "SANATAN"],
      default: "DAILY",
    },
    short_description: {
      hi: { type: String, default: "" },
      en: { type: String, default: "" },
    },
    description: {
      hi: { type: String, default: "" },
      en: { type: String, default: "" },
    },
    benefits: {
      hi: { type: String, default: "" },
      en: { type: String, default: "" },
    },
    main_image_url: {
      type: String,
      default: "",
    },
    thumbnail_url: {
      type: String,
      default: "",
    },
    aarti_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AartiMaster",
    },
    steps: [poojaTemplateStepSchema],
    samagri_list: [samagriItemSchema],
    total_duration_minutes: {
      type: Number,
      default: 30,
    },
    difficulty_level: {
      type: String,
      enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"],
      default: "BEGINNER",
    },
    best_time: {
      type: String,
      default: "Morning",
    },
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
  if (!this.slug && this.name?.en) {
    this.slug = this.name.en
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
poojaTemplateSchema.index({ "name.hi": "text", "name.en": "text" });

module.exports = mongoose.model("PoojaTemplate", poojaTemplateSchema);
