const express = require('express');
const Newsletter = require('../models/Newsletter');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Verify token middleware
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'illusion_jwt_secret');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Subscribe to newsletter
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    // Check if already subscribed
    const existing = await Newsletter.findOne({ email });
    if (existing) {
      if (existing.status === 'active') {
        return res.status(400).json({
          success: false,
          message: 'Email already subscribed'
        });
      } else {
        // Reactivate subscription
        existing.status = 'active';
        await existing.save();
        return res.json({
          success: true,
          message: 'Welcome back! Subscription reactivated.'
        });
      }
    }

    // Create new subscription
    const subscription = new Newsletter({ email });
    await subscription.save();

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to newsletter!',
      data: {
        email: subscription.email,
        subscribedAt: subscription.createdAt
      }
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.'
    });
  }
});

// Get all subscribers (for dashboard) - Protected route
router.get('/', verifyToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const filter = status ? { status } : {};
    const subscribers = await Newsletter.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Newsletter.countDocuments(filter);

    res.json({
      success: true,
      data: subscribers,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: subscribers.length,
        totalRecords: total
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching subscribers'
    });
  }
});

// Unsubscribe
router.post('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;
    
    const subscriber = await Newsletter.findOneAndUpdate(
      { email },
      { status: 'unsubscribed' },
      { new: true }
    );

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Email not found'
      });
    }

    res.json({
      success: true,
      message: 'Successfully unsubscribed'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error unsubscribing'
    });
  }
});

module.exports = router;