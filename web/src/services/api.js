const API_BASE = 'http://localhost:3000/api';

/**
 * Fetch all recipes, optionally filtered by allergies and category.
 * @param {{ allergies?: string[], category?: string }} options
 */
export async function getRecipes({ category, allergies, blacklist, equipment } = {}) {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (allergies && allergies.length > 0) params.append('allergies', allergies.join(','));
  if (blacklist && blacklist.length > 0) params.append('blacklist', blacklist.join(','));
  if (equipment && equipment.length > 0) params.append('equipment', equipment.join(','));

  const res = await fetch(`${API_BASE}/recipes?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch recipes');
  return res.json();
}

/**
 * Fetch personalized safe recipes based on user sensitivities.
 * @param {Array} sensitivities
 */
export async function getSafeRecipes(sensitivities, blacklist = [], userEquipment = []) {
  const res = await fetch(`${API_BASE}/recipes/safe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sensitivities, blacklist, userEquipment }),
  });
  if (!res.ok) throw new Error('Failed to fetch safe recipes');
  return res.json();
}

/**
 * Get a single recipe by ID.
 */
export async function getRecipeById(id) {
  const res = await fetch(`${API_BASE}/recipes/${id}`);
  if (!res.ok) throw new Error('Recipe not found');
  return res.json();
}

/**
 * Scale a recipe to a target number of servings.
 */
export async function scaleRecipe(id, targetServings) {
  const res = await fetch(`${API_BASE}/recipes/${id}/scale`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetServings }),
  });
  if (!res.ok) throw new Error('Failed to scale recipe');
  return res.json();
}

/**
 * Create a new recipe.
 * @param {Object} recipeData 
 */
export async function createRecipe(recipeData) {
  const res = await fetch(`${API_BASE}/recipes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(recipeData),
  });
  if (!res.ok) throw new Error('Failed to create recipe');
  return res.json();
}

/**
 * Match recipes by available ingredients + sensitivities.
 * @param {string[]} ingredients
 * @param {Array} sensitivities
 */
export async function matchRecipes(ingredients, sensitivities = [], blacklist = [], userEquipment = []) {
  const res = await fetch(`${API_BASE}/recipes/match`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ingredients, sensitivities, blacklist, userEquipment }),
  });
  if (!res.ok) throw new Error('Failed to match recipes');
  return res.json();
}

/**
 * Fetch AI Kitchen Assistant recommendation.
 */
export async function getAiRecommendation(ingredients, sensitivities = [], blacklist = [], userEquipment = [], userName = '') {
  const res = await fetch(`${API_BASE}/recipes/ai-assistant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ingredients, sensitivities, blacklist, userEquipment, userName }),
  });
  if (!res.ok) throw new Error('Failed to fetch AI recommendation');
  return res.json();
}

