// SafeRecipe – Server Entry Point

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// ── Middleware ──────────────────────────────
app.use(cors());
app.use(express.json());

// ── Config ─────────────────────────────────
const PORT = process.env.PORT || 3000;
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/saferecipe';

// ── Database ───────────────────────────────
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// ── Health check ───────────────────────────
app.get('/', (_req, res) =>
  res.json({ status: 'ok', service: 'SafeRecipe API' })
);

// ── Routes ───────────────────────────────
app.use('/api/recipes', require('./routes/recipes'));
// app.use('/api/users',   require('./routes/users'));

// ── Start ──────────────────────────────────
app.listen(PORT, () =>
  console.log(`🚀 SafeRecipe backend listening on http://localhost:${PORT}`)
);
