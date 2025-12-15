const express = require('express');
const Temple = require('../models/Temple');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all temples with optional filters
router.get('/', async (req, res) => {
  try {
    const { city, deity, state, featured, search } = req.query;
    let query = {};
    
    if (city) query.city = city;
    if (deity) query.deity = deity;
    if (state) query.state = state;
    if (featured) query.featured = featured === 'true';
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const temples = await Temple.find(query).sort({ featured: -1, rating: -1 });
    res.json(temples);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching temples', error: error.message });
  }
});

// Get temple by ID
router.get('/:id', async (req, res) => {
  try {
    const temple = await Temple.findById(req.params.id);
    if (!temple) {
      return res.status(404).json({ message: 'Temple not found' });
    }
    res.json(temple);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching temple', error: error.message });
  }
});

// Get temple by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const temple = await Temple.findOne({ slug: req.params.slug });
    if (!temple) {
      return res.status(404).json({ message: 'Temple not found' });
    }
    res.json(temple);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching temple', error: error.message });
  }
});

// Search temples
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    const temples = await Temple.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { city: { $regex: q, $options: 'i' } },
        { deity: { $regex: q, $options: 'i' } }
      ]
    }).limit(10);
    res.json(temples);
  } catch (error) {
    res.status(500).json({ message: 'Error searching temples', error: error.message });
  }
});

// Get nearby temples (requires location)
router.post('/nearby', async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 50000 } = req.body; // maxDistance in meters
    
    const temples = await Temple.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: maxDistance
        }
      }
    }).limit(20);
    
    res.json(temples);
  } catch (error) {
    res.status(500).json({ message: 'Error finding nearby temples', error: error.message });
  }
});

// Create temple (admin only)
router.post('/', auth(['admin']), async (req, res) => {
  try {
    const temple = new Temple(req.body);
    await temple.save();
    res.status(201).json(temple);
  } catch (error) {
    res.status(400).json({ message: 'Error creating temple', error: error.message });
  }
});

// Update temple (admin only)
router.put('/:id', auth(['admin']), async (req, res) => {
  try {
    const temple = await Temple.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!temple) {
      return res.status(404).json({ message: 'Temple not found' });
    }
    res.json(temple);
  } catch (error) {
    res.status(400).json({ message: 'Error updating temple', error: error.message });
  }
});

// Delete temple (admin only)
router.delete('/:id', auth(['admin']), async (req, res) => {
  try {
    const temple = await Temple.findByIdAndDelete(req.params.id);
    if (!temple) {
      return res.status(404).json({ message: 'Temple not found' });
    }
    res.json({ message: 'Temple deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting temple', error: error.message });
  }
});

module.exports = router;
