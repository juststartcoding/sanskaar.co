const mongoose = require("mongoose");

const stepSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      default: null,
    },
    audio: {
      type: String,
      default: null,
    },
    video: {
      type: String,
      default: null,
    },
    mantra: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    order: {
      type: Number,
      required: true,
    },
  },
  { _id: true }
);

// Samagri (Materials) Schema for pooja
const samagriSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    name: {
      hindi: { type: String, required: true },
      english: { type: String, required: true },
    },
    quantity: {
      type: String,
      default: "1",
    },
    unit: {
      type: String,
      default: "piece",
    },
    isRequired: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
      default: "",
    },
  },
  { _id: true }
);

const poojaSchema = new mongoose.Schema(
  {
    poojaType: {
      type: String,
      required: [true, "Pooja type is required"],
      trim: true,
    },
    poojaLanguage: {
      type: String,
      required: [true, "Pooja language is required"],
      enum: ["hindi", "sanskrit", "english"],
      default: "hindi",
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
    },
    mainImage: {
      type: String,
      default: "",
    },
    duration: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      default: 0,
    },
    importance: {
      hindi: {
        type: String,
        required: [true, "Hindi importance is required"],
        trim: true,
      },
      sanskrit: {
        type: String,
        required: [true, "Sanskrit importance is required"],
        trim: true,
      },
      english: {
        type: String,
        required: [true, "English importance is required"],
        trim: true,
      },
    },
    steps: {
      hindi: {
        type: [stepSchema],
        default: [],
      },
      sanskrit: {
        type: [stepSchema],
        default: [],
      },
      english: {
        type: [stepSchema],
        default: [],
      },
    },
    // Samagri - Materials required for pooja
    samagri: {
      type: [samagriSchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      enum: ["Daily", "Festival", "Occasion", "Sanatan", "Other"],
      default: "Other",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    ratings: {
      average: {
        type: Number,
        default: 0,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Pre-save hook to generate slug
poojaSchema.pre("save", function (next) {
  if (!this.slug && this.poojaType) {
    this.slug = this.poojaType
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-");
  }
  next();
});

// Indexes for better query performance
poojaSchema.index({ poojaType: 1 });
poojaSchema.index({ poojaLanguage: 1 });
poojaSchema.index({ isActive: 1 });
poojaSchema.index({ createdBy: 1 });
poojaSchema.index({ slug: 1 });
poojaSchema.index({ featured: 1 });
poojaSchema.index({ category: 1 });

// Virtual for total steps
poojaSchema.virtual("totalSteps").get(function () {
  return {
    hindi: this.steps.hindi.length,
    sanskrit: this.steps.sanskrit.length,
    english: this.steps.english.length,
  };
});

// Virtual for total samagri items
poojaSchema.virtual("totalSamagri").get(function () {
  return this.samagri.length;
});

// Virtual for samagri total price
poojaSchema.virtual("samagriTotalPrice").get(function () {
  return this.samagri.reduce((total, item) => total + (item.price || 0), 0);
});

const Pooja = mongoose.model("Pooja", poojaSchema);

module.exports = Pooja;
