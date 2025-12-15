const mongoose = require("mongoose");

const invitationSchema = new mongoose.Schema(
  {
    familyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Family",
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      lowercase: true,
    },
    phone: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "expired", "cancelled"],
      default: "pending",
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    message: {
      type: String,
    },
    acceptedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    acceptedAt: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

invitationSchema.index({ token: 1 });
invitationSchema.index({ familyId: 1 });
invitationSchema.index({ email: 1 });
invitationSchema.index({ expiresAt: 1 });

module.exports = mongoose.model("FamilyInvitation", invitationSchema);
