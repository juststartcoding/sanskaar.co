const mongoose = require('mongoose');

const nodeSchema = new mongoose.Schema({
  name: String,
  photo: String,
  voiceClip: String,
  bio: String,
  relationships: [{ relation: String, toNodeId: mongoose.Schema.Types.ObjectId }],
});

const familyTreeSchema = new mongoose.Schema({
  ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  nodes: [nodeSchema],
  privacy: { type: String, enum: ['public', 'private', 'invite-only'] },
}, { timestamps: true });

module.exports = mongoose.model('FamilyTree', familyTreeSchema);