const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  panditId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pandit' },
  poojaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pooja' },
  method: String,
  dateTime: Date,
  location: { type: String, enum: ['home', 'temple', 'virtual'] },
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'] },
  payment: { amount: Number, status: String },
  notes: String,
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);