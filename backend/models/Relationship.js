const mongoose = require("mongoose");

const relationshipSchema = new mongoose.Schema(
  {
    familyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Family",
      required: true,
    },
    fromMemberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FamilyMember",
      required: true,
    },
    toMemberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FamilyMember",
      required: true,
    },
    relationType: {
      type: String,
      enum: [
        "parent", // from is parent of to
        "child", // from is child of to
        "spouse", // from is spouse of to
        "sibling", // from is sibling of to
        "adopted_parent", // from adopted to as parent
        "adopted_child", // from was adopted by to
        "step_parent", // from is step parent of to
        "step_child", // from is step child of to
      ],
      required: true,
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    notes: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

relationshipSchema.index({ familyId: 1 });
relationshipSchema.index({ fromMemberId: 1 });
relationshipSchema.index({ toMemberId: 1 });

// Prevent duplicate relationships
relationshipSchema.index(
  { familyId: 1, fromMemberId: 1, toMemberId: 1, relationType: 1 },
  { unique: true }
);

module.exports = mongoose.model("Relationship", relationshipSchema);
