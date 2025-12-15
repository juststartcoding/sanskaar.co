const express = require("express");
const { authenticate, optionalAuth } = require("../middleware/auth");
const PoojaTemplate = require("../models/PoojaTemplate");
const UserPoojaProgress = require("../models/UserPoojaProgress");
const PoojaStepMaster = require("../models/PoojaStepMaster");
const MantraMaster = require("../models/MantraMaster");

const router = express.Router();

// ============================================
// PUBLIC ROUTES - No Auth Required
// ============================================

// Get all pooja templates (for browsing)
router.get("/", optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, category, deity, featured, search } = req.query;

    const query = { isActive: true };
    if (category) query.category = category;
    if (deity) query.deity_id = deity;
    if (featured === "true") query.isFeatured = true;
    if (search) {
      query.$or = [
        { pooja_name: { $regex: search, $options: "i" } },
        { pooja_name_hi: { $regex: search, $options: "i" } },
      ];
    }

    const templates = await PoojaTemplate.find(query)
      .populate("deity_id", "name_hi name_en icon_url")
      .select("-steps")
      .sort({ isFeatured: -1, views: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await PoojaTemplate.countDocuments(query);

    res.json({
      success: true,
      poojas: templates,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single pooja template with FULL STEP FLOW
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const template = await PoojaTemplate.findById(req.params.id)
      .populate("deity_id")
      .populate("aarti_id");

    if (!template) {
      return res.status(404).json({ success: false, message: "Pooja not found" });
    }

    // Increment views
    template.views += 1;
    await template.save();

    // Build full step flow with master data
    const fullSteps = await Promise.all(
      template.steps.map(async (step) => {
        const stepMaster = await PoojaStepMaster.findOne({ step_code: step.step_code });
        const mantra = step.mantra_id ? await MantraMaster.findById(step.mantra_id) : null;

        return {
          order: step.order,
          step_code: step.step_code,
          title_hi: stepMaster?.title_hi || step.custom_instruction_hi || "",
          title_en: stepMaster?.title_en || step.custom_instruction_en || "",
          instruction_hi: step.custom_instruction_hi || stepMaster?.instruction_hi || "",
          instruction_en: step.custom_instruction_en || stepMaster?.instruction_en || "",
          icon_url: stepMaster?.icon_url || "",
          is_mandatory: stepMaster?.is_mandatory || false,
          is_optional: step.is_optional,
          duration_minutes: step.duration_minutes,
          mantra: mantra ? {
            name: mantra.mantra_name,
            text_sa: mantra.text_sa,
            text_hi: mantra.text_hi,
            audio_url: mantra.audio_url,
            duration_sec: mantra.duration_sec,
            repeat_allowed: mantra.repeat_allowed,
          } : null,
        };
      })
    );

    fullSteps.sort((a, b) => a.order - b.order);

    let userProgress = null;
    if (req.user) {
      userProgress = await UserPoojaProgress.findOne({
        user_id: req.user._id,
        pooja_template_id: template._id,
      });
    }

    res.json({
      success: true,
      pooja: {
        _id: template._id,
        pooja_name: template.pooja_name,
        pooja_name_hi: template.pooja_name_hi,
        slug: template.slug,
        category: template.category,
        description_hi: template.description_hi,
        description_en: template.description_en,
        main_image_url: template.main_image_url,
        deity: template.deity_id,
        aarti: template.aarti_id,
        total_duration_minutes: template.total_duration_minutes,
        difficulty_level: template.difficulty_level,
        best_time: template.best_time,
        samagri_list: template.samagri_list,
        views: template.views,
        ratings: template.ratings,
      },
      steps: fullSteps,
      userProgress,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// AUTHENTICATED ROUTES - User Progress
// ============================================

// Start a pooja
router.post("/:id/start", authenticate, async (req, res) => {
  try {
    const template = await PoojaTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, message: "Pooja not found" });
    }

    let progress = await UserPoojaProgress.findOne({
      user_id: req.user._id,
      pooja_template_id: template._id,
    });

    if (progress && progress.status === "IN_PROGRESS") {
      return res.json({ success: true, message: "Pooja already in progress", progress });
    }

    if (progress) {
      progress.status = "IN_PROGRESS";
      progress.current_step_index = 0;
      progress.completed_steps = [];
      progress.started_at = new Date();
      progress.completed_at = null;
    } else {
      progress = new UserPoojaProgress({
        user_id: req.user._id,
        pooja_template_id: template._id,
        status: "IN_PROGRESS",
        started_at: new Date(),
      });
    }

    await progress.save();
    res.json({ success: true, message: "Pooja started", progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Complete a step
router.post("/:id/step/complete", authenticate, async (req, res) => {
  try {
    const { step_code, mantra_count = 0 } = req.body;

    const progress = await UserPoojaProgress.findOne({
      user_id: req.user._id,
      pooja_template_id: req.params.id,
      status: "IN_PROGRESS",
    });

    if (!progress) {
      return res.status(400).json({ success: false, message: "No pooja in progress" });
    }

    const alreadyCompleted = progress.completed_steps.find(s => s.step_code === step_code);
    if (alreadyCompleted) {
      return res.json({ success: true, message: "Step already completed", progress });
    }

    progress.completed_steps.push({
      step_code,
      completed_at: new Date(),
      mantra_count,
    });
    progress.current_step_index = progress.completed_steps.length;

    await progress.save();
    res.json({ success: true, message: "Step completed", progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Complete entire pooja
router.post("/:id/complete", authenticate, async (req, res) => {
  try {
    const { rating, notes, total_time_spent_minutes } = req.body;

    const progress = await UserPoojaProgress.findOne({
      user_id: req.user._id,
      pooja_template_id: req.params.id,
      status: "IN_PROGRESS",
    });

    if (!progress) {
      return res.status(400).json({ success: false, message: "No pooja in progress" });
    }

    progress.status = "COMPLETED";
    progress.completed_at = new Date();
    progress.rating = rating;
    progress.notes = notes;
    progress.total_time_spent_minutes = total_time_spent_minutes || 0;

    await progress.save();

    const template = await PoojaTemplate.findById(req.params.id);
    if (template) {
      template.completions += 1;
      if (rating) {
        const newCount = template.ratings.count + 1;
        const newAverage = ((template.ratings.average * template.ratings.count) + rating) / newCount;
        template.ratings.count = newCount;
        template.ratings.average = Math.round(newAverage * 10) / 10;
      }
      await template.save();
    }

    res.json({ success: true, message: "Pooja completed! 🙏", progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user's pooja history
router.get("/user/history", authenticate, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = { user_id: req.user._id };
    if (status) query.status = status;

    const history = await UserPoojaProgress.find(query)
      .populate({
        path: "pooja_template_id",
        select: "pooja_name pooja_name_hi main_image_url category difficulty_level",
        populate: { path: "deity_id", select: "name_hi name_en icon_url" },
      })
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await UserPoojaProgress.countDocuments(query);

    res.json({ success: true, history, total, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user statistics
router.get("/user/stats", authenticate, async (req, res) => {
  try {
    const userId = req.user._id;

    const totalCompleted = await UserPoojaProgress.countDocuments({
      user_id: userId,
      status: "COMPLETED",
    });

    const inProgress = await UserPoojaProgress.countDocuments({
      user_id: userId,
      status: "IN_PROGRESS",
    });

    const totalTimeSpent = await UserPoojaProgress.aggregate([
      { $match: { user_id: userId, status: "COMPLETED" } },
      { $group: { _id: null, total: { $sum: "$total_time_spent_minutes" } } },
    ]);

    const recentPoojas = await UserPoojaProgress.find({
      user_id: userId,
      status: "COMPLETED",
    })
      .populate("pooja_template_id", "pooja_name pooja_name_hi")
      .sort({ completed_at: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalCompleted,
        inProgress,
        totalTimeSpent: totalTimeSpent[0]?.total || 0,
        recentPoojas,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
