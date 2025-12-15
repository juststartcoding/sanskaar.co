const Pooja = require("../models/Pooja");
const Product = require("../models/Product");
const Pandit = require("../models/Pandit");
const WasteRequest = require("../models/WasteRequest");
const User = require("../models/User");
const multer = require("multer");
const path = require("path");

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

// Pooja Management
exports.getAllPoojas = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, isActive } = req.query;

    const query = {};
    if (search) {
      query.poojaType = { $regex: search, $options: "i" };
    }
    if (isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    const poojas = await Pooja.find(query)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Pooja.countDocuments(query);

    res.json({
      poojas,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPoojaById = async (req, res) => {
  try {
    const pooja = await Pooja.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );
    if (!pooja) {
      return res.status(404).json({ message: "Pooja not found" });
    }
    res.json(pooja);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createPooja = async (req, res) => {
  try {
    const { poojaType, poojaLanguage, importance, steps } = req.body;

    // Validate required fields
    if (!poojaType || !poojaLanguage) {
      return res
        .status(400)
        .json({ message: "Pooja type and language are required" });
    }

    const pooja = new Pooja({
      poojaType,
      poojaLanguage,
      importance: importance || { hindi: "", sanskrit: "", english: "" },
      steps: steps || { hindi: [], sanskrit: [], english: [] },
      createdBy: req.user._id,
    });

    await pooja.save();
    res.status(201).json({ message: "Pooja created successfully", pooja });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePooja = async (req, res) => {
  try {
    const pooja = await Pooja.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!pooja) {
      return res.status(404).json({ message: "Pooja not found" });
    }

    res.json({ message: "Pooja updated successfully", pooja });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deletePooja = async (req, res) => {
  try {
    const pooja = await Pooja.findByIdAndDelete(req.params.id);

    if (!pooja) {
      return res.status(404).json({ message: "Pooja not found" });
    }

    res.json({ message: "Pooja deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.togglePoojaStatus = async (req, res) => {
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
};

// Product Management
exports.getAllProducts = async (req, res) => {
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
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProductById = async (req, res) => {
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
};

exports.createProduct = async (req, res) => {
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

    // Validate required fields
    if (!name || !name.english || !name.hindi || !slug || !category || !price) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    // Check if slug already exists
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
      seller: req.user._id,
    });

    await product.save();
    res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
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
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.toggleProductFeatured = async (req, res) => {
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
};

// Pandit Management
exports.getAllPandits = async (req, res) => {
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

    // If search query, filter by name in populated userId
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
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPanditById = async (req, res) => {
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
};

exports.updatePandit = async (req, res) => {
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
};

exports.deletePandit = async (req, res) => {
  try {
    const pandit = await Pandit.findByIdAndDelete(req.params.id);

    if (!pandit) {
      return res.status(404).json({ message: "Pandit not found" });
    }

    res.json({ message: "Pandit profile deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Waste Collection Management
exports.getAllWasteRequests = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, priority } = req.query;

    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const requests = await WasteRequest.find(query)
      .populate("userId", "name email phone")
      .populate("processorId", "name email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await WasteRequest.countDocuments(query);

    res.json({
      requests,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getWasteRequestById = async (req, res) => {
  try {
    const request = await WasteRequest.findById(req.params.id)
      .populate("userId", "name email phone")
      .populate("processorId", "name email phone");

    if (!request) {
      return res.status(404).json({ message: "Waste request not found" });
    }
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateWasteRequest = async (req, res) => {
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
};

exports.assignWasteProcessor = async (req, res) => {
  try {
    const { processorId } = req.body;

    const request = await WasteRequest.findByIdAndUpdate(
      req.params.id,
      {
        processorId,
        status: "scheduled",
      },
      { new: true }
    )
      .populate("userId", "name email")
      .populate("processorId", "name email");

    if (!request) {
      return res.status(404).json({ message: "Waste request not found" });
    }

    res.json({ message: "Processor assigned successfully", request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateWasteStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["pending", "scheduled", "collected", "processed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const request = await WasteRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("userId", "name email");

    if (!request) {
      return res.status(404).json({ message: "Waste request not found" });
    }

    res.json({ message: "Status updated successfully", request });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Dashboard Analytics
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalPoojas,
      totalProducts,
      totalPandits,
      totalWasteRequests,
      activePoojas,
      pendingWasteRequests,
    ] = await Promise.all([
      User.countDocuments(),
      Pooja.countDocuments(),
      Product.countDocuments(),
      Pandit.countDocuments(),
      WasteRequest.countDocuments(),
      Pooja.countDocuments({ isActive: true }),
      WasteRequest.countDocuments({ status: "pending" }),
    ]);

    res.json({
      totalUsers,
      totalPoojas,
      totalProducts,
      totalPandits,
      totalWasteRequests,
      activePoojas,
      pendingWasteRequests,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// File upload handler
exports.uploadMiddleware = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "images", maxCount: 10 },
  { name: "audio", maxCount: 1 },
  { name: "video", maxCount: 1 },
  { name: "mainImage", maxCount: 1 },
]);

exports.handleFileUpload = (req, res) => {
  try {
    const files = {};

    if (req.files) {
      Object.keys(req.files).forEach((key) => {
        files[key] = req.files[key].map((file) => `/uploads/${file.filename}`);
      });
    }

    res.json({
      message: "Files uploaded successfully",
      files,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = exports;
