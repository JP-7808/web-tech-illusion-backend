const express = require('express');
const Team = require('../models/Team');
const { verifyToken } = require('./auth');
const router = express.Router();

// Get all active team members (public)
router.get('/', async (req, res) => {
  try {
    const team = await Team.find({ status: 'active' }).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: team });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Get all team members for admin (protected)
router.get('/admin/all', verifyToken, async (req, res) => {
  try {
    const team = await Team.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: team, count: team.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Get single team member
router.get('/:id', async (req, res) => {
  try {
    const member = await Team.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Team member not found' });
    }
    res.json({ success: true, data: member });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Create team member (protected)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, role, specialization, bio, skills, experience, image, status, order } = req.body;

    if (!name || !role || !image) {
      return res.status(400).json({ success: false, message: 'Name, role and image are required' });
    }

    const member = new Team({
      name,
      role,
      specialization,
      bio,
      skills: skills || [],
      experience,
      image,
      status: status || 'active',
      order: order || 0
    });

    await member.save();

    res.status(201).json({
      success: true,
      message: 'Team member created successfully',
      data: member
    });
  } catch (error) {
    console.error('Error creating team member:', error);
    res.status(500).json({ success: false, message: 'Error creating team member' });
  }
});

// Update team member (protected)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { name, role, specialization, bio, skills, experience, image, status, order } = req.body;

    const member = await Team.findById(req.params.id);

    if (!member) {
      return res.status(404).json({ success: false, message: 'Team member not found' });
    }

    if (name) member.name = name;
    if (role) member.role = role;
    if (specialization !== undefined) member.specialization = specialization;
    if (bio !== undefined) member.bio = bio;
    if (skills) member.skills = skills;
    if (experience !== undefined) member.experience = experience;
    if (image) member.image = image;
    if (status) member.status = status;
    if (order !== undefined) member.order = order;

    await member.save();

    res.json({
      success: true,
      message: 'Team member updated successfully',
      data: member
    });
  } catch (error) {
    console.error('Error updating team member:', error);
    res.status(500).json({ success: false, message: 'Error updating team member' });
  }
});

// Delete team member (protected)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const member = await Team.findByIdAndDelete(req.params.id);

    if (!member) {
      return res.status(404).json({ success: false, message: 'Team member not found' });
    }

    res.json({
      success: true,
      message: 'Team member deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting team member' });
  }
});

module.exports = router;
