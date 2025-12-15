const mongoose = require('mongoose');

const chatLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  conversation: [{ role: String, message: String }],
  resolutionFlag: Boolean,
}, { timestamps: true });

module.exports = mongoose.model('ChatLog', chatLogSchema);