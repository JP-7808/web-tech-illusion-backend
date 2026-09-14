const express = require('express');
const Seo = require('../models/Seo');
const Blog = require('../models/Blog');
const { verifyToken } = require('./auth');
const router = express.Router();

const defaultConfigs = {
  home: {
    pageName: 'home',
    slug: '',
    canonicalUrl: 'https://webtechillusion.com',
    robots: 'index, follow',
    schemaType: 'WebSite',
    focusKeyword: 'software development company web digital solutions',
    imageAltText: 'WebTech Illusion - Next-Gen Software and Web Development',
    metaTitle: 'WebTech Illusion - Digital Solutions, Web & Software Development',
    metaDescription: 'Transform your business with WebTech Illusion. High-performance web development, AI integration, mobile apps, and scalable digital solutions.',
    metaKeywords: 'web development, software company, mobile app development, UI/UX design, AI solutions, SEO agency, digital marketing, cloud DevOps',
    h1Heading: 'Building High-Performance Digital Experiences That Matter',
    ogTitle: 'WebTech Illusion - Digital Solutions & Next-Gen Software',
    ogImage: 'https://webtechillusion.com/assets/og-home.jpg'
  },
  about: {
    pageName: 'about',
    slug: 'about',
    canonicalUrl: 'https://webtechillusion.com/about',
    robots: 'index, follow',
    schemaType: 'AboutPage',
    focusKeyword: 'about webtech illusion digital agency company',
    imageAltText: 'About WebTech Illusion Team and Mission',
    metaTitle: 'About Us | WebTech Illusion - Engineering Digital Innovation',
    metaDescription: 'Discover the story, mission, and expert team behind WebTech Illusion. Delivering enterprise-grade digital products and consulting services globally.',
    metaKeywords: 'about webtech illusion, tech company mission, software team, digital transformation agency',
    h1Heading: 'Pioneering Digital Excellence with Passion and Precision',
    ogTitle: 'About WebTech Illusion - Who We Are',
    ogImage: 'https://webtechillusion.com/assets/og-about.jpg'
  },
  services: {
    pageName: 'services',
    slug: 'services',
    canonicalUrl: 'https://webtechillusion.com/services',
    robots: 'index, follow',
    schemaType: 'Service',
    focusKeyword: 'custom web development mobile app cloud services',
    imageAltText: 'WebTech Illusion Full-Stack Services',
    metaTitle: 'Our Services | Web, Mobile, AI & Cloud Engineering - WebTech Illusion',
    metaDescription: 'End-to-end technology services: custom web apps, iOS/Android mobile apps, e-commerce, cloud DevOps, AI automation, and full-funnel digital marketing.',
    metaKeywords: 'web development services, mobile app development, AI solutions, cloud hosting, DevOps, SEO services',
    h1Heading: 'Comprehensive Digital Capabilities Built for Modern Scale',
    ogTitle: 'End-to-End Technology & Software Development Services',
    ogImage: 'https://webtechillusion.com/assets/og-services.jpg'
  },
  projects: {
    pageName: 'projects',
    slug: 'projects',
    canonicalUrl: 'https://webtechillusion.com/projects',
    robots: 'index, follow',
    schemaType: 'CollectionPage',
    focusKeyword: 'web development portfolio case studies projects',
    imageAltText: 'WebTech Illusion Featured Projects and Case Studies',
    metaTitle: 'Projects & Case Studies | Proven Digital Results - WebTech Illusion',
    metaDescription: 'Explore our portfolio of delivered web applications, mobile apps, e-commerce stores, and enterprise solutions with verified client growth results.',
    metaKeywords: 'portfolio, software projects, web apps case studies, client success stories',
    h1Heading: 'Showcasing Breakthrough Digital Solutions & Client Success',
    ogTitle: 'WebTech Illusion Case Studies & Portfolio',
    ogImage: 'https://webtechillusion.com/assets/og-projects.jpg'
  },
  team: {
    pageName: 'team',
    slug: 'team',
    canonicalUrl: 'https://webtechillusion.com/team',
    robots: 'index, follow',
    schemaType: 'AboutPage',
    focusKeyword: 'webtech illusion leadership developers designers engineers',
    imageAltText: 'WebTech Illusion Leadership and Engineering Team',
    metaTitle: 'Meet the Team | Experts, Engineers & Designers - WebTech Illusion',
    metaDescription: 'Meet the talented engineers, architects, designers, and growth specialists driving innovation and delivering exceptional products at WebTech Illusion.',
    metaKeywords: 'tech team, software engineers, UI/UX designers, leadership, WebTech Illusion team',
    h1Heading: 'The Minds and Craftsmen Behind Every Breakthrough',
    ogTitle: 'Meet the WebTech Illusion Engineering Team',
    ogImage: 'https://webtechillusion.com/assets/og-team.jpg'
  },
  contact: {
    pageName: 'contact',
    slug: 'contact',
    canonicalUrl: 'https://webtechillusion.com/contact',
    robots: 'index, follow',
    schemaType: 'ContactPage',
    focusKeyword: 'contact webtech illusion hire developers consultation',
    imageAltText: 'Contact WebTech Illusion Team for Free Consultation',
    metaTitle: 'Contact Us | Start Your Project - WebTech Illusion',
    metaDescription: 'Get in touch with WebTech Illusion for a free technical consultation, project estimate, or partnership inquiry. Fast 24-hour turnaround guaranteed.',
    metaKeywords: 'contact software agency, hire web developers, get website quote, free tech consultation',
    h1Heading: 'Let’s Build Something Remarkable Together',
    ogTitle: 'Contact WebTech Illusion - Free Project Consultation',
    ogImage: 'https://webtechillusion.com/assets/og-contact.jpg'
  },
  industries: {
    pageName: 'industries',
    slug: 'industries',
    canonicalUrl: 'https://webtechillusion.com/industries',
    robots: 'index, follow',
    schemaType: 'WebPage',
    focusKeyword: 'industry software solutions healthcare ecommerce real estate education',
    imageAltText: 'Industry Solutions by WebTech Illusion',
    metaTitle: 'Industry Solutions | Tailored Tech for Every Sector - WebTech Illusion',
    metaDescription: 'Tailored technology solutions for Healthcare, E-Commerce, Education, Travel & Tourism, Real Estate, and Financial Services.',
    metaKeywords: 'healthcare software, ecommerce solutions, edtech platforms, real estate tech',
    h1Heading: 'Domain-Specific Digital Solutions Engineered for Industry Leaders',
    ogTitle: 'Industry-Specific Software & Web Solutions',
    ogImage: 'https://webtechillusion.com/assets/og-industries.jpg'
  },
  careers: {
    pageName: 'careers',
    slug: 'careers',
    canonicalUrl: 'https://webtechillusion.com/careers',
    robots: 'index, follow',
    schemaType: 'WebPage',
    focusKeyword: 'careers jobs software developer hiring webtech illusion',
    imageAltText: 'Careers at WebTech Illusion',
    metaTitle: 'Careers | Join Our Engineering & Design Team - WebTech Illusion',
    metaDescription: 'Build the future of technology with us. Explore open positions for React developers, Node.js engineers, UI/UX designers, and AI specialists.',
    metaKeywords: 'tech jobs, developer careers, hire frontend engineer, software developer hiring',
    h1Heading: 'Shape the Future of Technology with Us',
    ogTitle: 'Careers at WebTech Illusion - We Are Hiring',
    ogImage: 'https://webtechillusion.com/assets/og-careers.jpg'
  },
  'case-studies': {
    pageName: 'case-studies',
    slug: 'case-studies',
    canonicalUrl: 'https://webtechillusion.com/case-studies',
    robots: 'index, follow',
    schemaType: 'CollectionPage',
    focusKeyword: 'client case studies digital transformation results ROI',
    imageAltText: 'WebTech Illusion Detailed Case Studies',
    metaTitle: 'Case Studies | Measurable Digital Impact - WebTech Illusion',
    metaDescription: 'In-depth case studies showcasing how we helped brands achieve 200%+ revenue growth, sub-second load times, and massive user scale.',
    metaKeywords: 'digital transformation case studies, ecommerce growth study, web performance case study',
    h1Heading: 'Real Challenges. Bold Engineering. Measurable Results.',
    ogTitle: 'WebTech Illusion Case Studies - Client ROI & Impact',
    ogImage: 'https://webtechillusion.com/assets/og-case-studies.jpg'
  },
  documentation: {
    pageName: 'documentation',
    slug: 'documentation',
    canonicalUrl: 'https://webtechillusion.com/documentation',
    robots: 'index, follow',
    schemaType: 'TechArticle',
    focusKeyword: 'developer documentation technical guides API standards',
    imageAltText: 'WebTech Illusion Technical Documentation and Standards',
    metaTitle: 'Documentation & Guides | Tech Architecture - WebTech Illusion',
    metaDescription: 'Explore our engineering standards, API documentation, deployment workflows, security best practices, and integration guides.',
    metaKeywords: 'developer docs, tech architecture, API documentation, coding standards',
    h1Heading: 'Engineering Standards & Developer Documentation',
    ogTitle: 'WebTech Illusion Documentation & Architecture Guides',
    ogImage: 'https://webtechillusion.com/assets/og-docs.jpg'
  },
  blog: {
    pageName: 'blog',
    slug: 'blog',
    canonicalUrl: 'https://webtechillusion.com/blog',
    robots: 'index, follow',
    schemaType: 'Blog',
    focusKeyword: 'technology blog web development AI trends tech insights',
    imageAltText: 'WebTech Illusion Technology Blog & Insights',
    metaTitle: 'Tech Insights & Blog | Web, AI & Growth - WebTech Illusion',
    metaDescription: 'Stay ahead with the latest articles on modern web development, React, AI integrations, cloud architecture, and digital growth strategies.',
    metaKeywords: 'tech blog, React tutorials, web development tips, AI technology insights, SEO guide',
    h1Heading: 'Insights, Guides & Trends from Technology Leaders',
    ogTitle: 'WebTech Illusion Blog - Engineering & Tech Insights',
    ogImage: 'https://webtechillusion.com/assets/og-blog.jpg'
  }
};

