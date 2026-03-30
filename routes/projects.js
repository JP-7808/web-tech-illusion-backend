const express = require('express');
const router = express.Router();
const { verifyToken: auth } = require('./auth');
const Project = require('../models/Project');

const checkDeveloper = (req, res, next) => {
  if (req.user.role !== 'super_admin' && req.user.role !== 'developer') {
    return res.status(403).json({ success: false, message: 'Access denied: Developer or Super Admin only' });
  }
  next();
};

router.get('/', async (req, res) => {
  try {
    const items = await Project.find().sort({ createdAt: -1 });
    res.json({ success: true, count: items.length, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await Project.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', auth, checkDeveloper, async (req, res) => {
  try {
    const item = await Project.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:id', auth, checkDeveloper, async (req, res) => {
  try {
    const item = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:id', auth, checkDeveloper, async (req, res) => {
  try {
    const item = await Project.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
