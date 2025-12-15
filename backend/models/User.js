const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  dob: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  address: { type: String },
  languagePref: { type: String, default: 'en' },
  profilePic: { type: String },
  role: { type: String, enum: ['guest', 'user', 'seller', 'pandit', 'admin', 'superadmin'], default: 'user' },
  kycStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
  walletBalance: { type: Number, default: 0 },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pooja' }],
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);