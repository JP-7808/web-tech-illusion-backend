const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

/* =========================
   ✅ CORS (SIMPLE + CLEAN)
========================= */
app.use(cors({
  origin: [
    "https://webtechillusion.com",
    "https://www.webtechillusion.com",
    "https://admin-panel-cyan-pi.vercel.app",
    "http://localhost:5000",
    "http://localhost:5001",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
      "http://127.0.0.1:5175",
      "http://127.0.0.1:3000"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

/* =========================
   ✅ BODY PARSER
========================= */
app.use(express.json());

/* =========================
   ✅ RATE LIMIT
========================= */
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

/* =========================
   ✅ STATIC FILES
========================= */
app.use(express.static('public'));

/* =========================
   ✅ MONGODB CONNECTION
========================= */
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/illusion_website')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

/* =========================
   ✅ ROUTES
========================= */
app.use('/api/contact', require('./routes/contact'));
app.use('/api/newsletter', require('./routes/newsletter'));
app.use('/api/auth', require('./routes/auth').router);
app.use('/api/blog', require('./routes/blog'));
app.use('/api/seo', require('./routes/seo'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/services', require('./routes/services'));
app.use('/api/team', require('./routes/team'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/settings', require('./routes/settings'));
app.use('/admin', require('./routes/dashboard'));

/* =========================
   ✅ HEALTH CHECK
========================= */
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Illusion Backend API Running on 5001!',
    time: new Date().toISOString()
  });
});

/* =========================
   ✅ SERVER START
========================= */
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 API: http://localhost:${PORT}`);
});