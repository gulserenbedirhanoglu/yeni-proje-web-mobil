const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  unit: { type: String, required: true },
  allergenTags: [{ type: String }],
}, { _id: false });

const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'beverage'],
    default: 'lunch',
  },
  servings: { type: Number, required: true, min: 1 },
  prepTimeMinutes: { type: Number, default: 0 },
  cookTimeMinutes: { type: Number, default: 0 },
  ingredients: [ingredientSchema],
  steps: [{ type: String }],
  imageUrl: { type: String, default: '' },
  tags: [{ type: String }],
  equipment: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Recipe', recipeSchema);
