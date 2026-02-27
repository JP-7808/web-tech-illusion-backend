const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  excerpt: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['web-development', 'ui-ux-design', 'digital-marketing', 'mobile-apps', 'technology']
  },
  author: {
    type: String,
    required: true,
    default: 'WebTech Illusion Team'
  },
  image: {
    type: String,
    required: true
  },
  readTime: {
    type: String,
    default: '5 min read'
  },
  views: {
    type: Number,
    default: 0
  },
  comments: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Blog', blogSchema);
