const mongoose = require('mongoose');
const Recipe = require('./src/models/Recipe');

async function run() {
  await mongoose.connect('mongodb://localhost:27017/saferecipe');
  const recipe = await Recipe.findOne({ title: /Salçalı Makarna/i });
  console.log(JSON.stringify(recipe, null, 2));
  mongoose.disconnect();
}
run();
