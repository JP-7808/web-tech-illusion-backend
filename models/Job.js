const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true
  },
  location: {
    type: String,
    default: 'Remote' // e.g., Remote, On-site, Hybrid
  },
  type: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
    default: 'Full-time'
  },
  description: {
    type: String,
    required: true
  },
  requirements: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open'
  }
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
