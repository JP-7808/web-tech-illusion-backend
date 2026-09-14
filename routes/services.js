const express = require('express');
const router = express.Router();
const { verifyToken: auth } = require('./auth');
const Service = require('../models/Service');

const defaultServices = [
  {
    title: 'Custom Web Development',
    shortDescription: 'Responsive, high-performance websites and web apps designed to win customers and scale with your business.',
    icon: 'web',
    features: ['React', 'Node.js', 'MongoDB', 'SEO-ready architecture'],
    content: 'Modern websites and portals built for speed, conversion, and scalable growth.',
    status: 'published'
  },
  {
    title: 'Mobile App Development',
    shortDescription: 'iOS and Android experiences engineered for usability, retention, and business impact.',
    icon: 'mobile',
    features: ['Flutter', 'React Native', 'UX Strategy', 'App Store support'],
    content: 'Feature-rich mobile apps designed to delight users and drive measurable business outcomes.',
    status: 'published'
  },
  {
    title: 'E-Commerce Solutions',
    shortDescription: 'Online stores and sales funnels built to convert visitors into loyal paying customers.',
    icon: 'ecommerce',
    features: ['Shopping UX', 'Payments', 'Catalog management', 'Conversion optimization'],
    content: 'Scalable storefronts with strong UX, secure checkout, and business-aware product experiences.',
    status: 'published'
  },
  {
    title: 'Digital Marketing',
    shortDescription: 'Growth-focused campaigns that increase visibility, traffic, and qualified leads.',
    icon: 'marketing',
    features: ['SEO', 'Paid media', 'Content strategy', 'Analytics'],
    content: 'Performance marketing systems designed to compound reach and improve business acquisition.',
    status: 'published'
  },
  {
    title: 'Cloud & DevOps',
    shortDescription: 'Infrastructure, deployment, and automation services to keep your platform stable and scalable.',
    icon: 'cloud',
    features: ['AWS', 'CI/CD', 'Monitoring', 'Deploy automation'],
    content: 'Infrastructure engineering that improves speed, resilience, and release quality.',
    status: 'published'
  },
  {
    title: 'Cybersecurity & QA',
    shortDescription: 'Secure, reliable digital systems with testing and protection built into every release.',
    icon: 'security',
    features: ['Security audits', 'QA testing', 'Performance optimization', 'Stability checks'],
    content: 'Security-first development and quality assurance for dependable digital products.',
    status: 'published'
  }
];

const checkDeveloper = (req, res, next) => {
  if (req.user.role !== 'super_admin' && req.user.role !== 'developer') {
    return res.status(403).json({ success: false, message: 'Access denied: Developer or Super Admin only' });
  }
  next();
};

router.get('/', async (req, res) => {
  try {
    const items = await Service.find().sort({ createdAt: -1 });
    if (items.length === 0) {
      const seeded = await Service.insertMany(defaultServices);
      return res.json({ success: true, count: seeded.length, data: seeded });
    }
    res.json({ success: true, count: items.length, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/admin/all', auth, checkDeveloper, async (req, res) => {
  try {
    const items = await Service.find().sort({ createdAt: -1 });
    if (items.length === 0) {
      const seeded = await Service.insertMany(defaultServices);
      return res.json({ success: true, count: seeded.length, data: seeded });
    }
    res.json({ success: true, count: items.length, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/seed-defaults', auth, checkDeveloper, async (req, res) => {
  try {
    await Service.deleteMany({});
    const seeded = await Service.insertMany(defaultServices);
    res.json({ success: true, count: seeded.length, data: seeded });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', auth, checkDeveloper, async (req, res) => {
  try {
    const item = await Service.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:id', auth, checkDeveloper, async (req, res) => {
  try {
    const item = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:id', auth, checkDeveloper, async (req, res) => {
  try {
    const item = await Service.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
