const express = require("express");
const Pooja = require("../models/Pooja");
const Product = require("../models/Product");
const Temple = require("../models/Temple");
const Pandit = require("../models/Pandit");

const router = express.Router();

// Universal search
router.get("/", async (req, res) => {
  try {
    const { q, type, lang = "en" } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: "Search query too short" });
    }

    const searchRegex = new RegExp(q, "i");
    const results = {};

    // Search based on type or all
    if (!type || type === "poojas") {
      results.poojas = await Pooja.find({
        $or: [
          { [`name.${lang}`]: searchRegex },
          { [`deity.${lang}`]: searchRegex },
          { tags: searchRegex },
        ],
      })
        .limit(10)
        .select("name deity type featuredFlag");
    }

    if (!type || type === "products") {
      results.products = await Product.find({
        $or: [
          { [`name.${lang}`]: searchRegex },
          { [`description.${lang}`]: searchRegex },
          { category: searchRegex },
        ],
      })
        .limit(10)
        .select("name price discountPrice mainImage category");
    }

    if (!type || type === "temples") {
      results.temples = await Temple.find({
        $or: [
          { [`name.${lang}`]: searchRegex },
          { [`deity.${lang}`]: searchRegex },
          { city: searchRegex },
          { state: searchRegex },
        ],
      })
        .limit(10)
        .select("name deity city state");
    }

    if (!type || type === "pandits") {
      results.pandits = await Pandit.find({
        $or: [{ languages: searchRegex }, { specializations: searchRegex }],
      })
        .limit(10)
        .populate("userId", "name");
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Autocomplete suggestions
router.get("/suggestions", async (req, res) => {
  try {
    const { q, lang = "en" } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json([]);
    }

    const searchRegex = new RegExp(`^${q}`, "i");

    const [poojas, products, temples] = await Promise.all([
      Pooja.find({ [`name.${lang}`]: searchRegex })
        .limit(5)
        .select(`name.${lang}`),
      Product.find({ [`name.${lang}`]: searchRegex })
        .limit(5)
        .select(`name.${lang}`),
      Temple.find({ [`name.${lang}`]: searchRegex })
        .limit(5)
        .select(`name.${lang}`),
    ]);

    const suggestions = [
      ...poojas.map((p) => ({ type: "pooja", name: p.name[lang] })),
      ...products.map((p) => ({ type: "product", name: p.name[lang] })),
      ...temples.map((t) => ({ type: "temple", name: t.name[lang] })),
    ];

    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
