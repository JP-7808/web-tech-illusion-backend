const express = require('express');
const mongoose = require('mongoose');
const Blog = require('../models/Blog');
const { verifyToken } = require('./auth');
const router = express.Router();

const slugify = (value = '') => {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'blog-post';
};

// Get all published blogs (public)
router.get('/', async (req, res) => {
  try {
    const { category, search, tag, page = 1, limit = 12 } = req.query;
    
    const filter = { status: 'published' };
    
    if (category && category !== 'all') {
      filter.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (tag) {
      filter.tags = { $in: [tag] };
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }

    const blogs = await Blog.find(filter)
      .populate('teamMember', 'name role image email specialization slug teamId bio')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Blog.countDocuments(filter);

    res.json({
      success: true,
      data: blogs,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: blogs.length,
        totalRecords: total
      }
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blogs'
    });
  }
});

// Get blogs by team member ID or slug (public)
router.get('/author/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    let filter = { status: 'published' };

    if (mongoose.Types.ObjectId.isValid(identifier)) {
      filter.$or = [
        { teamMember: identifier },
        { author: { $regex: identifier, $options: 'i' } }
      ];
    } else {
      filter.$or = [
        { author: { $regex: identifier.replace(/-/g, ' '), $options: 'i' } },
        { authorEmail: identifier }
      ];
    }

    const blogs = await Blog.find(filter)
      .populate('teamMember', 'name role image email specialization slug teamId')
      .sort({ createdAt: -1 })
      .limit(6);

    res.json({
      success: true,
      data: blogs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching author blogs' });
  }
});

// Get single blog (public) - supports both ObjectId and slug
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let blog = null;

    if (mongoose.Types.ObjectId.isValid(id)) {
      blog = await Blog.findById(id).populate('teamMember', 'name role image email specialization slug teamId bio');
    }

    if (!blog) {
      blog = await Blog.findOne({ slug: id }).populate('teamMember', 'name role image email specialization slug teamId bio');
    }
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Increment views
    blog.views = (blog.views || 0) + 1;
    await blog.save();

    res.json({
      success: true,
      data: blog
    });
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blog'
    });
  }
});

// Get all blogs for admin (protected)
router.get('/admin/all', verifyToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    
    const filter = status ? { status } : {};

    const blogs = await Blog.find(filter)
      .populate('teamMember', 'name role image email specialization slug teamId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Blog.countDocuments(filter);

    res.json({
      success: true,
      data: blogs,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: blogs.length,
        totalRecords: total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching blogs'
    });
  }
});

// Create blog (protected)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { 
      title, excerpt, content, category, author, authorEmail, teamMember, image, imageLink, readTime, status, isFeatured,
      tags, faqs, slug, metaTitle, metaDescription, metaKeywords, h1Heading, ogImage, ogTitle,
      metaTitleLink, metaDescriptionLink, metaKeywordsLink, h1HeadingLink, ogImageLink
    } = req.body;

    if (!title || !excerpt || !content || !image) {
      return res.status(400).json({
        success: false,
        message: 'Title, excerpt, content and featured image are required'
      });
    }

    const calculatedSlug = slug && slug.trim() ? slugify(slug) : slugify(title);

    // Calculate approx readTime if not given
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
    const computedReadTime = readTime || `${Math.max(1, Math.ceil(wordCount / 200))} min read`;

    const blog = new Blog({
      title: title.trim(),
      excerpt: excerpt.trim(),
      content,
      category: category ? category.trim() : 'General',
      author: author ? author.trim() : 'WebTech Illusion Team',
      authorEmail: authorEmail ? authorEmail.trim() : undefined,
      teamMember: teamMember && mongoose.Types.ObjectId.isValid(teamMember) ? teamMember : undefined,
      tags: Array.isArray(tags) ? tags.map(t => String(t).trim()).filter(Boolean) : [],
      faqs: Array.isArray(faqs) ? faqs.filter(f => f.question && f.question.trim()) : [],
      image,
      readTime: computedReadTime,
      status: status || 'draft',
      isFeatured: Boolean(isFeatured),
      slug: calculatedSlug,
      metaTitle: metaTitle && metaTitle.trim() ? metaTitle.trim() : title.trim(),
      metaDescription: metaDescription && metaDescription.trim() ? metaDescription.trim() : excerpt.trim(),
      metaKeywords: metaKeywords || (Array.isArray(tags) ? tags.join(', ') : ''),
      h1Heading: h1Heading || title.trim(),
      ogImage: ogImage || image,
      ogTitle: ogTitle || title.trim(),
      metaTitleLink,
      metaDescriptionLink,
      metaKeywordsLink,
      h1HeadingLink,
      ogImageLink,
      imageLink: imageLink || image
    });

    await blog.save();

    const populatedBlog = await Blog.findById(blog._id).populate('teamMember', 'name role image email specialization slug teamId');

    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: populatedBlog || blog
    });
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating blog'
    });
  }
});

