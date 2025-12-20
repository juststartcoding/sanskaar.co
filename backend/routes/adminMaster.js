const express = require("express");
const multer = require("multer");
const { authenticate, adminOnly } = require("../middleware/auth");
const { uploadToCloud, uploadFromBuffer, deleteFromCloud } = require("../services/cloudinaryService");

// Models
const PoojaStepMaster = require("../models/PoojaStepMaster");
const MantraMaster = require("../models/MantraMaster");
const DeityMaster = require("../models/DeityMaster");
const AartiMaster = require("../models/AartiMaster");
const PoojaTemplate = require("../models/PoojaTemplate");

const router = express.Router();

// Multer configuration for memory storage (for cloud upload)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "video/mp4",
      "video/webm",
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

// Apply authentication to all routes
router.use(authenticate);
router.use(adminOnly);

// ============================================
// CLOUD UPLOAD ENDPOINT
// ============================================

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file provided" });
    }

    const { type = "image", folder } = req.body;
    
    // Determine file type from mimetype
    let fileType = type;
    if (req.file.mimetype.startsWith("audio")) {
      fileType = "audio";
    } else if (req.file.mimetype.startsWith("video")) {
      fileType = "video";
    } else if (req.file.mimetype.startsWith("image")) {
      fileType = "image";
    }

    // Convert buffer to base64 data URI for upload
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    const result = await uploadToCloud(dataURI, fileType, folder);

    if (!result.success) {
      return res.status(500).json({ success: false, message: result.error });
    }

    res.json({
      success: true,
      url: result.url,
      public_id: result.public_id,
      duration: result.duration,
      format: result.format,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// POOJA STEPS MASTER CRUD
// ============================================

// Get all steps - support both /steps and /pooja-steps
router.get("/steps", async (req, res) => {
  try {
    const { page = 1, limit = 50, search, active } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { step_code: { $regex: search, $options: "i" } },
        { "title.hi": { $regex: search, $options: "i" } },
        { "title.en": { $regex: search, $options: "i" } },
      ];
    }
    if (active !== undefined) {
      query.isActive = active === "true";
    }

    const steps = await PoojaStepMaster.find(query)
      .sort({ order_hint: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await PoojaStepMaster.countDocuments(query);

    res.json({
      success: true,
      steps,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single step
router.get("/steps/:id", async (req, res) => {
  try {
    const step = await PoojaStepMaster.findById(req.params.id);
    if (!step) {
      return res.status(404).json({ success: false, message: "Step not found" });
    }
    res.json({ success: true, step });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create step
router.post("/steps", async (req, res) => {
  try {
    const { step_code, title, instruction, description, icon_url, image_url, audio_url, video_url, is_mandatory, order_hint, duration_minutes, background_color } = req.body;

    if (!step_code || !title?.hi || !title?.en) {
      return res.status(400).json({ success: false, message: "step_code, title.hi, and title.en are required" });
    }

    const existing = await PoojaStepMaster.findOne({ step_code: step_code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: "Step code already exists" });
    }

    const step = new PoojaStepMaster({
      step_code: step_code.toUpperCase(),
      title,
      instruction,
      description,
      icon_url,
      image_url,
      audio_url,
      video_url,
      is_mandatory,
      order_hint,
      duration_minutes,
      background_color,
      createdBy: req.user._id,
    });

    await step.save();
    res.status(201).json({ success: true, message: "Step created", step });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update step
router.put("/steps/:id", async (req, res) => {
  try {
    const step = await PoojaStepMaster.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!step) {
      return res.status(404).json({ success: false, message: "Step not found" });
    }

    res.json({ success: true, message: "Step updated", step });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete step
router.delete("/steps/:id", async (req, res) => {
  try {
    const step = await PoojaStepMaster.findByIdAndDelete(req.params.id);
    if (!step) {
      return res.status(404).json({ success: false, message: "Step not found" });
    }
    res.json({ success: true, message: "Step deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// Legacy routes removed - use /steps endpoints instead
// The /steps endpoints support the new nested title/instruction format

// ============================================
// MANTRAS MASTER CRUD
// ============================================

router.get("/mantras", async (req, res) => {
  try {
    const { page = 1, limit = 50, search, category, deity } = req.query;
    
    const query = { isActive: true };
    if (search) {
      query.$or = [
        { mantra_name: { $regex: search, $options: "i" } },
        { mantra_code: { $regex: search, $options: "i" } },
        { "text.hi": { $regex: search, $options: "i" } },
        { "text.sa": { $regex: search, $options: "i" } },
      ];
    }
    if (category) query.category = category;
    if (deity) query.deity_id = deity;

    const mantras = await MantraMaster.find(query)
      .populate("deity_id", "name")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await MantraMaster.countDocuments(query);

    res.json({
      success: true,
      mantras,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/mantras/:id", async (req, res) => {
  try {
    const mantra = await MantraMaster.findById(req.params.id).populate("deity_id");
    if (!mantra) {
      return res.status(404).json({ success: false, message: "Mantra not found" });
    }
    res.json({ success: true, mantra });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/mantras", async (req, res) => {
  try {
    const { mantra_name, mantra_code, text, meaning, audio_url, video_url, duration_sec, repeat_allowed, default_repeat, safe_for_all, deity_id, category } = req.body;

    if (!mantra_name) {
      return res.status(400).json({ success: false, message: "mantra_name is required" });
    }

    // Check for duplicate code
    if (mantra_code) {
      const existing = await MantraMaster.findOne({ mantra_code: mantra_code.toUpperCase() });
      if (existing) {
        return res.status(400).json({ success: false, message: "Mantra code already exists" });
      }
    }

    const mantra = new MantraMaster({
      mantra_name,
      mantra_code: mantra_code?.toUpperCase(),
      text,
      meaning,
      audio_url,
      video_url,
      duration_sec,
      repeat_allowed: repeat_allowed || [11, 21, 108],
      default_repeat: default_repeat || 11,
      safe_for_all: safe_for_all !== false,
      deity_id: deity_id || null,
      category: category || "GENERAL",
      createdBy: req.user._id,
    });

    await mantra.save();
    await mantra.populate("deity_id", "name");
    
    res.status(201).json({ success: true, message: "Mantra created", mantra });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/mantras/:id", async (req, res) => {
  try {
    const mantra = await MantraMaster.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    ).populate("deity_id", "name");

    if (!mantra) {
      return res.status(404).json({ success: false, message: "Mantra not found" });
    }

    res.json({ success: true, message: "Mantra updated", mantra });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/mantras/:id", async (req, res) => {
  try {
    const mantra = await MantraMaster.findByIdAndDelete(req.params.id);
    if (!mantra) {
      return res.status(404).json({ success: false, message: "Mantra not found" });
    }
    res.json({ success: true, message: "Mantra deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// DEITIES MASTER CRUD
// ============================================

router.get("/deities", async (req, res) => {
  try {
    const { search } = req.query;
    
    const query = { isActive: true };
    if (search) {
      query.$or = [
        { "name.hi": { $regex: search, $options: "i" } },
        { "name.en": { $regex: search, $options: "i" } },
        { deity_code: { $regex: search, $options: "i" } },
      ];
    }

    const deities = await DeityMaster.find(query)
      .populate("default_mantra_id", "mantra_name")
      .sort({ "name.en": 1 });

    res.json({ success: true, deities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/deities/:id", async (req, res) => {
  try {
    const deity = await DeityMaster.findById(req.params.id).populate("default_mantra_id");
    if (!deity) {
      return res.status(404).json({ success: false, message: "Deity not found" });
    }
    res.json({ success: true, deity });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/deities", async (req, res) => {
  try {
    const { deity_code, name, description, icon_url, image_url, default_mantra_id, day_of_worship, associated_color, category } = req.body;

    if (!name?.hi || !name?.en) {
      return res.status(400).json({ success: false, message: "name.hi and name.en are required" });
    }

    // Check for duplicate code
    if (deity_code) {
      const existing = await DeityMaster.findOne({ deity_code: deity_code.toUpperCase() });
      if (existing) {
        return res.status(400).json({ success: false, message: "Deity code already exists" });
      }
    }

    const deity = new DeityMaster({
      deity_code: deity_code?.toUpperCase(),
      name,
      description,
      icon_url,
      image_url,
      default_mantra_id: default_mantra_id || null,
      day_of_worship,
      associated_color,
      category: category || "OTHER",
      createdBy: req.user._id,
    });

    await deity.save();
    res.status(201).json({ success: true, message: "Deity created", deity });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/deities/:id", async (req, res) => {
  try {
    const deity = await DeityMaster.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!deity) {
      return res.status(404).json({ success: false, message: "Deity not found" });
    }

    res.json({ success: true, message: "Deity updated", deity });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/deities/:id", async (req, res) => {
  try {
    const deity = await DeityMaster.findByIdAndDelete(req.params.id);
    if (!deity) {
      return res.status(404).json({ success: false, message: "Deity not found" });
    }
    res.json({ success: true, message: "Deity deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// AARTI MASTER CRUD
// ============================================

router.get("/aartis", async (req, res) => {
  try {
    const { deity, search } = req.query;
    
    const query = { isActive: true };
    if (deity) query.deity_id = deity;
    if (search) {
      query.$or = [
        { aarti_code: { $regex: search, $options: "i" } },
        { "title.hi": { $regex: search, $options: "i" } },
        { "title.en": { $regex: search, $options: "i" } },
      ];
    }

    const aartis = await AartiMaster.find(query)
      .populate("deity_id", "name icon_url")
      .sort({ createdAt: -1 });

    res.json({ success: true, aartis });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/aartis/:id", async (req, res) => {
  try {
    const aarti = await AartiMaster.findById(req.params.id).populate("deity_id");
    if (!aarti) {
      return res.status(404).json({ success: false, message: "Aarti not found" });
    }
    res.json({ success: true, aarti });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/aartis", async (req, res) => {
  try {
    const { aarti_code, title, deity_id, lyrics, audio_url, video_url, duration_sec, time_of_day } = req.body;

    if (!title?.hi || !title?.en) {
      return res.status(400).json({ success: false, message: "title.hi and title.en are required" });
    }

    // Check for duplicate aarti_code
    if (aarti_code) {
      const existing = await AartiMaster.findOne({ aarti_code: aarti_code.toUpperCase() });
      if (existing) {
        return res.status(400).json({ success: false, message: "Aarti code already exists" });
      }
    }

    const aarti = new AartiMaster({
      aarti_code: aarti_code?.toUpperCase(),
      title,
      deity_id: deity_id || null,
      lyrics,
      audio_url,
      video_url,
      duration_sec: duration_sec || 0,
      time_of_day: time_of_day || "ANY",
      createdBy: req.user._id,
    });

    await aarti.save();
    await aarti.populate("deity_id", "name icon_url");
    
    res.status(201).json({ success: true, message: "Aarti created", aarti });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/aartis/:id", async (req, res) => {
  try {
    const aarti = await AartiMaster.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    ).populate("deity_id", "name icon_url");

    if (!aarti) {
      return res.status(404).json({ success: false, message: "Aarti not found" });
    }

    res.json({ success: true, message: "Aarti updated", aarti });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/aartis/:id", async (req, res) => {
  try {
    const aarti = await AartiMaster.findByIdAndDelete(req.params.id);
    if (!aarti) {
      return res.status(404).json({ success: false, message: "Aarti not found" });
    }
    res.json({ success: true, message: "Aarti deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// POOJA TEMPLATES CRUD
// ============================================

router.get("/pooja-templates", async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category, deity, featured } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { "name.hi": { $regex: search, $options: "i" } },
        { "name.en": { $regex: search, $options: "i" } },
      ];
    }
    if (category) query.category = category;
    if (deity) query.deity_id = deity;
    if (featured !== undefined) query.isFeatured = featured === "true";

    const templates = await PoojaTemplate.find(query)
      .populate("deity_id", "name icon_url")
      .populate("aarti_id", "title audio_url")
      .populate("samagri_list.product_id", "name images price")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await PoojaTemplate.countDocuments(query);

    res.json({
      success: true,
      templates,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/pooja-templates/:id", async (req, res) => {
  try {
    const template = await PoojaTemplate.findById(req.params.id)
      .populate("deity_id")
      .populate("aarti_id")
      .populate("steps.step_id")
      .populate("steps.mantra_id")
      .populate("samagri_list.product_id");

    if (!template) {
      return res.status(404).json({ success: false, message: "Template not found" });
    }

    res.json({ success: true, template });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Helper function to sanitize ObjectId fields (convert empty strings to null)
const sanitizeObjectId = (value) => {
  if (!value || value === "") return null;
  return value;
};

// Sanitize steps array
const sanitizeSteps = (steps) => {
  if (!steps || !Array.isArray(steps)) return [];
  return steps.map(step => ({
    ...step,
    step_id: sanitizeObjectId(step.step_id),
    mantra_id: sanitizeObjectId(step.mantra_id),
  }));
};

// Sanitize samagri list
const sanitizeSamagriList = (list) => {
  if (!list || !Array.isArray(list)) return [];
  return list.map(item => ({
    ...item,
    product_id: sanitizeObjectId(item.product_id),
  }));
};

router.post("/pooja-templates", async (req, res) => {
  try {
    const { name, steps, samagri_list, deity_id, aarti_id } = req.body;
    
    if (!name?.hi || !name?.en) {
      return res.status(400).json({ success: false, message: "name.hi and name.en are required" });
    }

    // Sanitize the data before saving
    const sanitizedData = {
      ...req.body,
      deity_id: sanitizeObjectId(deity_id),
      aarti_id: sanitizeObjectId(aarti_id),
      steps: sanitizeSteps(steps),
      samagri_list: sanitizeSamagriList(samagri_list),
      createdBy: req.user._id,
    };

    const template = new PoojaTemplate(sanitizedData);

    await template.save();
    
    // Populate for response
    await template.populate("deity_id", "name");

    res.status(201).json({ success: true, message: "Template created", template });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/pooja-templates/:id", async (req, res) => {
  try {
    const { steps, samagri_list, deity_id, aarti_id } = req.body;

    // Sanitize the data before updating
    const sanitizedData = {
      ...req.body,
      deity_id: sanitizeObjectId(deity_id),
      aarti_id: sanitizeObjectId(aarti_id),
      steps: sanitizeSteps(steps),
      samagri_list: sanitizeSamagriList(samagri_list),
    };

    const template = await PoojaTemplate.findByIdAndUpdate(
      req.params.id,
      sanitizedData,
      { new: true, runValidators: true }
    ).populate("deity_id", "name");

    if (!template) {
      return res.status(404).json({ success: false, message: "Template not found" });
    }

    res.json({ success: true, message: "Template updated", template });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/pooja-templates/:id", async (req, res) => {
  try {
    const template = await PoojaTemplate.findByIdAndDelete(req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, message: "Template not found" });
    }
    res.json({ success: true, message: "Template deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
