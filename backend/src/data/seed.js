// Seed script – loads recipes.json into MongoDB

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Recipe = require('../models/Recipe');

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/saferecipe';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing recipes
    await Recipe.deleteMany({});
    console.log('🗑  Cleared existing recipes');

    // Read seed data
    const filePath = path.join(__dirname, 'recipes.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    const recipes = JSON.parse(raw);

    // Insert
    const result = await Recipe.insertMany(recipes);
    console.log(`🌱 Seeded ${result.length} recipes`);

    await mongoose.disconnect();
    console.log('✅ Done');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
}

seed();
