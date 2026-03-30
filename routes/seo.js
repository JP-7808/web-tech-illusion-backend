const express = require('express');
const Seo = require('../models/Seo');
const { verifyToken } = require('./auth');
const router = express.Router();

// Get all SEO configs (public - to be consumed by frontend easily)
router.get('/', async (req, res) => {
  try {
    const configs = await Seo.find();
    res.json({ success: true, data: configs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Get SEO config by page name
router.get('/:pageName', async (req, res) => {
  try {
    const config = await Seo.findOne({ pageName: req.params.pageName });
    if (!config) {
      return res.status(404).json({ success: false, message: 'Config not found' });
    }
    res.json({ success: true, data: config });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Create or update SEO config (Protected)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { pageName, metaTitle, metaDescription, metaKeywords, h1Heading, ogImage, ogTitle, ogImageLink, metaTitleLink, metaDescriptionLink, metaKeywordsLink, h1HeadingLink } = req.body;
    
    if (!pageName || !metaTitle) {
       return res.status(400).json({ success: false, message: 'PageName and MetaTitle are required' });
    }

    let config = await Seo.findOne({ pageName });

    if (config) {
      // Update existing
      config.metaTitle = metaTitle;
      if (metaDescription !== undefined) config.metaDescription = metaDescription;
      if (metaKeywords !== undefined) config.metaKeywords = metaKeywords;
      if (h1Heading !== undefined) config.h1Heading = h1Heading;
      if (ogImage !== undefined) config.ogImage = ogImage;
      if (ogTitle !== undefined) config.ogTitle = ogTitle;
      if (ogImageLink !== undefined) config.ogImageLink = ogImageLink;
      if (metaTitleLink !== undefined) config.metaTitleLink = metaTitleLink;
      if (metaDescriptionLink !== undefined) config.metaDescriptionLink = metaDescriptionLink;
      if (metaKeywordsLink !== undefined) config.metaKeywordsLink = metaKeywordsLink;
      if (h1HeadingLink !== undefined) config.h1HeadingLink = h1HeadingLink;
      
      await config.save();
      return res.json({ success: true, message: 'SEO config updated', data: config });
    } else {
      // Create new
      config = new Seo({ pageName, metaTitle, metaDescription, metaKeywords, h1Heading, ogImage, ogTitle, ogImageLink, metaTitleLink, metaDescriptionLink, metaKeywordsLink, h1HeadingLink });
      await config.save();
      return res.status(201).json({ success: true, message: 'SEO config created', data: config });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;
