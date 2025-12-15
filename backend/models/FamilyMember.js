const mongoose = require("mongoose");

const familyMemberSchema = new mongoose.Schema(
  {
    familyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Family",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    displayName: {
      type: String,
      required: true,
    },
    relation: {
      type: String,
      enum: [
        "self",
        "parent",
        "child",
        "spouse",
        "sibling",
        "grandparent",
        "grandchild",
        "other",
      ],
    },
    birthdate: {
      type: Date,
    },
    deathdate: {
      type: Date,
    },
    birthPlace: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", "unspecified"],
      default: "unspecified",
    },
    photoUrl: {
      type: String,
    },
    occupation: {
      type: String,
    },
    education: {
      type: String,
    },
    notes: {
      type: String,
    },
    isAlive: {
      type: Boolean,
      default: true,
    },
    marriageDetails: {
      date: Date,
      place: String,
      spouse: { type: mongoose.Schema.Types.ObjectId, ref: "FamilyMember" },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

familyMemberSchema.index({ familyId: 1 });
familyMemberSchema.index({ userId: 1 });
familyMemberSchema.index({ displayName: "text" });

module.exports = mongoose.model("FamilyMember", familyMemberSchema);
