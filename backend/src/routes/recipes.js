const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const {
  filterByAllergies,
  substituteIntolerances,
  calculateRiskScore,
  scaleServings,
  matchRecipesByIngredients,
  filterByBlacklist,
  checkMissingEquipment,
} = require('../utils/recipeEngine');
const { generateAiResponse } = require('../utils/aiEngine');

// ─── GET /api/recipes ──────────────────────
// Query params: ?allergies=gluten,dairy&category=breakfast
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }

    let recipes = await Recipe.find(filter).lean();

    // Strict allergy filter
    if (req.query.allergies) {
      const allergens = req.query.allergies.split(',').map((a) => a.trim());
      recipes = filterByAllergies(recipes, allergens);
    }

    if (req.query.blacklist) {
      const blacklist = req.query.blacklist.split(',').map((b) => b.trim());
      recipes = filterByBlacklist(recipes, blacklist);
    }

    if (req.query.equipment) {
      const equipment = req.query.equipment.split(',').map((e) => e.trim());
      recipes = checkMissingEquipment(recipes, equipment);
    }

    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/recipes/safe ────────────────
// Body: { sensitivities: [...], blacklist: [...], userEquipment: [...] }
// Returns filtered + substituted recipes with risk scores
router.post('/safe', async (req, res) => {
  try {
    const { sensitivities = [], blacklist = [], userEquipment = [] } = req.body;
    let recipes = await Recipe.find().lean();

    // 1. Separate allergies vs intolerances
    const allergies = sensitivities
      .filter((s) => s.type === 'allergy')
      .map((s) => s.ingredient);

    const intolerances = sensitivities.filter(
      (s) => s.type === 'intolerance'
    );

    // 2. Fatal allergy filter – hide completely
    recipes = filterByAllergies(recipes, allergies);

    // 3. Intolerance substitution
    const substitutionMap = {};
    intolerances.forEach((s) => {
      if (s.safeAlternatives && s.safeAlternatives.length > 0) {
        substitutionMap[s.ingredient.toLowerCase()] = {
          replacement: s.safeAlternatives[0],
        };
      }
    });

    recipes = recipes.map((recipe) => {
      const substituted = substituteIntolerances(recipe, substitutionMap);
      const riskScore = calculateRiskScore(substituted, sensitivities);
      return { ...substituted, riskScore };
    });

    // Sort by risk score (safest first)
    recipes.sort((a, b) => a.riskScore - b.riskScore);

    // Apply blacklist
    recipes = filterByBlacklist(recipes, blacklist);

    // Apply equipment check
    if (userEquipment.length > 0) {
      recipes = checkMissingEquipment(recipes, userEquipment);
    }

    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/recipes/:id ──────────────────
router.get('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).lean();
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/recipes/:id/scale ───────────
// Body: { targetServings: 4 }
router.post('/:id/scale', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).lean();
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });

    const { targetServings } = req.body;
    if (!targetServings || targetServings <= 0) {
      return res.status(400).json({ error: 'Invalid targetServings' });
    }

    const scaled = scaleServings(recipe, targetServings);
    res.json(scaled);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/recipes/match ───────────────
// Body: { ingredients: ["domates"], sensitivities: [...], blacklist: [...], userEquipment: [...] }
// Returns recipes with matchScore, sorted by match %
router.post('/match', async (req, res) => {
  try {
    const { ingredients = [], sensitivities = [], blacklist = [], userEquipment = [] } = req.body;
    let recipes = await Recipe.find().lean();

    // 1. Allergy filter
    const allergies = sensitivities
      .filter((s) => s.type === 'allergy')
      .map((s) => s.ingredient);
    recipes = filterByAllergies(recipes, allergies);

    // 2. Intolerance substitution
    const intolerances = sensitivities.filter((s) => s.type === 'intolerance');
    const substitutionMap = {};
    intolerances.forEach((s) => {
      if (s.safeAlternatives && s.safeAlternatives.length > 0) {
        substitutionMap[s.ingredient.toLowerCase()] = {
          replacement: s.safeAlternatives[0],
        };
      }
    });

    recipes = recipes.map((recipe) => {
      const substituted = substituteIntolerances(recipe, substitutionMap);
      const riskScore = calculateRiskScore(substituted, sensitivities);
      return { ...substituted, riskScore };
    });

    // 3. Match by ingredients
    recipes = matchRecipesByIngredients(recipes, ingredients);

    // 4. Blacklist and Equipment
    recipes = filterByBlacklist(recipes, blacklist);
    if (userEquipment.length > 0) {
      recipes = checkMissingEquipment(recipes, userEquipment);
    }

    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/recipes ─────────────────────
// Body: Recipe object
router.post('/', async (req, res) => {
  try {
    const newRecipe = new Recipe(req.body);
    const savedRecipe = await newRecipe.save();
    res.status(201).json(savedRecipe);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ─── POST /api/recipes/ai-assistant ────────
// Body: { ingredients: ["domates"], sensitivities: [...], blacklist: [...], userEquipment: [...], userName: "Gülseren" }
router.post('/ai-assistant', async (req, res) => {
  try {
    const { ingredients = [], sensitivities = [], blacklist = [], userEquipment = [], userName = '' } = req.body;
    
    if (ingredients.length === 0) {
      return res.json({ recipe: null, aiMessage: "Lütfen bana elindeki malzemeleri söyle ki sana harika bir tarif önerebileyim! 🧑‍🍳" });
    }

    let recipes = await Recipe.find().lean();

    // 1. Allergy filter
    const allergies = sensitivities.filter((s) => s.type === 'allergy').map((s) => s.ingredient);
    recipes = filterByAllergies(recipes, allergies);

    // 2. Intolerance substitution
    const intolerances = sensitivities.filter((s) => s.type === 'intolerance');
    const substitutionMap = {};
    intolerances.forEach((s) => {
      if (s.safeAlternatives && s.safeAlternatives.length > 0) {
        substitutionMap[s.ingredient.toLowerCase()] = {
          replacement: s.safeAlternatives[0],
        };
      }
    });

    recipes = recipes.map((recipe) => substituteIntolerances(recipe, substitutionMap));

    // 3. Blacklist and Equipment
    recipes = filterByBlacklist(recipes, blacklist);
    if (userEquipment.length > 0) {
      recipes = checkMissingEquipment(recipes, userEquipment);
    }

    // 4. Match by ingredients
    recipes = matchRecipesByIngredients(recipes, ingredients);

    const bestRecipe = recipes.length > 0 ? recipes[0] : null;

    // 5. Generate AI Response
    const aiMessage = generateAiResponse(userName, ingredients, bestRecipe);

    res.json({
      recipe: bestRecipe,
      aiMessage
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
