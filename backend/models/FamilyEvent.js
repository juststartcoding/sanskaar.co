const mongoose = require("mongoose");

const familyEventSchema = new mongoose.Schema(
  {
    familyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Family",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    eventType: {
      type: String,
      enum: [
        "birth",
        "death",
        "marriage",
        "anniversary",
        "achievement",
        "reunion",
        "other",
      ],
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
    },
    location: {
      type: String,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FamilyMember",
      },
    ],
    photos: [
      {
        url: String,
        caption: String,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

familyEventSchema.index({ familyId: 1, date: -1 });
familyEventSchema.index({ eventType: 1 });

module.exports = mongoose.model("FamilyEvent", familyEventSchema);
