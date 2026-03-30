const express = require('express');
const router = express.Router();
const { verifyToken } = require('./auth');
const Setting = require('../models/Setting');

const requireSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ success: false, message: 'Access denied: Super Admin only' });
  }
  next();
};

// Get all settings (public for frontend)
router.get('/', async (req, res) => {
  try {
    const settings = await Setting.find().sort({ group: 1, order: 1 });
    
    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.key] = setting.value;
    });
    
    res.json({ success: true, data: settingsObj, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get settings by group (public for frontend)
router.get('/group/:group', async (req, res) => {
  try {
    const settings = await Setting.find({ group: req.params.group }).sort({ order: 1 });
    
    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.key] = setting.value;
    });
    
    res.json({ success: true, data: settingsObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single setting (public)
router.get('/:key', async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: req.params.key });
    if (!setting) return res.json({ success: true, data: null });
    res.json({ success: true, data: setting.value });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update or create setting (Super Admin only)
router.put('/:key', verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const { value, type, label, description, group, order } = req.body;
    
    const setting = await Setting.findOneAndUpdate(
      { key: req.params.key },
      { 
        value,
        ...(type && { type }),
        ...(label && { label }),
        ...(description && { description }),
        ...(group && { group }),
        ...(order !== undefined && { order })
      },
      { new: true, upsert: true, runValidators: true }
    );
    
    res.json({ success: true, data: setting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Bulk update settings (Super Admin only)
router.put('/', verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const { settings } = req.body;
    
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ success: false, message: 'Invalid settings data' });
    }
    
    const bulkOps = Object.entries(settings).map(([key, value]) => ({
      updateOne: {
        filter: { key },
        update: { $set: { value } },
        upsert: true
      }
    }));
    
    await Setting.bulkWrite(bulkOps);
    
    const updatedSettings = await Setting.find().sort({ group: 1, order: 1 });
    const settingsObj = {};
    updatedSettings.forEach(setting => {
      settingsObj[setting.key] = setting.value;
    });
    
    res.json({ success: true, message: 'Settings updated', data: settingsObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Initialize default settings (Super Admin only)
router.post('/init', verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const defaultSettings = [
      // Company Info
      { key: 'company_name', value: 'WebTech Illusion', type: 'text', group: 'company', label: 'Company Name', order: 1 },
      { key: 'company_tagline', value: 'Building Digital Excellence', type: 'text', group: 'company', label: 'Company Tagline', order: 2 },
      { key: 'company_description', value: 'We deliver consulting-led and AI-powered technology services.', type: 'textarea', group: 'company', label: 'Company Description', order: 3 },
      { key: 'company_logo', value: '', type: 'image', group: 'company', label: 'Company Logo URL', order: 4 },
      { key: 'company_favicon', value: '', type: 'image', group: 'company', label: 'Favicon URL', order: 5 },
      
      // Contact Info
      { key: 'contact_email', value: 'info@webtechillusion.com', type: 'email', group: 'contact', label: 'Email Address', order: 1 },
      { key: 'contact_phone', value: '+91 73804 97919', type: 'phone', group: 'contact', label: 'Phone Number', order: 2 },
      { key: 'contact_whatsapp', value: '917380497919', type: 'phone', group: 'contact', label: 'WhatsApp Number', order: 3 },
      { key: 'contact_address', value: 'Lucknow, India', type: 'text', group: 'contact', label: 'Address', order: 4 },
      
      // Social Links
      { key: 'social_facebook', value: '', type: 'url', group: 'social', label: 'Facebook URL', order: 1 },
      { key: 'social_twitter', value: '', type: 'url', group: 'social', label: 'Twitter URL', order: 2 },
      { key: 'social_instagram', value: '', type: 'url', group: 'social', label: 'Instagram URL', order: 3 },
      { key: 'social_linkedin', value: '', type: 'url', group: 'social', label: 'LinkedIn URL', order: 4 },
      { key: 'social_github', value: '', type: 'url', group: 'social', label: 'GitHub URL', order: 5 },
      
      // Footer
      { key: 'footer_copyright', value: '© 2024 WebTech Illusion. All rights reserved.', type: 'text', group: 'footer', label: 'Copyright Text', order: 1 },
      { key: 'footer_tagline', value: 'Building the future of digital solutions.', type: 'text', group: 'footer', label: 'Footer Tagline', order: 2 },
    ];
    
    for (const setting of defaultSettings) {
      await Setting.findOneAndUpdate(
        { key: setting.key },
        setting,
        { upsert: true, new: true }
      );
    }
    
    const allSettings = await Setting.find().sort({ group: 1, order: 1 });
    const settingsObj = {};
    allSettings.forEach(setting => {
      settingsObj[setting.key] = setting.value;
    });
    
    res.json({ success: true, message: 'Default settings initialized', data: settingsObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
