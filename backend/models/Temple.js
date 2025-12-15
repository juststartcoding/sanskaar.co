const mongoose = require("mongoose");

const templeSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      english: { type: String, required: true },
      hindi: { type: String, required: true },
    },

    slug: {
      type: String,
      required: true,
      unique: true,
    },

    // Deity Information
    mainDeity: {
      type: String,
      required: true,
      enum: [
        "Lord Shiva",
        "Lord Vishnu",
        "Lord Ganesha",
        "Goddess Durga",
        "Goddess Kali",
        "Lord Hanuman",
        "Goddess Lakshmi",
        "Goddess Saraswati",
        "Lord Krishna",
        "Lord Rama",
        "Lord Brahma",
        "Lord Kartikeya",
        "Lord Ayyappa",
        "Lord Venkateswara",
        "Goddess Parvati",
        "Other",
      ],
    },

    otherDeities: [String],

    // Location
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, default: "India" },
      pincode: String,
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },

    // Description
    description: {
      english: { type: String, required: true },
      hindi: String,
    },

    history: {
      english: String,
      hindi: String,
    },

    significance: {
      english: String,
      hindi: String,
    },

    // Images
    mainImage: { type: String, required: true },
    images: [String],

    // Timings
    timings: {
      morning: {
        opening: String,
        closing: String,
      },
      evening: {
        opening: String,
        closing: String,
      },
      specialDays: String,
    },

    // Contact
    contact: {
      phone: String,
      email: String,
      website: String,
    },

    // Visit Information
    entryFee: {
      indian: { type: Number, default: 0 },
      foreign: { type: Number, default: 0 },
    },

    bestTimeToVisit: {
      type: String,
      enum: ["Morning", "Evening", "Anytime", "Festivals"],
    },

    dressCode: String,

    facilities: [
      {
        type: String,
        enum: [
          "Parking",
          "Drinking Water",
          "Prasad Counter",
          "Donation Counter",
          "Wheelchair Access",
          "Restrooms",
          "Shoe Stand",
          "Cloakroom",
          "Photography Allowed",
          "Dharmashala",
          "Annadanam",
          "Other",
        ],
      },
    ],

    // Rituals & Poojas
    rituals: [
      {
        name: String,
        time: String,
        days: [String],
        description: String,
      },
    ],

    specialPoojas: [
      {
        name: String,
        cost: Number,
        duration: String,
        description: String,
        bookingRequired: { type: Boolean, default: false },
      },
    ],

    // Festivals
    festivals: [
      {
        name: String,
        month: String,
        description: String,
      },
    ],

    // Architecture
    architecture: {
      style: String,
      builtIn: String,
      builtBy: String,
    },

    // Rules & Guidelines
    rules: [String],

    dosDonts: {
      dos: [String],
      donts: [String],
    },

    // Nearby Places
    nearbyAttractions: [
      {
        name: String,
        distance: String,
        description: String,
      },
    ],

    // How to Reach
    howToReach: {
      byAir: String,
      byTrain: String,
      byRoad: String,
    },

    // Ratings & Reviews
    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },

    // Status
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },

    // Admin
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    claimStatus: {
      type: String,
      enum: ["unclaimed", "claimed", "verified"],
      default: "unclaimed",
    },

    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Statistics
    views: { type: Number, default: 0 },
    bookings: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

// Indexes for search
templeSchema.index({ "name.english": "text", "description.english": "text" });
templeSchema.index({ "location.city": 1 });
templeSchema.index({ "location.state": 1 });
templeSchema.index({ mainDeity: 1 });
templeSchema.index({ featured: 1 });
templeSchema.index({ slug: 1 });

module.exports = mongoose.model("Temple", templeSchema);
