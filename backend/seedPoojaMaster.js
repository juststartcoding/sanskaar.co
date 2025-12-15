/**
 * SEED FILE FOR POOJA SYSTEM
 * Run: node seedPoojaMaster.js
 */
require("dotenv").config();
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/sanskar";

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const PoojaStepMaster = require("./models/PoojaStepMaster");
    const DeityMaster = require("./models/DeityMaster");
    const MantraMaster = require("./models/MantraMaster");
    const PoojaTemplate = require("./models/PoojaTemplate");

    // Clear
    await PoojaStepMaster.deleteMany({});
    await DeityMaster.deleteMany({});
    await MantraMaster.deleteMany({});
    await PoojaTemplate.deleteMany({});
    console.log("🗑️ Cleared existing data");

    // Steps
    const steps = await PoojaStepMaster.insertMany([
      { step_code: "SHUDDHI", title: { hi: "शुद्धि", en: "Purification" }, instruction: { hi: "स्वयं को शुद्ध करें", en: "Purify yourself" }, is_mandatory: true, order_hint: 1, duration_minutes: 3 },
      { step_code: "DIYA_PRAJWALAN", title: { hi: "दीप प्रज्वलन", en: "Light Lamp" }, instruction: { hi: "दीपक जलाएं", en: "Light the lamp" }, is_mandatory: true, order_hint: 2, duration_minutes: 2 },
      { step_code: "SANKALP", title: { hi: "संकल्प", en: "Resolution" }, instruction: { hi: "संकल्प करें", en: "Make resolution" }, is_mandatory: true, order_hint: 3, duration_minutes: 3 },
      { step_code: "GANESH_VANDANA", title: { hi: "गणेश वंदना", en: "Ganesh Prayer" }, instruction: { hi: "गणेश जी की वंदना करें", en: "Pray to Lord Ganesha" }, is_mandatory: true, order_hint: 4, duration_minutes: 5 },
      { step_code: "ISHTA_DEVTA_PUJA", title: { hi: "इष्ट देवता पूजा", en: "Main Deity Worship" }, instruction: { hi: "मुख्य देवता की पूजा करें", en: "Worship main deity" }, is_mandatory: true, order_hint: 5, duration_minutes: 10 },
      { step_code: "PUSHPA_ARPAN", title: { hi: "पुष्प अर्पण", en: "Flower Offering" }, instruction: { hi: "फूल चढ़ाएं", en: "Offer flowers" }, is_mandatory: true, order_hint: 6, duration_minutes: 2 },
      { step_code: "DHOOP_DEEP", title: { hi: "धूप दीप", en: "Incense & Lamp" }, instruction: { hi: "धूप और दीप दिखाएं", en: "Show incense and lamp" }, is_mandatory: true, order_hint: 7, duration_minutes: 3 },
      { step_code: "NAIVEDYA", title: { hi: "नैवेद्य", en: "Food Offering" }, instruction: { hi: "भोग लगाएं", en: "Offer food" }, is_mandatory: true, order_hint: 8, duration_minutes: 2 },
      { step_code: "MANTRA_JAAP", title: { hi: "मंत्र जाप", en: "Mantra Chanting" }, instruction: { hi: "मंत्र का जाप करें", en: "Chant mantras" }, is_mandatory: true, order_hint: 9, duration_minutes: 10 },
      { step_code: "AARTI", title: { hi: "आरती", en: "Aarti" }, instruction: { hi: "आरती करें", en: "Perform aarti" }, is_mandatory: true, order_hint: 10, duration_minutes: 5 },
      { step_code: "PRARTHANA", title: { hi: "प्रार्थना", en: "Prayer" }, instruction: { hi: "प्रार्थना करें", en: "Pray" }, is_mandatory: true, order_hint: 11, duration_minutes: 3 },
    ]);
    console.log(`✅ ${steps.length} steps created`);

    // Deities
    const deities = await DeityMaster.insertMany([
      { deity_code: "GANESHA", name: { hi: "श्री गणेश", en: "Lord Ganesha" }, day_of_worship: "Wednesday", category: "GANA" },
      { deity_code: "SHIVA", name: { hi: "भगवान शिव", en: "Lord Shiva" }, day_of_worship: "Monday", category: "TRIMURTI" },
      { deity_code: "VISHNU", name: { hi: "भगवान विष्णु", en: "Lord Vishnu" }, day_of_worship: "Thursday", category: "TRIMURTI" },
      { deity_code: "DURGA", name: { hi: "माता दुर्गा", en: "Goddess Durga" }, day_of_worship: "Tuesday", category: "DEVI" },
      { deity_code: "LAKSHMI", name: { hi: "माता लक्ष्मी", en: "Goddess Lakshmi" }, day_of_worship: "Friday", category: "DEVI" },
      { deity_code: "HANUMAN", name: { hi: "भगवान हनुमान", en: "Lord Hanuman" }, day_of_worship: "Tuesday", category: "GANA" },
    ]);
    console.log(`✅ ${deities.length} deities created`);

    const deityMap = {};
    deities.forEach(d => deityMap[d.deity_code] = d._id);

    // Mantras
    const mantras = await MantraMaster.insertMany([
      { mantra_name: "Ganesh Mantra", mantra_code: "GANESH_MANTRA", text: { sa: "ॐ गं गणपतये नमः", hi: "ॐ गं गणपतये नमः", en: "Om Gam Ganapataye Namah" }, repeat_allowed: [11, 21, 108], default_repeat: 21, deity_id: deityMap.GANESHA, category: "DEITY_SPECIFIC" },
      { mantra_name: "Shiva Mantra", mantra_code: "SHIVA_MANTRA", text: { sa: "ॐ नमः शिवाय", hi: "ॐ नमः शिवाय", en: "Om Namah Shivaya" }, repeat_allowed: [11, 21, 108], default_repeat: 108, deity_id: deityMap.SHIVA, category: "DEITY_SPECIFIC" },
      { mantra_name: "Vishnu Mantra", mantra_code: "VISHNU_MANTRA", text: { sa: "ॐ नमो भगवते वासुदेवाय", hi: "ॐ नमो भगवते वासुदेवाय", en: "Om Namo Bhagavate Vasudevaya" }, repeat_allowed: [11, 21, 108], default_repeat: 21, deity_id: deityMap.VISHNU, category: "DEITY_SPECIFIC" },
      { mantra_name: "Gayatri Mantra", mantra_code: "GAYATRI", text: { sa: "ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्", hi: "ॐ भूर्भुवः स्वः...", en: "Om Bhur Bhuva Swaha..." }, repeat_allowed: [11, 21, 108], default_repeat: 108, category: "GENERAL" },
      { mantra_name: "Lakshmi Mantra", mantra_code: "LAKSHMI_MANTRA", text: { sa: "ॐ श्रीं महालक्ष्म्यै नमः", hi: "ॐ श्रीं महालक्ष्म्यै नमः", en: "Om Shreem Mahalakshmiyai Namah" }, repeat_allowed: [11, 21, 108], default_repeat: 21, deity_id: deityMap.LAKSHMI, category: "PROSPERITY" },
      { mantra_name: "Hanuman Mantra", mantra_code: "HANUMAN_MANTRA", text: { sa: "ॐ हं हनुमते नमः", hi: "ॐ हं हनुमते नमः", en: "Om Ham Hanumate Namah" }, repeat_allowed: [11, 21, 108], default_repeat: 21, deity_id: deityMap.HANUMAN, category: "DEITY_SPECIFIC" },
    ]);
    console.log(`✅ ${mantras.length} mantras created`);

    const mantraMap = {};
    mantras.forEach(m => mantraMap[m.mantra_code] = m._id);

    // Pooja Templates
    const templates = await PoojaTemplate.insertMany([
      {
        pooja_code: "DAILY_GANESH_PUJA",
        name: { hi: "दैनिक गणेश पूजा", en: "Daily Ganesh Puja" },
        short_description: { hi: "गणेश जी की दैनिक पूजा", en: "Daily worship of Lord Ganesha" },
        deity_id: deityMap.GANESHA,
        category: "DAILY",
        difficulty_level: "BEGINNER",
        total_duration_minutes: 30,
        isFeatured: true,
        steps: [
          { step_code: "SHUDDHI", order: 1, duration_minutes: 2 },
          { step_code: "DIYA_PRAJWALAN", order: 2, duration_minutes: 2 },
          { step_code: "SANKALP", order: 3, duration_minutes: 2 },
          { step_code: "GANESH_VANDANA", order: 4, mantra_id: mantraMap.GANESH_MANTRA, duration_minutes: 5, mantra_repeat_count: 21 },
          { step_code: "PUSHPA_ARPAN", order: 5, duration_minutes: 2 },
          { step_code: "DHOOP_DEEP", order: 6, duration_minutes: 2 },
          { step_code: "NAIVEDYA", order: 7, duration_minutes: 2 },
          { step_code: "MANTRA_JAAP", order: 8, mantra_id: mantraMap.GANESH_MANTRA, duration_minutes: 8, mantra_repeat_count: 108 },
          { step_code: "AARTI", order: 9, duration_minutes: 3 },
          { step_code: "PRARTHANA", order: 10, duration_minutes: 2 },
        ],
        samagri_list: [
          { item_name: { hi: "मोदक", en: "Modak" }, quantity: "5", is_required: true },
          { item_name: { hi: "लाल फूल", en: "Red Flowers" }, quantity: "1 bunch", is_required: true },
          { item_name: { hi: "दूर्वा", en: "Durva Grass" }, quantity: "21", is_required: true },
        ],
      },
      {
        pooja_code: "MONDAY_SHIVA_PUJA",
        name: { hi: "सोमवार शिव पूजा", en: "Monday Shiva Puja" },
        short_description: { hi: "शिव जी की विशेष पूजा", en: "Special worship of Lord Shiva" },
        deity_id: deityMap.SHIVA,
        category: "DAILY",
        difficulty_level: "INTERMEDIATE",
        total_duration_minutes: 45,
        isFeatured: true,
        steps: [
          { step_code: "SHUDDHI", order: 1, duration_minutes: 3 },
          { step_code: "DIYA_PRAJWALAN", order: 2, duration_minutes: 2 },
          { step_code: "GANESH_VANDANA", order: 3, mantra_id: mantraMap.GANESH_MANTRA, duration_minutes: 3 },
          { step_code: "ISHTA_DEVTA_PUJA", order: 4, duration_minutes: 10 },
          { step_code: "DHOOP_DEEP", order: 5, duration_minutes: 3 },
          { step_code: "NAIVEDYA", order: 6, duration_minutes: 2 },
          { step_code: "MANTRA_JAAP", order: 7, mantra_id: mantraMap.SHIVA_MANTRA, duration_minutes: 15, mantra_repeat_count: 108 },
          { step_code: "AARTI", order: 8, duration_minutes: 5 },
          { step_code: "PRARTHANA", order: 9, duration_minutes: 2 },
        ],
        samagri_list: [
          { item_name: { hi: "बेलपत्र", en: "Belpatra" }, quantity: "3 leaves", is_required: true },
          { item_name: { hi: "दूध", en: "Milk" }, quantity: "1 glass", is_required: true },
          { item_name: { hi: "जल", en: "Water" }, quantity: "1 lota", is_required: true },
        ],
      },
    ]);
    console.log(`✅ ${templates.length} pooja templates created`);

    console.log("\n🎉 SEEDING COMPLETE!");
    console.log("=".repeat(40));
    console.log(`Steps: ${steps.length}`);
    console.log(`Deities: ${deities.length}`);
    console.log(`Mantras: ${mantras.length}`);
    console.log(`Templates: ${templates.length}`);
    console.log("=".repeat(40));

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seedDatabase();
