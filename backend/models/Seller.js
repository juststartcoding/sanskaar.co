const mongoose = require("mongoose");

const sellerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Business Info
    businessName: { type: String, required: true },
    businessType: {
      type: String,
      enum: ["Manufacturer", "Wholesaler", "Retailer", "Individual", "Other"],
      default: "Individual",
    },
    gstNumber: String,

    // Contact
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, required: true },

    // Location
    location: {
      city: String,
      state: String,
      address: String,
      pincode: String,
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },

    // Bank Details (for payments)
    bankDetails: {
      accountNumber: String,
      ifscCode: String,
      accountHolderName: String,
      bankName: String,
    },

    // Documents
    documents: {
      gstCertificate: String,
      panCard: String,
      aadhaar: String,
      businessLicense: String,
    },

    // Description
    description: String,

    // Profile
    logo: String,
    images: [String],

    // Status
    isApproved: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },

    // Stats
    totalProducts: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },

    // Ratings
    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },

    // Commission
    commissionRate: { type: Number, default: 10 }, // percentage

    // Categories
    categories: [String],

    // Business Hours
    businessHours: {
      monday: { open: String, close: String },
      tuesday: { open: String, close: String },
      wednesday: { open: String, close: String },
      thursday: { open: String, close: String },
      friday: { open: String, close: String },
      saturday: { open: String, close: String },
      sunday: { open: String, close: String },
    },

    // Dates
    approvedAt: Date,
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

// Indexes
sellerSchema.index({ userId: 1 });
sellerSchema.index({ businessName: 1 });
sellerSchema.index({ isApproved: 1 });
sellerSchema.index({ isActive: 1 });

module.exports = mongoose.model("Seller", sellerSchema);
