const express = require('express');
const Team = require('../models/Team');
const { verifyToken } = require('./auth');
const router = express.Router();

const defaultTeam = [
  {
    name: 'Aarav Sharma',
    role: 'Full-Stack Developer',
    specialization: 'React, Node.js & scalable product engineering',
    bio: 'Builds clean architecture and product experiences that feel premium and perform fast.',
    skills: ['React', 'Node.js', 'MongoDB', 'UI Architecture'],
    experience: '5+ years experience',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80',
    status: 'active',
    order: 1
  },
  {
    name: 'Neha Verma',
    role: 'UI/UX Designer',
    specialization: 'Conversion-focused design systems and digital experiences',
    bio: 'Creates premium interfaces that harmonize trust, clarity, and simplicity for modern brands.',
    skills: ['Figma', 'Design Systems', 'UX Strategy', 'Brand Design'],
    experience: '4+ years experience',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80',
    status: 'active',
    order: 2
  },
  {
    name: 'Rohit Mehta',
    role: 'Digital Growth Strategist',
    specialization: 'SEO, funnel planning and performance campaigns',
    bio: 'Helps brands grow through smarter acquisition, content strategy, and analytics-driven improvements.',
    skills: ['SEO', 'Content Strategy', 'Analytics', 'Lead Generation'],
    experience: '6+ years experience',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80',
    status: 'active',
    order: 3
  },
  {
    name: 'Sana Khan',
    role: 'Product Manager',
    specialization: 'Roadmaps, sprint planning and delivery excellence',
    bio: 'Connects business goals with technical delivery to keep product growth focused and measurable.',
    skills: ['Roadmapping', 'Agile', 'Product QA', 'Stakeholder Management'],
    experience: '7+ years experience',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80',
    status: 'active',
    order: 4
  }
];

// Get all active team members (public)
router.get('/', async (req, res) => {
  try {
    const team = await Team.find({ status: 'active' }).sort({ order: 1, createdAt: -1 });
    if (team.length === 0) {
      const seeded = await Team.insertMany(defaultTeam);
      return res.json({ success: true, data: seeded });
    }
    res.json({ success: true, data: team });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Get all team members for admin (protected)
router.get('/admin/all', verifyToken, async (req, res) => {
  try {
    const team = await Team.find().sort({ order: 1, createdAt: -1 });
    if (team.length === 0) {
      const seeded = await Team.insertMany(defaultTeam);
      return res.json({ success: true, data: seeded, count: seeded.length });
    }
    res.json({ success: true, data: team, count: team.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

router.post('/seed-defaults', verifyToken, async (req, res) => {
  try {
    await Team.deleteMany({});
    const seeded = await Team.insertMany(defaultTeam);
    res.json({ success: true, message: 'Team defaults seeded', data: seeded });
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
