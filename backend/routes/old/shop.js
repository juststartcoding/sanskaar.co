const express = require("express");
const Product = require("../models/Product");
const Order = require("../models/Order");
const auth = require("../middleware/auth");

const router = express.Router();

// ===================================
// PUBLIC PRODUCTS ROUTES
// ===================================

// Get all products (public route - no auth required)
router.get("/products", async (req, res) => {
  try {
    console.log("📦 GET /api/shop/products called");

    const {
      page = 1,
      limit = 20,
      category,
      search,
      minPrice,
      maxPrice,
      featured,
      ecoFriendly,
    } = req.query;

    // Build query
    const query = {};

    if (category && category !== "all") {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { "name.english": { $regex: search, $options: "i" } },
        { "name.hindi": { $regex: search, $options: "i" } },
        { "description.english": { $regex: search, $options: "i" } },
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    if (featured === "true") {
      query.featured = true;
    }

    if (ecoFriendly === "true") {
      query.ecoFriendly = true;
    }

    console.log("🔍 Query:", query);

    // Get products with pagination
    const skip = (page - 1) * limit;
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select("-__v")
      .populate("seller", "name email");

    const total = await Product.countDocuments(query);

    console.log(`✅ Found ${products.length} products (${total} total)`);

    res.json({
      success: true,
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        productsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message,
    });
  }
});

// Get single product by ID or slug (public route)
router.get("/products/:identifier", async (req, res) => {
  try {
    const { identifier } = req.params;
    console.log("📦 GET /api/shop/products/" + identifier);

    // Try to find by ID first, then by slug
    let product;
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      // Valid ObjectId
      product = await Product.findById(identifier).populate(
        "seller",
        "name email"
      );
    } else {
      // Try slug
      product = await Product.findOne({ slug: identifier }).populate(
        "seller",
        "name email"
      );
    }

    if (!product) {
      console.log("❌ Product not found");
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    console.log("✅ Product found:", product.name.english);

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("❌ Error fetching product:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching product",
      error: error.message,
    });
  }
});

// Get featured products
router.get("/products/featured/list", async (req, res) => {
  try {
    const products = await Product.find({ featured: true })
      .limit(8)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching featured products",
      error: error.message,
    });
  }
});

// Get eco-friendly products
router.get("/products/eco-friendly/list", async (req, res) => {
  try {
    const products = await Product.find({ ecoFriendly: true })
      .limit(8)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching eco-friendly products",
      error: error.message,
    });
  }
});

// ===================================
// ORDER ROUTES (Protected)
// ===================================

// Create order
router.post("/orders", auth(), async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in order" });
    }

    // Calculate total
    let total = 0;
    const orderItems = [];

    for (let item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res
          .status(400)
          .json({ message: `Product ${item.productId} not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name.english}. Available: ${product.stock}`,
        });
      }

      const price = product.discountPrice || product.price;
      orderItems.push({
        product: item.productId,
        quantity: item.quantity,
        price: price,
      });

      total += price * item.quantity;
    }

    // Create order
    const order = new Order({
      user: req.user._id,
      items: orderItems,
      total,
      shippingAddress,
      paymentMethod,
      status: "pending",
    });

    await order.save();

    // Update product stock
    for (let item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      success: false,
      message: "Error creating order",
      error: error.message,
    });
  }
});

// Get user's orders
router.get("/orders", auth(), async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message,
    });
  }
});

// Get single order
router.get("/orders/:id", auth(), async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("items.product");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching order",
      error: error.message,
    });
  }
});

module.exports = router;
