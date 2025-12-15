const mongoose = require('mongoose');

const panditSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  languages: [String],
  specializations: [String],
  experience: Number,
  certifications: [String],
  chantingSamples: [{ audio: String, video: String }],
  gallery: [String],
  ratings: { type: Number, default: 0 },
  availability: [{ date: Date, slots: [String] }],
  fees: { base: Number, travel: Number },
  travelRadius: Number,
  reviews: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, rating: Number, comment: String }],
}, { timestamps: true });

module.exports = mongoose.model('Pandit', panditSchema);