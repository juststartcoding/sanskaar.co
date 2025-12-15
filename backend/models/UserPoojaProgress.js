const mongoose = require("mongoose");

const userPoojaProgressSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pooja_template_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PoojaTemplate",
      required: true,
    },
    status: {
      type: String,
      enum: ["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "ABANDONED"],
      default: "NOT_STARTED",
    },
    current_step_index: {
      type: Number,
      default: 0,
    },
    completed_steps: [{
      step_code: String,
      completed_at: { type: Date, default: Date.now },
      mantra_count: { type: Number, default: 0 },
    }],
    started_at: {
      type: Date,
    },
    completed_at: {
      type: Date,
    },
    total_time_spent_minutes: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
userPoojaProgressSchema.index({ user_id: 1, pooja_template_id: 1 });
userPoojaProgressSchema.index({ user_id: 1, status: 1 });

module.exports = mongoose.model("UserPoojaProgress", userPoojaProgressSchema);
