const express = require("express");
const { authenticate, adminOnly } = require("../middleware/auth");
const User = require("../models/User");
const Pooja = require("../models/Pooja");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Booking = require("../models/Booking");
const WasteRequest = require("../models/WasteRequest");
const Temple = require("../models/Temple");
const Course = require("../models/Course");
const Pandit = require("../models/Pandit");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// ============================================
// AUTHENTICATION MIDDLEWARE FOR ALL ADMIN ROUTES
// ============================================
router.use(authenticate);
router.use(adminOnly);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mp3|wav|pdf/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

// ============================================
// DASHBOARD & ANALYTICS ROUTES
// ============================================

// Get dashboard statistics
router.get("/dashboard/stats", async (req, res) => {
  try {
    const [
      totalUsers,
      totalPoojas,
      totalProducts,
      totalPandits,
      totalWasteRequests,
      activePoojas,
      pendingWasteRequests,
      totalOrders,
      totalBookings,
      totalTemples,
      totalCourses,
    ] = await Promise.all([
      User.countDocuments(),
      Pooja.countDocuments(),
      Product.countDocuments(),
      Pandit.countDocuments(),
      WasteRequest.countDocuments(),
      Pooja.countDocuments({ isActive: true }),
      WasteRequest.countDocuments({ status: "pending" }),
      Order.countDocuments(),
      Booking.countDocuments(),
      Temple.countDocuments(),
      Course.countDocuments(),
    ]);

    res.json({
      totalUsers,
      totalPoojas,
      totalProducts,
      totalPandits,
      totalWasteRequests,
      activePoojas,
      pendingWasteRequests,
      totalOrders,
      totalBookings,
      totalTemples,
      totalCourses,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Legacy analytics route (keep for backward compatibility)
router.get("/analytics", async (req, res) => {
  try {
    const stats = {
      users: await User.countDocuments(),
      poojas: await Pooja.countDocuments(),
      orders: await Order.countDocuments(),
      bookings: await Booking.countDocuments(),
      wasteRequests: await WasteRequest.countDocuments(),
      temples: await Temple.countDocuments(),
      courses: await Course.countDocuments(),
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============================================
// USER MANAGEMENT ROUTES
// ============================================

router.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/users/:id/kyc", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { kycStatus: req.body.status },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============================================
// POOJA MANAGEMENT ROUTES
// ============================================

router.get("/poojas", async (req, res) => {
  try {
    const { page = 1, limit = 20, search, isActive, category } = req.query;

    const query = {};
    if (search) {
      query.poojaType = { $regex: search, $options: "i" };
    }
    if (isActive !== undefined) {
      query.isActive = isActive === "true";
    }
    if (category && category !== "all") {
      query.category = category;
    }

    const poojas = await Pooja.find(query)
      .populate("createdBy", "name email")
      .populate("samagri.productId", "name mainImage price")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Pooja.countDocuments(query);

    res.json({
      poojas,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/poojas/:id", async (req, res) => {
  try {
    const pooja = await Pooja.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("samagri.productId", "name mainImage price discountPrice");
    if (!pooja) {
      return res.status(404).json({ message: "Pooja not found" });
    }
    res.json(pooja);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/poojas", async (req, res) => {
  try {
    const { 
      poojaType, 
      poojaLanguage, 
      importance, 
      steps, 
      samagri,
      mainImage,
      duration,
      price,
      category,
      featured 
    } = req.body;

    if (!poojaType || !poojaLanguage) {
      return res
        .status(400)
        .json({ message: "Pooja type and language are required" });
    }

    // Create user ID - use from auth or create dummy for testing
    const createdBy = req.user?._id || "000000000000000000000000";

    const pooja = new Pooja({
      poojaType,
      poojaLanguage,
      mainImage: mainImage || "",
      duration: duration || "",
      price: price || 0,
      category: category || "Other",
      featured: featured || false,
      importance: importance || { hindi: "", sanskrit: "", english: "" },
      steps: steps || { hindi: [], sanskrit: [], english: [] },
      samagri: samagri || [],
      createdBy,
    });

    await pooja.save();
    
    // Populate samagri products if any
    await pooja.populate('samagri.productId');
    
    res.status(201).json({ message: "Pooja created successfully", pooja });
  } catch (error) {
    console.error("Error creating pooja:", error);
    res.status(500).json({ message: error.message });
  }
});

router.put("/poojas/:id", async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.createdBy;
    delete updateData.createdAt;
    
    const pooja = await Pooja.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('samagri.productId');

    if (!pooja) {
      return res.status(404).json({ message: "Pooja not found" });
    }

    res.json({ message: "Pooja updated successfully", pooja });
  } catch (error) {
    console.error("Error updating pooja:", error);
    res.status(500).json({ message: error.message });
  }
});

router.delete("/poojas/:id", async (req, res) => {
  try {
    const pooja = await Pooja.findByIdAndDelete(req.params.id);

    if (!pooja) {
      return res.status(404).json({ message: "Pooja not found" });
    }

    res.json({ message: "Pooja deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/poojas/:id/toggle-status", async (req, res) => {
  try {
    const pooja = await Pooja.findById(req.params.id);

    if (!pooja) {
      return res.status(404).json({ message: "Pooja not found" });
    }

    pooja.isActive = !pooja.isActive;
    await pooja.save();

    res.json({
      message: `Pooja ${
        pooja.isActive ? "activated" : "deactivated"
      } successfully`,
      pooja,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============================================
// PRODUCT MANAGEMENT ROUTES
// ============================================

router.get("/products", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      featured,
      ecoFriendly,
    } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { "name.english": { $regex: search, $options: "i" } },
        { "name.hindi": { $regex: search, $options: "i" } },
      ];
    }
    if (category) query.category = category;
    if (featured !== undefined) query.featured = featured === "true";
    if (ecoFriendly !== undefined) query.ecoFriendly = ecoFriendly === "true";

    const products = await Product.find(query)
      .populate("seller", "name email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "seller",
      "name email"
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/products", async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      category,
      price,
      mrp,
      stock,
      specifications,
    } = req.body;

    if (!name || !name.english || !name.hindi || !slug || !category || !price) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      return res.status(400).json({ message: "Product slug already exists" });
    }

    const product = new Product({
      name,
      slug,
      description: description || { english: "", hindi: "" },
      category,
      price,
      mrp: mrp || price,
      discountPrice: req.body.discountPrice,
      mainImage: req.body.mainImage || "",
      images: req.body.images || [],
      stock: stock || 0,
      ecoFriendly: req.body.ecoFriendly || false,
      featured: req.body.featured || false,
      specifications: specifications || {},
      seller: req.body.seller || req.user?._id || null,
      createdBy: req.user?._id || null,
    });

    await product.save();
    res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/products/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product updated successfully", product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/products/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/products/:id/toggle-featured", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.featured = !product.featured;
    await product.save();

    res.json({
      message: `Product ${
        product.featured ? "featured" : "unfeatured"
      } successfully`,
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============================================
// PANDIT MANAGEMENT ROUTES
// ============================================

router.get("/pandits", async (req, res) => {
  try {
    const { page = 1, limit = 20, search, specialization } = req.query;

    const query = {};
    if (specialization) {
      query.specializations = { $in: [specialization] };
    }

    const pandits = await Pandit.find(query)
      .populate("userId", "name email phone profilePic")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    let filteredPandits = pandits;
    if (search) {
      filteredPandits = pandits.filter(
        (p) =>
          p.userId &&
          p.userId.name &&
          p.userId.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    const count = await Pandit.countDocuments(query);

    res.json({
      pandits: filteredPandits,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/pandits/:id", async (req, res) => {
  try {
    const pandit = await Pandit.findById(req.params.id)
      .populate("userId", "name email phone profilePic")
      .populate("reviews.user", "name profilePic");

    if (!pandit) {
      return res.status(404).json({ message: "Pandit not found" });
    }
    res.json(pandit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/pandits/:id", async (req, res) => {
  try {
    const pandit = await Pandit.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    ).populate("userId", "name email phone");

    if (!pandit) {
      return res.status(404).json({ message: "Pandit not found" });
    }

    res.json({ message: "Pandit profile updated successfully", pandit });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/pandits/:id", async (req, res) => {
  try {
    const pandit = await Pandit.findByIdAndDelete(req.params.id);

    if (!pandit) {
      return res.status(404).json({ message: "Pandit not found" });
    }

    res.json({ message: "Pandit profile deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve pandit
router.patch("/pandits/:id/approve", async (req, res) => {
  try {
    const pandit = await Pandit.findByIdAndUpdate(
      req.params.id,
      {
        isApproved: true,
        isActive: true,
        approvedAt: new Date(),
        approvedBy: req.user?.id,
      },
      { new: true }
    );

    if (!pandit) {
      return res.status(404).json({ message: "Pandit not found" });
    }

    console.log("✅ Pandit approved:", pandit._id);
    res.json({
      success: true,
      message: "Pandit approved successfully",
      pandit,
    });
  } catch (error) {
    console.error("❌ Approve error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Reject pandit
router.patch("/pandits/:id/reject", async (req, res) => {
  try {
    const pandit = await Pandit.findByIdAndUpdate(
      req.params.id,
      {
        isApproved: false,
        isActive: false,
        rejectedAt: new Date(),
        rejectedBy: req.user?.id,
      },
      { new: true }
    );

    if (!pandit) {
      return res.status(404).json({ message: "Pandit not found" });
    }

    console.log("❌ Pandit rejected:", pandit._id);
    res.json({
      success: true,
      message: "Pandit rejected",
      pandit,
    });
  } catch (error) {
    console.error("❌ Reject error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Toggle active status
router.patch("/pandits/:id/toggle-active", async (req, res) => {
  try {
    const pandit = await Pandit.findById(req.params.id);

    if (!pandit) {
      return res.status(404).json({ message: "Pandit not found" });
    }

    pandit.isActive = !pandit.isActive;
    await pandit.save();

    console.log("🔄 Pandit active toggled:", pandit._id, pandit.isActive);
    res.json({
      success: true,
      message: `Pandit ${
        pandit.isActive ? "activated" : "deactivated"
      } successfully`,
      pandit,
    });
  } catch (error) {
    console.error("❌ Toggle error:", error);
    res.status(500).json({ message: error.message });
  }
});

// ============================================
// WASTE COLLECTION MANAGEMENT ROUTES
// ============================================

router.get("/waste-requests", async (req, res) => {
  try {
    const { page = 1, limit = 20, status, priority } = req.query;

    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;

    console.log("📥 Fetching waste requests, query:", query);

    const requests = await WasteRequest.find(query)
      .populate("userId", "name email phone")
      .populate("assignedTo", "name email")
      .populate("collectedBy", "name email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await WasteRequest.countDocuments(query);

    console.log("✅ Found", count, "waste requests");

    res.json({
      requests,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count,
    });
  } catch (error) {
    console.error("❌ Error fetching waste requests:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/waste-requests/:id", async (req, res) => {
  try {
    const request = await WasteRequest.findById(req.params.id)
      .populate("userId", "name email phone")
      .populate("assignedTo", "name email phone")
      .populate("collectedBy", "name email phone");

    if (!request) {
      return res.status(404).json({ message: "Waste request not found" });
    }
    res.json(request);
  } catch (error) {
    console.error("❌ Error fetching waste request:", error);
    res.status(500).json({ message: error.message });
  }
});

router.put("/waste-requests/:id", async (req, res) => {
  try {
    const request = await WasteRequest.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    ).populate("userId", "name email phone");

    if (!request) {
      return res.status(404).json({ message: "Waste request not found" });
    }

    res.json({ message: "Waste request updated successfully", request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/waste-requests/:id/assign", async (req, res) => {
  try {
    const { assignedTo } = req.body; // Changed from processorId

    const request = await WasteRequest.findByIdAndUpdate(
      req.params.id,
      {
        assignedTo, // Changed from processorId
        status: "in_progress", // Changed from scheduled
      },
      { new: true }
    )
      .populate("userId", "name email")
      .populate("assignedTo", "name email"); // Changed from processorId

    if (!request) {
      return res.status(404).json({ message: "Waste request not found" });
    }

    res.json({
      success: true,
      message: "Collector assigned successfully",
      request,
    });
  } catch (error) {
    console.error("❌ Error assigning collector:", error);
    res.status(500).json({ message: error.message });
  }
});

router.patch("/waste-requests/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    // Updated status values to match new model
    if (
      !["pending", "in_progress", "completed", "cancelled"].includes(status)
    ) {
      return res.status(400).json({
        message:
          "Invalid status. Must be: pending, in_progress, completed, or cancelled",
      });
    }

    const updateData = { status };

    // If marking as completed, add collectedAt timestamp
    if (status === "completed") {
      updateData.collectedAt = new Date();
    }

    const request = await WasteRequest.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
      .populate("userId", "name email")
      .populate("assignedTo", "name email")
      .populate("collectedBy", "name email");

    if (!request) {
      return res.status(404).json({ message: "Waste request not found" });
    }

    console.log("✅ Status updated to:", status);

    res.json({
      success: true,
      message: "Status updated successfully",
      request,
    });
  } catch (error) {
    console.error("❌ Error updating status:", error);
    res.status(500).json({ message: error.message });
  }
});

// ============================================
// FILE UPLOAD ROUTE
// ============================================

router.post(
  "/upload",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "images", maxCount: 10 },
    { name: "audio", maxCount: 1 },
    { name: "video", maxCount: 1 },
    { name: "mainImage", maxCount: 1 },
  ]),
  (req, res) => {
    try {
      const files = {};

      if (req.files) {
        Object.keys(req.files).forEach((key) => {
          files[key] = req.files[key].map(
            (file) => `/uploads/${file.filename}`
          );
        });
      }

      res.json({
        message: "Files uploaded successfully",
        files,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// ===================================
// TEMPLE MANAGEMENT ROUTES
// ===================================

// Get all temples with filters
router.get("/temples", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      state,
      city,
      deity,
      featured,
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { "name.english": { $regex: search, $options: "i" } },
        { "name.hindi": { $regex: search, $options: "i" } },
        { "location.city": { $regex: search, $options: "i" } },
      ];
    }

    if (state) query["location.state"] = state;
    if (city) query["location.city"] = city;
    if (deity) query.mainDeity = deity;
    if (featured === "true") query.featured = true;

    const skip = (page - 1) * limit;
    const temples = await Temple.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("addedBy", "name email");

    const total = await Temple.countDocuments(query);

    res.json({
      success: true,
      temples,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalTemples: total,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single temple
router.get("/temples/:id", async (req, res) => {
  try {
    const temple = await Temple.findById(req.params.id)
      .populate("addedBy", "name email")
      .populate("claimedBy", "name email");

    if (!temple) {
      return res.status(404).json({ message: "Temple not found" });
    }

    res.json({ success: true, temple });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create temple
router.post("/temples", async (req, res) => {
  try {
    const templeData = {
      ...req.body,
      addedBy: req.user._id,
      slug:
        req.body.slug ||
        req.body.name.english.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    };

    const temple = new Temple(templeData);
    await temple.save();

    res.status(201).json({
      success: true,
      message: "Temple added successfully",
      temple,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Temple slug already exists" });
    }
    res.status(500).json({ message: error.message });
  }
});

// Update temple
router.put("/temples/:id", async (req, res) => {
  try {
    const temple = await Temple.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!temple) {
      return res.status(404).json({ message: "Temple not found" });
    }

    res.json({
      success: true,
      message: "Temple updated successfully",
      temple,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete temple
router.delete("/temples/:id", async (req, res) => {
  try {
    const temple = await Temple.findByIdAndDelete(req.params.id);

    if (!temple) {
      return res.status(404).json({ message: "Temple not found" });
    }

    res.json({
      success: true,
      message: "Temple deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle featured status
router.patch("/temples/:id/toggle-featured", async (req, res) => {
  try {
    const temple = await Temple.findById(req.params.id);

    if (!temple) {
      return res.status(404).json({ message: "Temple not found" });
    }

    temple.featured = !temple.featured;
    await temple.save();

    res.json({
      success: true,
      message: `Temple ${
        temple.featured ? "featured" : "unfeatured"
      } successfully`,
      temple,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle active status
router.patch("/temples/:id/toggle-active", async (req, res) => {
  try {
    const temple = await Temple.findById(req.params.id);

    if (!temple) {
      return res.status(404).json({ message: "Temple not found" });
    }

    temple.isActive = !temple.isActive;
    await temple.save();

    res.json({
      success: true,
      message: `Temple ${
        temple.isActive ? "activated" : "deactivated"
      } successfully`,
      temple,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Verify temple
router.patch("/temples/:id/verify", async (req, res) => {
  try {
    const temple = await Temple.findById(req.params.id);

    if (!temple) {
      return res.status(404).json({ message: "Temple not found" });
    }

    temple.isVerified = true;
    await temple.save();

    res.json({
      success: true,
      message: "Temple verified successfully",
      temple,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
