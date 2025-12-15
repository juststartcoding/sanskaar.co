const mongoose = require("mongoose");

const familySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    ownerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    inviteCode: {
      type: String,
      unique: true,
      required: true,
    },
    description: {
      type: String,
    },
    privacy: {
      type: String,
      enum: ["private", "members"],
      default: "private",
    },
    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        role: {
          type: String,
          enum: ["admin", "member"],
          default: "member",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    settings: {
      allowMemberInvite: { type: Boolean, default: false },
      autoApproveMembers: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

familySchema.index({ inviteCode: 1 });
familySchema.index({ "members.userId": 1 });
familySchema.index({ ownerUserId: 1 });

module.exports = mongoose.model("Family", familySchema);
