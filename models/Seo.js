const mongoose = require('mongoose');

const seoSchema = new mongoose.Schema({
  pageName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    enum: ['home', 'about', 'services', 'projects', 'team', 'contact', 'industries', 'careers', 'case-studies', 'documentation', 'blog']
  },
  slug: {
    type: String,
    trim: true,
    lowercase: true
  },
  canonicalUrl: {
    type: String,
    trim: true
  },
  robots: {
    type: String,
    trim: true,
    default: 'index, follow'
  },
  schemaType: {
    type: String,
    trim: true,
    default: 'WebPage'
  },
  focusKeyword: {
    type: String,
    trim: true
  },
  imageAltText: {
    type: String,
    trim: true
  },
  metaTitle: {
    type: String,
    trim: true,
    required: true
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
  ogImageLink: {
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
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Seo', seoSchema);
