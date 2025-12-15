const express = require('express');
const Pandit = require('../models/Pandit');
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  const { language, specialty, region } = req.query;
  let query = {};
  if (language) query.languages = { $in: [language] };
  if (specialty) query.specializations = { $in: [specialty] };
  const pandits = await Pandit.find(query).populate('userId', 'name phone address');
  res.json(pandits);
});

router.get('/:id', async (req, res) => {
  const pandit = await Pandit.findById(req.params.id).populate('userId');
  res.json(pandit);
});

router.put('/:id', auth, async (req, res) => {
  const pandit = await Pandit.findById(req.params.id);
  if (pandit.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Access denied' });
  const updated = await Pandit.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

router.post('/bookings', auth, async (req, res) => {
  const { panditId, poojaId, method, dateTime, location } = req.body;
  const pandit = await Pandit.findById(panditId);
  if (!pandit) return res.status(404).json({ message: 'Pandit not found' });
  const booking = new Booking({ userId: req.user.id, panditId, poojaId, method, dateTime, location });
  await booking.save();
  res.status(201).json(booking);
});

router.get('/bookings', auth, async (req, res) => {
  const bookings = await Booking.find({ userId: req.user.id }).populate('panditId poojaId');
  res.json(bookings);
});

router.put('/bookings/:id', auth, async (req, res) => {
  const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(booking);
});

module.exports = router;