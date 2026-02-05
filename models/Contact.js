const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: false,
    trim: true,
    lowercase: true
  },
  message: {
    type: String,
    required: false,
    trim: true
  },
  status: {
    type: String,
    enum: ['new', 'read', 'responded'],
    default: 'new'
  },
  source: {
    type: String,
    default: 'website'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Contact', contactSchema);