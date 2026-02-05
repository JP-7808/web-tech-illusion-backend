const express = require('express');
const Contact = require('../models/Contact');
const jwt = require('jsonwebtoken');

const router = express.Router();

/* =========================
   ✅ VERIFY TOKEN MIDDLEWARE
========================= */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'illusion_jwt_secret'
    );
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

/* =========================
   ✅ SUBMIT CONTACT FORM
========================= */
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, message } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name and phone are required'
      });
    }

    const contact = new Contact({
      name,
      phone,
      email: email || '',
      message: message || ''
    });

    await contact.save();

    res.status(201).json({
      success: true,
      message: 'Thank you! We will contact you soon.',
      data: {
        id: contact._id,
        name: contact.name,
        submittedAt: contact.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.'
    });
  }
});

/* =========================
   ✅ GET ALL CONTACTS (ADMIN)
========================= */
router.get('/', verifyToken, async (req, res) => {
  try {
    const { status } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const filter = status ? { status } : {};

    const contacts = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Contact.countDocuments(filter);

    res.json({
      success: true,
      data: contacts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        recordsOnPage: contacts.length
      }
    });

  } catch (error) {
    console.error('❌ Fetch contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contacts'
    });
  }
});

/* =========================
   ✅ UPDATE CONTACT STATUS
========================= */
router.patch('/:id/status', verifyToken, async (req, res) => {
  try {
    const { status } = req.body;

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    res.json({
      success: true,
      message: 'Status updated successfully',
      data: contact
    });

  } catch (error) {
    console.error('❌ Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating status'
    });
  }
});

module.exports = router;