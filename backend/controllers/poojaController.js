const Pooja = require("../models/Pooja");
const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads/pooja");
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error, null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedAudioTypes = /mp3|wav|ogg|m4a/;
  const allowedVideoTypes = /mp4|avi|mov|wmv|webm/;

  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  if (file.fieldname.includes("image")) {
    const isValid =
      allowedImageTypes.test(extname) && mimetype.startsWith("image/");
    cb(null, isValid);
  } else if (file.fieldname.includes("audio")) {
    const isValid =
      allowedAudioTypes.test(extname) && mimetype.startsWith("audio/");
    cb(null, isValid);
  } else if (file.fieldname.includes("video")) {
    const isValid =
      allowedVideoTypes.test(extname) && mimetype.startsWith("video/");
    cb(null, isValid);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
  },
});

// @desc    Create new pooja
// @route   POST /api/poojas
// @access  Private (Admin/Pandit)
exports.createPooja = async (req, res) => {
  try {
    const { poojaType, poojaLanguage, importance, steps } = req.body;

    // Validation
    if (!poojaType || !poojaLanguage) {
      return res.status(400).json({
        success: false,
        error: "Please provide pooja type and language",
      });
    }

    // Check if importance is provided for all languages
    if (
      !importance ||
      !importance.hindi ||
      !importance.sanskrit ||
      !importance.english
    ) {
      return res.status(400).json({
        success: false,
        error: "Please provide importance in all three languages",
      });
    }

    // Validate steps
    if (!steps || !steps.hindi || !steps.sanskrit || !steps.english) {
      return res.status(400).json({
        success: false,
        error: "Please provide steps in all three languages",
      });
    }

    // Add order to steps
    const processedSteps = {
      hindi: steps.hindi.map((step, index) => ({ ...step, order: index + 1 })),
      sanskrit: steps.sanskrit.map((step, index) => ({
        ...step,
        order: index + 1,
      })),
      english: steps.english.map((step, index) => ({
        ...step,
        order: index + 1,
      })),
    };

    // Create pooja
    const pooja = await Pooja.create({
      poojaType,
      poojaLanguage,
      importance,
      steps: processedSteps,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Pooja created successfully",
      data: pooja,
    });
  } catch (error) {
    console.error("Create Pooja Error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Server error while creating pooja",
    });
  }
};

// @desc    Upload files for pooja step
// @route   POST /api/poojas/:id/upload
// @access  Private
exports.uploadPoojaFiles = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "audio", maxCount: 1 },
  { name: "video", maxCount: 1 },
]);

exports.handleFileUpload = async (req, res) => {
  try {
    const files = req.files;
    const uploadedFiles = {};

    if (files.image) {
      uploadedFiles.image = `/uploads/pooja/${files.image[0].filename}`;
    }
    if (files.audio) {
      uploadedFiles.audio = `/uploads/pooja/${files.audio[0].filename}`;
    }
    if (files.video) {
      uploadedFiles.video = `/uploads/pooja/${files.video[0].filename}`;
    }

    res.status(200).json({
      success: true,
      message: "Files uploaded successfully",
      data: uploadedFiles,
    });
  } catch (error) {
    console.error("File Upload Error:", error);
    res.status(500).json({
      success: false,
      error: "Error uploading files",
    });
  }
};

// @desc    Get all poojas
// @route   GET /api/poojas
// @access  Public
exports.getAllPoojas = async (req, res) => {
  try {
    const { page = 1, limit = 10, language, type, search } = req.query;

    const query = { isActive: true };

    if (language) {
      query.poojaLanguage = language;
    }

    if (type) {
      query.poojaType = { $regex: type, $options: "i" };
    }

    if (search) {
      query.$or = [
        { poojaType: { $regex: search, $options: "i" } },
        { "importance.hindi": { $regex: search, $options: "i" } },
        { "importance.english": { $regex: search, $options: "i" } },
      ];
    }

    const poojas = await Pooja.find(query)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Pooja.countDocuments(query);

    res.status(200).json({
      success: true,
      data: poojas,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalRecords: count,
    });
  } catch (error) {
    console.error("Get Poojas Error:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching poojas",
    });
  }
};

// @desc    Get single pooja by ID
// @route   GET /api/poojas/:id
// @access  Public
exports.getPoojaById = async (req, res) => {
  try {
    const pooja = await Pooja.findById(req.params.id).populate(
      "createdBy",
      "name email role"
    );

    if (!pooja) {
      return res.status(404).json({
        success: false,
        error: "Pooja not found",
      });
    }

    // Increment views
    pooja.views += 1;
    await pooja.save();

    res.status(200).json({
      success: true,
      data: pooja,
    });
  } catch (error) {
    console.error("Get Pooja Error:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching pooja",
    });
  }
};

// @desc    Update pooja
// @route   PUT /api/poojas/:id
// @access  Private (Admin/Creator)
exports.updatePooja = async (req, res) => {
  try {
    let pooja = await Pooja.findById(req.params.id);

    if (!pooja) {
      return res.status(404).json({
        success: false,
        error: "Pooja not found",
      });
    }

    // Check if user is creator or admin
    if (
      pooja.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to update this pooja",
      });
    }

    // Update steps with order
    if (req.body.steps) {
      const processedSteps = {};
      ["hindi", "sanskrit", "english"].forEach((lang) => {
        if (req.body.steps[lang]) {
          processedSteps[lang] = req.body.steps[lang].map((step, index) => ({
            ...step,
            order: index + 1,
          }));
        }
      });
      req.body.steps = processedSteps;
    }

    pooja = await Pooja.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Pooja updated successfully",
      data: pooja,
    });
  } catch (error) {
    console.error("Update Pooja Error:", error);
    res.status(500).json({
      success: false,
      error: "Error updating pooja",
    });
  }
};

// @desc    Delete pooja (soft delete)
// @route   DELETE /api/poojas/:id
// @access  Private (Admin/Creator)
exports.deletePooja = async (req, res) => {
  try {
    const pooja = await Pooja.findById(req.params.id);

    if (!pooja) {
      return res.status(404).json({
        success: false,
        error: "Pooja not found",
      });
    }

    // Check authorization
    if (
      pooja.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to delete this pooja",
      });
    }

    // Soft delete
    pooja.isActive = false;
    await pooja.save();

    res.status(200).json({
      success: true,
      message: "Pooja deleted successfully",
      data: {},
    });
  } catch (error) {
    console.error("Delete Pooja Error:", error);
    res.status(500).json({
      success: false,
      error: "Error deleting pooja",
    });
  }
};

// @desc    Rate a pooja
// @route   POST /api/poojas/:id/rate
// @access  Private
exports.ratePooja = async (req, res) => {
  try {
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: "Please provide a rating between 1 and 5",
      });
    }

    const pooja = await Pooja.findById(req.params.id);

    if (!pooja) {
      return res.status(404).json({
        success: false,
        error: "Pooja not found",
      });
    }

    // Calculate new average rating
    const currentTotal = pooja.ratings.average * pooja.ratings.count;
    const newCount = pooja.ratings.count + 1;
    const newAverage = (currentTotal + rating) / newCount;

    pooja.ratings.average = newAverage;
    pooja.ratings.count = newCount;

    await pooja.save();

    res.status(200).json({
      success: true,
      message: "Rating added successfully",
      data: {
        averageRating: newAverage,
        totalRatings: newCount,
      },
    });
  } catch (error) {
    console.error("Rate Pooja Error:", error);
    res.status(500).json({
      success: false,
      error: "Error rating pooja",
    });
  }
};