// Get all SEO configs (public - to be consumed by frontend easily)
router.get('/', async (req, res) => {
  try {
    const configs = await Seo.find();
    res.json({ success: true, data: configs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Seed default SEO configurations if not present
router.post('/seed-defaults', verifyToken, async (req, res) => {
  try {
    const results = [];
    for (const [pageKey, config] of Object.entries(defaultConfigs)) {
      let existing = await Seo.findOne({ pageName: pageKey });
      if (!existing) {
        existing = new Seo(config);
        await existing.save();
        results.push({ page: pageKey, action: 'created' });
      } else {
        results.push({ page: pageKey, action: 'exists' });
      }
    }
    const allConfigs = await Seo.find();
    res.json({
      success: true,
      message: 'SEO defaults seeded successfully',
      results,
      data: allConfigs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
});

// Get SEO config by page name with smart fallback
router.get('/:pageName', async (req, res) => {
  try {
    const pageName = req.params.pageName;
    const config = await Seo.findOne({ pageName });
    if (!config) {
      if (defaultConfigs[pageName]) {
        return res.json({ success: true, data: defaultConfigs[pageName], isDefault: true });
      }
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
    const {
      pageName,
      slug,
      canonicalUrl,
      robots,
      schemaType,
      focusKeyword,
      imageAltText,
      metaTitle,
      metaDescription,
      metaKeywords,
      h1Heading,
      ogImage,
      ogTitle,
      ogImageLink,
      metaTitleLink,
      metaDescriptionLink,
      metaKeywordsLink,
      h1HeadingLink
    } = req.body;

    if (!pageName || !metaTitle) {
      return res.status(400).json({ success: false, message: 'PageName and MetaTitle are required' });
    }

    let config = await Seo.findOne({ pageName });

    if (config) {
      // Update existing
      config.metaTitle = metaTitle;
      if (slug !== undefined) config.slug = slug;
      if (canonicalUrl !== undefined) config.canonicalUrl = canonicalUrl;
      if (robots !== undefined) config.robots = robots;
      if (schemaType !== undefined) config.schemaType = schemaType;
      if (focusKeyword !== undefined) config.focusKeyword = focusKeyword;
      if (imageAltText !== undefined) config.imageAltText = imageAltText;
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
      return res.json({ success: true, message: 'SEO config updated successfully', data: config });
    } else {
      // Create new
      config = new Seo({
        pageName,
        slug,
        canonicalUrl,
        robots,
        schemaType,
        focusKeyword,
        imageAltText,
        metaTitle,
        metaDescription,
        metaKeywords,
        h1Heading,
        ogImage,
        ogTitle,
        ogImageLink,
        metaTitleLink,
        metaDescriptionLink,
        metaKeywordsLink,
        h1HeadingLink
      });
      await config.save();
      return res.status(201).json({ success: true, message: 'SEO config created successfully', data: config });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
});

// Dynamic XML Sitemap Endpoint
router.get('/dynamic/sitemap.xml', async (req, res) => {
  try {
    const siteUrl = 'https://webtechillusion.com';
    const staticRoutes = [
      { loc: '', changefreq: 'daily', priority: '1.0' },
      { loc: 'services', changefreq: 'weekly', priority: '0.9' },
      { loc: 'projects', changefreq: 'weekly', priority: '0.9' },
      { loc: 'case-studies', changefreq: 'weekly', priority: '0.8' },
      { loc: 'about', changefreq: 'monthly', priority: '0.8' },
      { loc: 'industries', changefreq: 'monthly', priority: '0.8' },
      { loc: 'blog', changefreq: 'daily', priority: '0.9' },
      { loc: 'contact', changefreq: 'monthly', priority: '0.8' },
      { loc: 'team', changefreq: 'monthly', priority: '0.7' },
      { loc: 'careers', changefreq: 'monthly', priority: '0.7' },
      { loc: 'documentation', changefreq: 'monthly', priority: '0.7' }
    ];

    let blogEntries = [];
    try {
      const blogs = await Blog.find({ status: 'published' }).select('slug updatedAt');
      blogEntries = blogs.map(b => ({
        loc: `blog/${b.slug || b._id}`,
        lastmod: b.updatedAt ? new Date(b.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        changefreq: 'monthly',
        priority: '0.7'
      }));
    } catch (e) {
      // Ignore if Blog collection is unavailable
    }

    const today = new Date().toISOString().split('T')[0];
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    staticRoutes.forEach(route => {
      xml += `  <url>\n`;
      xml += `    <loc>${siteUrl}/${route.loc}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
      xml += `    <priority>${route.priority}</priority>\n`;
      xml += `  </url>\n`;
    });

    blogEntries.forEach(route => {
      xml += `  <url>\n`;
      xml += `    <loc>${siteUrl}/${route.loc}</loc>\n`;
      xml += `    <lastmod>${route.lastmod}</lastmod>\n`;
      xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
      xml += `    <priority>${route.priority}</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    res.status(500).send('Error generating sitemap');
  }
});

module.exports = router;
