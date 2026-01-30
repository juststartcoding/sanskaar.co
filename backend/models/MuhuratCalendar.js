const mongoose = require("mongoose");

const muhuratCalendarSchema = new mongoose.Schema(
  {
    // Date information
    date: {
      type: Date,
      required: true,
    },
    // Hindu calendar date
    hindu_date: {
      tithi: {
        type: String,
        enum: [
          "PRATIPADA",
          "DWITIYA",
          "TRITIYA",
          "CHATURTHI",
          "PANCHAMI",
          "SHASHTHI",
          "SAPTAMI",
          "ASHTAMI",
          "NAVAMI",
          "DASHAMI",
          "EKADASHI",
          "DWADASHI",
          "TRAYODASHI",
          "CHATURDASHI",
          "PURNIMA",
          "AMAVASYA",
        ],
        required: true,
      },
      tithi_name: {
        hi: { type: String, default: "" },
        en: { type: String, default: "" },
      },
      paksha: {
        type: String,
        enum: ["SHUKLA", "KRISHNA"],
        required: true,
      },
      paksha_name: {
        hi: { type: String, default: "" },
        en: { type: String, default: "" },
      },
      masa: {
        type: String,
        enum: [
          "CHAITRA",
          "VAISHAKHA",
          "JYESHTHA",
          "ASHADHA",
          "SHRAVANA",
          "BHADRAPADA",
          "ASHWIN",
          "KARTIK",
          "MARGASHIRSHA",
          "PAUSHA",
          "MAGHA",
          "PHALGUNA",
        ],
        required: true,
      },
      masa_name: {
        hi: { type: String, default: "" },
        en: { type: String, default: "" },
      },
      samvat: {
        type: Number, // Hindu calendar year (Vikram Samvat)
        default: null,
      },
    },
    // Nakshatra information
    nakshatra: {
      name: {
        type: String,
        default: "",
      },
      name_hi: { type: String, default: "" },
      start_time: { type: String, default: "" },
      end_time: { type: String, default: "" },
    },
    // Muhurat timings
    muhurats: {
      brahma_muhurat: {
        start: { type: String, default: "" },
        end: { type: String, default: "" },
      },
      abhijit_muhurat: {
        start: { type: String, default: "" },
        end: { type: String, default: "" },
      },
      vijay_muhurat: {
        start: { type: String, default: "" },
        end: { type: String, default: "" },
      },
      amrit_kaal: {
        start: { type: String, default: "" },
        end: { type: String, default: "" },
      },
      rahu_kaal: {
        start: { type: String, default: "" },
        end: { type: String, default: "" },
      },
    },
    // Tarpan information
    tarpan_info: {
      is_tarpan_day: { type: Boolean, default: false },
      tarpan_type: {
        type: String,
        enum: [
          "PITRU_TARPAN",
          "DEV_TARPAN",
          "RISHI_TARPAN",
          "SHRADDHA",
          "NONE",
        ],
        default: "NONE",
      },
      tarpan_description: {
        hi: { type: String, default: "" },
        en: { type: String, default: "" },
      },
      best_time: { type: String, default: "" },
    },
    // Festival / Special day information
    festival: {
      is_festival: { type: Boolean, default: false },
      festival_name: {
        hi: { type: String, default: "" },
        en: { type: String, default: "" },
      },
      festival_description: {
        hi: { type: String, default: "" },
        en: { type: String, default: "" },
      },
      festival_type: {
        type: String,
        enum: ["MAJOR", "MINOR", "REGIONAL", "FASTING", "NONE"],
        default: "NONE",
      },
    },
    // Recommended Poojas for this day
    recommended_poojas: [
      {
        pooja_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "PoojaTemplate",
        },
        priority: {
          type: Number,
          default: 0,
        },
        reason: {
          hi: { type: String, default: "" },
          en: { type: String, default: "" },
        },
      },
    ],
    // Auspicious activities
    auspicious_for: [
      {
        activity: {
          hi: { type: String, default: "" },
          en: { type: String, default: "" },
        },
        icon: { type: String, default: "✓" },
      },
    ],
    // Inauspicious activities
    inauspicious_for: [
      {
        activity: {
          hi: { type: String, default: "" },
          en: { type: String, default: "" },
        },
        icon: { type: String, default: "✗" },
      },
    ],
    // Sunrise and Sunset
    sun_timings: {
      sunrise: { type: String, default: "" },
      sunset: { type: String, default: "" },
    },
    // Moon phase
    moon_phase: {
      phase: {
        type: String,
        enum: [
          "NEW_MOON",
          "WAXING_CRESCENT",
          "FIRST_QUARTER",
          "WAXING_GIBBOUS",
          "FULL_MOON",
          "WANING_GIBBOUS",
          "LAST_QUARTER",
          "WANING_CRESCENT",
        ],
        default: "WAXING_CRESCENT",
      },
      illumination: { type: Number, default: 0 }, // percentage
    },
    // Additional notes
    notes: {
      hi: { type: String, default: "" },
      en: { type: String, default: "" },
    },
    // Location (for different regions, timings may vary)
    location: {
      city: { type: String, default: "Delhi" },
      timezone: { type: String, default: "Asia/Kolkata" },
    },
    // Status
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
  },
);

// Indexes
muhuratCalendarSchema.index({ date: 1 });
muhuratCalendarSchema.index({ "hindu_date.tithi": 1 });
muhuratCalendarSchema.index({ "hindu_date.paksha": 1 });
muhuratCalendarSchema.index({ "hindu_date.masa": 1 });
muhuratCalendarSchema.index({ "tarpan_info.is_tarpan_day": 1 });
muhuratCalendarSchema.index({ "festival.is_festival": 1 });
muhuratCalendarSchema.index({ date: 1, "location.city": 1 }, { unique: true });

module.exports = mongoose.model("MuhuratCalendar", muhuratCalendarSchema);