// Update blog (protected)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { 
      title, excerpt, content, category, author, authorEmail, teamMember, image, imageLink, readTime, status, isFeatured,
      tags, faqs, slug, metaTitle, metaDescription, metaKeywords, h1Heading, ogImage, ogTitle,
      metaTitleLink, metaDescriptionLink, metaKeywordsLink, h1HeadingLink, ogImageLink
    } = req.body;

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    if (title) blog.title = title.trim();
    if (excerpt) blog.excerpt = excerpt.trim();
    if (content) {
      blog.content = content;
      const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
      if (!readTime) blog.readTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;
    }
    if (category) blog.category = category.trim();
    if (author) blog.author = author.trim();
    if (authorEmail !== undefined) blog.authorEmail = authorEmail ? authorEmail.trim() : '';
    if (teamMember !== undefined) {
      blog.teamMember = (teamMember && mongoose.Types.ObjectId.isValid(teamMember)) ? teamMember : null;
    }
    if (tags !== undefined) {
      blog.tags = Array.isArray(tags) ? tags.map(t => String(t).trim()).filter(Boolean) : [];
    }
    if (faqs !== undefined) {
      blog.faqs = Array.isArray(faqs) ? faqs.filter(f => f.question && f.question.trim()) : [];
    }
    if (image) blog.image = image;
    if (readTime) blog.readTime = readTime;
    if (status) blog.status = status;
    if (isFeatured !== undefined) blog.isFeatured = isFeatured;
    
    // SEO Fields
    if (slug !== undefined) blog.slug = slug && slug.trim() ? slugify(slug) : slugify(blog.title);
    if (metaTitle !== undefined) blog.metaTitle = metaTitle;
    if (metaDescription !== undefined) blog.metaDescription = metaDescription;
    if (metaKeywords !== undefined) blog.metaKeywords = metaKeywords;
    if (h1Heading !== undefined) blog.h1Heading = h1Heading;
    if (ogImage !== undefined) blog.ogImage = ogImage;
    if (ogTitle !== undefined) blog.ogTitle = ogTitle;
    if (metaTitleLink !== undefined) blog.metaTitleLink = metaTitleLink;
    if (metaDescriptionLink !== undefined) blog.metaDescriptionLink = metaDescriptionLink;
    if (metaKeywordsLink !== undefined) blog.metaKeywordsLink = metaKeywordsLink;
    if (h1HeadingLink !== undefined) blog.h1HeadingLink = h1HeadingLink;
    if (ogImageLink !== undefined) blog.ogImageLink = ogImageLink;
    if (imageLink !== undefined) blog.imageLink = imageLink;

    await blog.save();

    const populatedBlog = await Blog.findById(blog._id).populate('teamMember', 'name role image email specialization slug teamId');

    res.json({
      success: true,
      message: 'Blog updated successfully',
      data: populatedBlog || blog
    });
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating blog'
    });
  }
});

// Delete blog (protected)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    res.json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting blog'
    });
  }
});

module.exports = router;
