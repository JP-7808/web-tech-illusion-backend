const express = require('express');
const Contact = require('../models/Contact');
const Newsletter = require('../models/Newsletter');
const router = express.Router();

// Dashboard HTML page - Redirect to React frontend
router.get('/', (req, res) => {
  res.redirect('/dashboard');
});

// API Stats endpoint
router.get('/api/stats', async (req, res) => {
  try {
    const totalContacts = await Contact.countDocuments();
    const newContacts = await Contact.countDocuments({ status: 'new' });
    const totalSubscribers = await Newsletter.countDocuments({ status: 'active' });

    res.json({
      success: true,
      data: {
        totalContacts,
        newContacts,
        totalSubscribers
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching stats'
    });
  }
});

module.exports = router;