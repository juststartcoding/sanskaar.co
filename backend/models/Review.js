const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  pandit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pandit'
  },
  temple: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Temple'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: String,
  comment: {
    type: String,
    required: true
  },
  images: [String],
  helpful: { type: Number, default: 0 },
  verified: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, { timestamps: true });

// Ensure a user can only review an item once
reviewSchema.index({ user: 1, product: 1 }, { unique: true, sparse: true });
reviewSchema.index({ user: 1, course: 1 }, { unique: true, sparse: true });
reviewSchema.index({ user: 1, pandit: 1 }, { unique: true, sparse: true });
reviewSchema.index({ user: 1, temple: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Review', reviewSchema);
