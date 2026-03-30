const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
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

// RBAC Middleware (Super Admin Only)
const requireSuperAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'super_admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied. Super Admin only.' });
  }
};

// Login Route
router.post('/login', async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email.trim().toLowerCase();
    password = password.trim();

    // First DB Check for Users
    let user = await User.findOne({ email: email.toLowerCase() });

    // Fallback: Check ENV variables if user doesn't exist in DB (for setup)
    if (!user) {
      if (email === (process.env.ADMIN_EMAIL || 'admin@webtechillusion.com') && 
          password === (process.env.ADMIN_PASSWORD || 'admin123')) {
        // Automatically create this user if it matches ENV
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        user = await User.create({
          email: email.toLowerCase(),
          password: hashedPassword,
          name: 'Super Admin',
          role: 'super_admin'
        });
      } else {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
    } else {
      // Check MongoDB user password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'illusion_jwt_secret',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });

  } catch (error) {
    console.error('SERVER LOGIN ERROR:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

// Verify route
router.get('/verify', verifyToken, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// Create additional user (Super Admin only -> to create SEO Managers)
router.post('/create-user', verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      email,
      password: hashedPassword,
      name,
      role: role || 'seo_manager'
    });

    await user.save();
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { id: user._id, email: user.email, role: user.role, name: user.name }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error creating user' });
  }
});

// Get all users (Super Admin only)
router.get('/users', verifyToken, requireSuperAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json({ success: true, data: users });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error fetching users' });
    }
});

// Delete user (Super Admin only)
router.delete('/users/:id', verifyToken, requireSuperAdmin, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error deleting user' });
    }
});

module.exports = { router, verifyToken, requireSuperAdmin };