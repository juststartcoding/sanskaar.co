const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      english: { type: String, required: true },
      hindi: { type: String, required: true },
    },
    slug: { type: String, required: true, unique: true },
    description: {
      english: { type: String, required: true },
      hindi: { type: String, required: true },
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Pooja Kit",
        "Flowers",
        "Incense",
        "Lamps & Diyas",
        "Idols",
        "Puja Thali",
        "Eco-Friendly",
        "Books",
        "Accessories",
      ],
    },
    price: { type: Number, required: true },
    mrp: { type: Number },
    discountPrice: { type: Number },
    mainImage: { type: String, required: true },
    images: [String],
    stock: { type: Number, default: 0 },
    ecoFriendly: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    specifications: {
      weight: String,
      dimensions: String,
      material: String,
      origin: String,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Index for search
productSchema.index({ "name.english": "text", "description.english": "text" });
productSchema.index({ category: 1 });
productSchema.index({ featured: 1 });

module.exports = mongoose.model("Product", productSchema);
