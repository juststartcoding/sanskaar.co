const Pooja = require("../models/Pooja");
const PoojaTemplate = require("../models/PoojaTemplate");
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
    const { page = 1, limit = 20, language, type, search, category, featured } = req.query;

    // First try to get from PoojaTemplate (new system)
    const templateQuery = { isActive: true };
    
    if (category) {
      templateQuery.category = category;
    }
    if (featured === 'true') {
      templateQuery.isFeatured = true;
    }
    if (search) {
      templateQuery.$or = [
        { "name.hi": { $regex: search, $options: "i" } },
        { "name.en": { $regex: search, $options: "i" } },
        { "description.hi": { $regex: search, $options: "i" } },
        { "description.en": { $regex: search, $options: "i" } },
      ];
    }

    const templates = await PoojaTemplate.find(templateQuery)
      .populate("deity_id", "name icon_url")
      .populate("steps.step_id", "title icon_url")
      .populate("samagri_list.product_id", "name images price")
      .sort({ isFeatured: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const templateCount = await PoojaTemplate.countDocuments(templateQuery);

    // Also get from old Pooja model for backward compatibility
    const poojaQuery = { isActive: true };
    if (language) {
      poojaQuery.poojaLanguage = language;
    }
    if (type) {
      poojaQuery.poojaType = { $regex: type, $options: "i" };
    }
    if (search) {
      poojaQuery.$or = [
        { poojaType: { $regex: search, $options: "i" } },
        { "importance.hindi": { $regex: search, $options: "i" } },
        { "importance.english": { $regex: search, $options: "i" } },
      ];
    }

    const oldPoojas = await Pooja.find(poojaQuery)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const oldCount = await Pooja.countDocuments(poojaQuery);

    // Transform templates to match frontend expected format
    const transformedTemplates = templates.map(t => ({
      _id: t._id,
      poojaType: t.name?.en || t.name?.hi || "Pooja",
      poojaName: t.name,
      name: t.name,
      slug: t.slug,
      poojaLanguage: "hindi",
      importance: {
        hindi: t.short_description?.hi || t.description?.hi || "",
        english: t.short_description?.en || t.description?.en || "",
        sanskrit: "",
      },
      description: t.description,
      short_description: t.short_description,
      deity: t.deity_id,
      category: t.category,
      difficulty_level: t.difficulty_level,
      total_duration_minutes: t.total_duration_minutes,
      main_image_url: t.main_image_url,
      thumbnail_url: t.thumbnail_url,
      steps: {
        hindi: t.steps?.map(s => ({
          title: s.step_id?.title?.hi || s.step_code,
          order: s.order,
          duration_minutes: s.duration_minutes,
        })) || [],
        english: t.steps?.map(s => ({
          title: s.step_id?.title?.en || s.step_code,
          order: s.order,
          duration_minutes: s.duration_minutes,
        })) || [],
        sanskrit: [],
      },
      samagri_list: t.samagri_list,
      ratings: t.ratings,
      views: t.views,
      completions: t.completions,
      isFeatured: t.isFeatured,
      isActive: t.isActive,
      isTemplate: true,
      createdAt: t.createdAt,
    }));

    // Combine both results (templates first, then old poojas)
    const allPoojas = [...transformedTemplates, ...oldPoojas];
    const totalCount = templateCount + oldCount;

    res.status(200).json({
      success: true,
      data: allPoojas,
      templates: transformedTemplates,
      poojas: oldPoojas,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: parseInt(page),
      totalRecords: totalCount,
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
    const { id } = req.params;

    // First try to find in PoojaTemplate
    let template = await PoojaTemplate.findById(id)
      .populate("deity_id")
      .populate("aarti_id")
      .populate("steps.step_id")
      .populate("steps.mantra_id")
      .populate("samagri_list.product_id");

    if (template) {
      // Increment views
      template.views = (template.views || 0) + 1;
      await template.save();

      // Transform to expected format
      const transformedTemplate = {
        _id: template._id,
        poojaType: template.name?.en || template.name?.hi || "Pooja",
        poojaName: template.name,
        name: template.name,
        slug: template.slug,
        poojaLanguage: "hindi",
        importance: {
          hindi: template.short_description?.hi || template.description?.hi || "",
          english: template.short_description?.en || template.description?.en || "",
          sanskrit: "",
        },
        description: template.description,
        short_description: template.short_description,
        benefits: template.benefits,
        deity: template.deity_id,
        aarti: template.aarti_id,
        category: template.category,
        difficulty_level: template.difficulty_level,
        total_duration_minutes: template.total_duration_minutes,
        main_image_url: template.main_image_url,
        thumbnail_url: template.thumbnail_url,
        steps: {
          hindi: template.steps?.map(s => ({
            _id: s._id,
            step_code: s.step_code,
            title: s.step_id?.title?.hi || s.step_code,
            instruction: s.step_id?.instruction?.hi || s.custom_instruction?.hi || "",
            icon_url: s.step_id?.icon_url,
            image_url: s.step_id?.image_url,
            audio_url: s.step_id?.audio_url,
            video_url: s.step_id?.video_url,
            mantra: s.mantra_id,
            mantra_repeat_count: s.mantra_repeat_count,
            order: s.order,
            duration_minutes: s.duration_minutes,
            is_optional: s.is_optional,
          })) || [],
          english: template.steps?.map(s => ({
            _id: s._id,
            step_code: s.step_code,
            title: s.step_id?.title?.en || s.step_code,
            instruction: s.step_id?.instruction?.en || s.custom_instruction?.en || "",
            icon_url: s.step_id?.icon_url,
            image_url: s.step_id?.image_url,
            audio_url: s.step_id?.audio_url,
            video_url: s.step_id?.video_url,
            mantra: s.mantra_id,
            mantra_repeat_count: s.mantra_repeat_count,
            order: s.order,
            duration_minutes: s.duration_minutes,
            is_optional: s.is_optional,
          })) || [],
          sanskrit: [],
        },
        templateSteps: template.steps,
        samagri_list: template.samagri_list,
        ratings: template.ratings,
        views: template.views,
        completions: template.completions,
        isFeatured: template.isFeatured,
        isActive: template.isActive,
        isTemplate: true,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
      };

      return res.status(200).json({
        success: true,
        data: transformedTemplate,
      });
    }

    // If not found in templates, try old Pooja model
    const pooja = await Pooja.findById(id).populate("createdBy", "name email role");

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
