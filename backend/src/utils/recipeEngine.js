/**
 * SafeRecipe – Pure Recipe Engine
 *
 * Core rule: Original recipe data is NEVER mutated.
 * Every function receives data and returns a new copy.
 */

// ────────────────────────────────────────────
// 1. Deep-clone helper (avoids shared references)
// ────────────────────────────────────────────
function cloneRecipe(recipe) {
  return JSON.parse(JSON.stringify(recipe));
}

// ────────────────────────────────────────────
// 2. Fatal Allergy Filter (strict)
//    Recipes containing ANY fatal-allergen ingredient
//    are completely removed from the result set.
// ────────────────────────────────────────────
function filterByAllergies(recipes, allergens) {
  if (!Array.isArray(allergens) || allergens.length === 0) return recipes;

  const allergenSet = new Set(allergens.map((a) => a.toLowerCase()));

  return recipes.filter((recipe) => {
    const hasAllergen = recipe.ingredients.some((ing) =>
      allergenSet.has(ing.name.toLowerCase()) ||
      (ing.allergenTags || []).some((tag) => allergenSet.has(tag.toLowerCase()))
    );
    return !hasAllergen;
  });
}

// ────────────────────────────────────────────
// 3. Intolerance Substitution (flexible)
//    Swaps risky ingredients with safe alternatives
//    and marks the recipe with a badge.
// ────────────────────────────────────────────
function substituteIntolerances(recipe, substitutionMap) {
  // substitutionMap: { "cow milk": { replacement: "almond milk", unit: "ml" }, ... }
  const clone = cloneRecipe(recipe);
  let wasModified = false;

  clone.ingredients = clone.ingredients.map((ing) => {
    const key = ing.name.toLowerCase();
    if (substitutionMap[key]) {
      wasModified = true;
      return {
        ...ing,
        originalName: ing.name,
        name: substitutionMap[key].replacement,
        unit: substitutionMap[key].unit || ing.unit,
      };
    }
    return { ...ing };
  });

  if (wasModified) {
    clone.badges = [...(clone.badges || []), 'Alternatif İçerir'];
  }

  return clone;
}

// ────────────────────────────────────────────
// 4. Risk Score Calculator
//    Returns 0-100 score. Higher = more risky.
// ────────────────────────────────────────────
function calculateRiskScore(recipe, userSensitivities) {
  if (!userSensitivities || userSensitivities.length === 0) return 0;

  const severityWeight = { low: 10, medium: 30, high: 60, fatal: 100 };
  let totalRisk = 0;

  recipe.ingredients.forEach((ing) => {
    const nameLower = ing.name.toLowerCase();
    const tags = (ing.allergenTags || []).map((t) => t.toLowerCase());

    userSensitivities.forEach((sens) => {
      const sensLower = sens.ingredient.toLowerCase();
      if (nameLower === sensLower || tags.includes(sensLower)) {
        totalRisk += severityWeight[sens.severity] || 30;
      }
    });
  });

  return Math.min(totalRisk, 100);
}

// ────────────────────────────────────────────
// 5. Dynamic Portion Scaler
//    Mathematically rescales all ingredient amounts.
// ────────────────────────────────────────────
function scaleServings(recipe, targetServings) {
  if (!recipe.servings || targetServings <= 0) return cloneRecipe(recipe);

  const factor = targetServings / recipe.servings;
  const clone = cloneRecipe(recipe);

  clone.ingredients = clone.ingredients.map((ing) => ({
    ...ing,
    amount: Math.round(ing.amount * factor * 100) / 100,
  }));
  clone.servings = targetServings;

  return clone;
}

// ────────────────────────────────────────────
// 6. Shopping List Generator
//    Aggregates ingredients from multiple recipes.
// ────────────────────────────────────────────
function generateShoppingList(recipes) {
  const map = new Map();

  recipes.forEach((recipe) => {
    recipe.ingredients.forEach((ing) => {
      const key = `${ing.name.toLowerCase()}|${ing.unit}`;
      if (map.has(key)) {
        const existing = map.get(key);
        existing.amount += ing.amount;
      } else {
        map.set(key, {
          ingredient: ing.name,
          amount: ing.amount,
          unit: ing.unit,
          checked: false,
        });
      }
    });
  });

  return Array.from(map.values());
}

// ────────────────────────────────────────────
// 7. Match Recipes By Ingredients
// ────────────────────────────────────────────
function matchRecipesByIngredients(recipes, availableIngredients) {
  if (!availableIngredients || availableIngredients.length === 0) return recipes;
  const availableSet = new Set(availableIngredients.map((i) => i.toLowerCase()));

  return recipes.map((recipe) => {
    let matchCount = 0;
    recipe.ingredients.forEach((ing) => {
      if (availableSet.has(ing.name.toLowerCase())) {
        matchCount++;
      }
    });
    const matchScore = recipe.ingredients.length > 0 
      ? Math.round((matchCount / recipe.ingredients.length) * 100) 
      : 0;
    return { ...recipe, matchScore };
  }).sort((a, b) => b.matchScore - a.matchScore);
}

// ────────────────────────────────────────────
// 8. Filter By Blacklist
// ────────────────────────────────────────────
function filterByBlacklist(recipes, blacklist) {
  if (!blacklist || blacklist.length === 0) return recipes;
  const blackSet = new Set(blacklist.map((b) => b.toLowerCase()));

  return recipes.filter((recipe) => {
    const hasBlacklisted = recipe.ingredients.some((ing) => blackSet.has(ing.name.toLowerCase()));
    return !hasBlacklisted;
  });
}

// ────────────────────────────────────────────
// 9. Check Missing Equipment
// ────────────────────────────────────────────
function checkMissingEquipment(recipes, userEquipment) {
  if (!userEquipment || userEquipment.length === 0) return recipes;
  const equipSet = new Set(userEquipment.map((e) => e.toLowerCase()));

  return recipes.filter((recipe) => {
    if (!recipe.equipment || recipe.equipment.length === 0) return true;
    const missing = recipe.equipment.some((e) => !equipSet.has(e.toLowerCase()));
    return !missing;
  });
}

module.exports = {
  cloneRecipe,
  filterByAllergies,
  substituteIntolerances,
  calculateRiskScore,
  scaleServings,
  generateShoppingList,
  matchRecipesByIngredients,
  filterByBlacklist,
  checkMissingEquipment,
};
