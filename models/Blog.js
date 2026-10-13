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
    default: 'General',
    trim: true
  },
  author: {
    type: String,
    required: true,
    default: 'WebTech Illusion Team',
    trim: true
  },
  authorEmail: {
    type: String,
    trim: true
  },
  teamMember: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  tags: [{
    type: String,
    trim: true
  }],
  faqs: [{
    question: {
      type: String,
      trim: true
    },
    answer: {
      type: String,
      trim: true
    }
  }],
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

const slugify = (value = '') => {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'blog-post';
};

blogSchema.pre('validate', function(next) {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title);
  }
  next();
});

module.exports = mongoose.model('Blog', blogSchema);
