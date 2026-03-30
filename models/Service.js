const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  shortDescription: {
    type: String,
    required: true
  },
  icon: {
    type: String, // String for lucide-react icon name or image URL
  },
  features: [{
    type: String
  }],
  content: {
    type: String
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'published'
  }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
