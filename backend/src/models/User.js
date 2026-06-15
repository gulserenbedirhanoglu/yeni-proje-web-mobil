const mongoose = require('mongoose');

const sensitivitySchema = new mongoose.Schema({
  ingredient: { type: String, required: true },
  type: {
    type: String,
    enum: ['allergy', 'intolerance'],
    required: true,
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'fatal'],
    default: 'medium',
  },
  safeAlternatives: [{ type: String }],
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  sensitivities: [sensitivitySchema],
  preferredServings: { type: Number, default: 2, min: 1, max: 20 },
  shoppingList: [{
    ingredient: String,
    amount: Number,
    unit: String,
    checked: { type: Boolean, default: false },
  }],
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
