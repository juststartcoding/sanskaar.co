/**
 * POOJA ENGINE SERVICE - Core business logic
 */
const PoojaTemplate = require("../models/PoojaTemplate");
const PoojaStepMaster = require("../models/PoojaStepMaster");
const MantraMaster = require("../models/MantraMaster");
const UserPoojaProgress = require("../models/UserPoojaProgress");

class PoojaEngine {
  static async getPoojaFlow(poojaId, language = "hi") {
    const template = await PoojaTemplate.findById(poojaId).populate("deity_id").populate("aarti_id");
    if (!template) throw new Error("Pooja template not found");

    const stepCodes = template.steps.map(s => s.step_code);
    const stepMasters = await PoojaStepMaster.find({ step_code: { $in: stepCodes }, isActive: true });
    const stepMasterMap = {};
    stepMasters.forEach(sm => stepMasterMap[sm.step_code] = sm);

    const mantraIds = template.steps.filter(s => s.mantra_id).map(s => s.mantra_id);
    const mantras = await MantraMaster.find({ _id: { $in: mantraIds }, isActive: true });
    const mantraMap = {};
    mantras.forEach(m => mantraMap[m._id.toString()] = m);

    const stepFlow = template.steps.sort((a, b) => a.order - b.order).map((templateStep, index) => {
      const master = stepMasterMap[templateStep.step_code] || {};
      const mantra = templateStep.mantra_id ? mantraMap[templateStep.mantra_id.toString()] : null;

      return {
        index, order: templateStep.order, step_code: templateStep.step_code,
        title: master.title || { hi: "", en: "" },
        instruction: { hi: templateStep.custom_instruction?.hi || master.instruction?.hi || "", en: templateStep.custom_instruction?.en || master.instruction?.en || "" },
        media: { icon_url: master.icon_url || "", image_url: templateStep.custom_image_url || master.image_url || "", audio_url: templateStep.custom_audio_url || master.audio_url || "" },
        mantra: mantra ? { name: mantra.mantra_name, text: mantra.text, audio_url: mantra.audio_url, repeat_allowed: mantra.repeat_allowed, repeat_count: templateStep.mantra_repeat_count || 11 } : null,
        duration_minutes: templateStep.duration_minutes || 5, is_mandatory: master.is_mandatory || false, is_optional: templateStep.is_optional || false,
        background_color: master.background_color || "#FFF7ED",
      };
    });

    return { success: true, pooja: { _id: template._id, name: template.name, slug: template.slug, category: template.category, deity: template.deity_id, total_duration_minutes: template.total_duration_minutes, samagri_list: template.samagri_list }, steps: stepFlow, total_steps: stepFlow.length, aarti: template.aarti_id };
  }

  static async startPooja(userId, poojaId, settings = {}) {
    const template = await PoojaTemplate.findById(poojaId);
    if (!template) throw new Error("Pooja template not found");

    let progress = await UserPoojaProgress.findOne({ user_id: userId, pooja_template_id: poojaId, status: { $in: ["IN_PROGRESS", "PAUSED"] } });
    if (progress) { progress.status = "IN_PROGRESS"; progress.session_count += 1; await progress.save(); return { success: true, message: "Resumed", progress, isResume: true }; }

    const stepsProgress = template.steps.sort((a, b) => a.order - b.order).map((step, index) => ({ step_code: step.step_code, step_order: index, status: "PENDING", mantra_target: step.mantra_repeat_count || 11 }));
    progress = new UserPoojaProgress({ user_id: userId, pooja_template_id: poojaId, status: "IN_PROGRESS", steps_progress: stepsProgress, started_at: new Date(), session_count: 1, language_preference: settings.language || "hi" });
    await progress.save();
    await PoojaTemplate.findByIdAndUpdate(poojaId, { $inc: { views: 1 } });
    return { success: true, message: "Pooja started", progress, isResume: false };
  }

  static async completeStep(userId, poojaId, stepCode, data = {}) {
    const progress = await UserPoojaProgress.findOne({ user_id: userId, pooja_template_id: poojaId, status: "IN_PROGRESS" });
    if (!progress) throw new Error("No active session");
    const stepIndex = progress.steps_progress.findIndex(s => s.step_code === stepCode);
    if (stepIndex === -1) throw new Error("Step not found");
    progress.steps_progress[stepIndex].status = "COMPLETED";
    progress.steps_progress[stepIndex].completed_at = new Date();
    progress.steps_progress[stepIndex].mantra_count_completed = data.mantra_count || 0;
    progress.current_step_index = stepIndex + 1;
    progress.total_time_spent_sec += data.time_spent_sec || 0;
    await progress.save();
    return { success: true, message: "Step completed", progress };
  }

  static async completePooja(userId, poojaId, feedback = {}) {
    const progress = await UserPoojaProgress.findOne({ user_id: userId, pooja_template_id: poojaId, status: "IN_PROGRESS" });
    if (!progress) throw new Error("No active session");
    progress.status = "COMPLETED"; progress.completed_at = new Date(); progress.rating = feedback.rating;
    await progress.save();
    if (feedback.rating) {
      const template = await PoojaTemplate.findById(poojaId);
      const newCount = (template.ratings?.count || 0) + 1;
      const newAverage = ((template.ratings?.average || 0) * (template.ratings?.count || 0) + feedback.rating) / newCount;
      await PoojaTemplate.findByIdAndUpdate(poojaId, { $inc: { completions: 1 }, $set: { "ratings.count": newCount, "ratings.average": Math.round(newAverage * 10) / 10 } });
    }
    return { success: true, message: "Pooja completed! 🙏", progress };
  }

  static async getUserHistory(userId, options = {}) {
    const { status, page = 1, limit = 20 } = options;
    const query = { user_id: userId };
    if (status) query.status = status;
    const history = await UserPoojaProgress.find(query).populate({ path: "pooja_template_id", select: "name slug main_image_url category", populate: { path: "deity_id", select: "name icon_url" } }).sort({ updatedAt: -1 }).limit(limit).skip((page - 1) * limit);
    const total = await UserPoojaProgress.countDocuments(query);
    return { success: true, history, pagination: { total, page, pages: Math.ceil(total / limit) } };
  }

  static async getUserStats(userId) {
    const completed = await UserPoojaProgress.countDocuments({ user_id: userId, status: "COMPLETED" });
    const inProgress = await UserPoojaProgress.countDocuments({ user_id: userId, status: "IN_PROGRESS" });
    return { success: true, stats: { completed, in_progress: inProgress } };
  }
}

module.exports = PoojaEngine;
