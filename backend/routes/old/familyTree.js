const express = require('express');
const FamilyTree = require('../models/FamilyTree');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, async (req, res) => {
  const familyTree = new FamilyTree({ ownerUserId: req.user.id, nodes: req.body.nodes, privacy: req.body.privacy });
  await familyTree.save();
  res.status(201).json(familyTree);
});

router.get('/', auth, async (req, res) => {
  const trees = await FamilyTree.find({ ownerUserId: req.user.id });
  res.json(trees);
});

router.put('/:id', auth, async (req, res) => {
  const tree = await FamilyTree.findById(req.params.id);
  if (tree.ownerUserId.toString() !== req.user.id) return res.status(403).json({ message: 'Access denied' });
  const updated = await FamilyTree.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

router.post('/:id/invite', auth, async (req, res) => {
  // Implement invite logic
  res.json({ message: 'Invite sent' });
});

module.exports = router;