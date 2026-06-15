require('dotenv').config();
const mongoose = require('mongoose');
const Recipe = require('./src/models/Recipe');

async function run() {
  await mongoose.connect('mongodb://localhost:27017/saferecipe');
  console.log('Connected to DB');

  // Find some recipes and add equipment
  await Recipe.updateMany({ title: /menemen/i }, { $set: { equipment: ['Ocak', 'Tava'] } });
  await Recipe.updateMany({ title: /çorba/i }, { $set: { equipment: ['Ocak', 'Tencere', 'Blender'] } });
  await Recipe.updateMany({ title: /karnıyarık/i }, { $set: { equipment: ['Fırın', 'Tava'] } });
  await Recipe.updateMany({ title: /kek/i }, { $set: { equipment: ['Fırın', 'Mikser', 'Kek Kalıbı'] } });
  await Recipe.updateMany({ title: /patates/i }, { $set: { equipment: ['Airfryer'] } });

  console.log('Equipment updated.');
  mongoose.disconnect();
}

run();
