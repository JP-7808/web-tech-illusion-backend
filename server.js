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
  "http://localhost:5000"
 
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
app.use('/api/auth', require('./routes/auth'));
app.use('/api/blog', require('./routes/blog'));
app.use('/admin', require('./routes/dashboard'));

/* =========================
   ✅ HEALTH CHECK
========================= */
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Illusion Backend API Running!',
    time: new Date().toISOString()
  });
});

/* =========================
   ✅ SERVER START
========================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 API: http://localhost:${PORT}`);
});