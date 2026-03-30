const express = require('express');
const Blog = require('../models/Blog');
const { verifyToken } = require('./auth');
const router = express.Router();


// Get all published blogs (public)
router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    
    const filter = { status: 'published' };
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } }
      ];
    }

    const blogs = await Blog.find(filter)
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

// Get single blog (public)
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Increment views
    blog.views += 1;
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
    const { status, page = 1, limit = 10 } = req.query;
    
    const filter = status ? { status } : {};

    const blogs = await Blog.find(filter)
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
      title, excerpt, content, category, author, image, imageLink, readTime, status, isFeatured,
      slug, metaTitle, metaDescription, metaKeywords, h1Heading, ogImage, ogTitle,
      metaTitleLink, metaDescriptionLink, metaKeywordsLink, h1HeadingLink, ogImageLink
    } = req.body;

    if (!title || !excerpt || !content || !category || !image) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const blog = new Blog({
      title,
      excerpt,
      content,
      category,
      author: author || 'WebTech Illusion Team',
      image,
      readTime: readTime || '5 min read',
      status: status || 'draft',
      isFeatured: isFeatured || false,
      slug,
      metaTitle,
      metaDescription,
      metaKeywords,
      h1Heading,
      ogImage,
      ogTitle,
      metaTitleLink,
      metaDescriptionLink,
      metaKeywordsLink,
      h1HeadingLink,
      ogImageLink,
      imageLink
    });

    await blog.save();

    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: blog
    });
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating blog'
    });
  }
});

// Update blog (protected)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { 
      title, excerpt, content, category, author, image, imageLink, readTime, status, isFeatured,
      slug, metaTitle, metaDescription, metaKeywords, h1Heading, ogImage, ogTitle,
      metaTitleLink, metaDescriptionLink, metaKeywordsLink, h1HeadingLink, ogImageLink
    } = req.body;

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    if (title) blog.title = title;
    if (excerpt) blog.excerpt = excerpt;
    if (content) blog.content = content;
    if (category) blog.category = category;
    if (author) blog.author = author;
    if (image) blog.image = image;
    if (readTime) blog.readTime = readTime;
    if (status) blog.status = status;
    if (isFeatured !== undefined) blog.isFeatured = isFeatured;
    
    // SEO Fields
    if (slug !== undefined) blog.slug = slug;
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

    res.json({
      success: true,
      message: 'Blog updated successfully',
      data: blog
    });
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating blog'
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
