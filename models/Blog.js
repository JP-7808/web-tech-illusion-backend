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
  },
  // SEO Fields below
  slug: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  metaTitle: {
    type: String,
    trim: true
  },
  metaDescription: {
    type: String,
    trim: true
  },
  metaKeywords: {
    type: String,
    trim: true
  },
  h1Heading: {
    type: String,
    trim: true
  },
  ogImage: {
    type: String
  },
  ogTitle: {
    type: String,
    trim: true
  },
  metaTitleLink: {
    type: String,
    trim: true
  },
  metaDescriptionLink: {
    type: String,
    trim: true
  },
  metaKeywordsLink: {
    type: String,
    trim: true
  },
  h1HeadingLink: {
    type: String,
    trim: true
  },
  ogImageLink: {
    type: String,
    trim: true
  },
  imageLink: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Blog', blogSchema);
