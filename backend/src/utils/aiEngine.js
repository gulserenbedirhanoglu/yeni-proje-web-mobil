/**
 * Heuristic NLP Engine for SafeRecipe AI Assistant
 * Generates conversational Turkish responses based on recipe matching.
 */

function generateAiResponse(userName, userIngredients, bestRecipe) {
  const nameStr = userName && userName.trim() ? userName.trim() : 'Şefim';
  
  if (!bestRecipe) {
    return `${nameStr}, maalesef elindeki malzemelere uygun bir tarif bulamadım. Belki birkaç temel malzeme (örneğin yumurta, un veya domates) eklersen harikalar yaratabiliriz!`;
  }

  // Determine missing ingredients
  const userSet = new Set(userIngredients.map(i => i.toLowerCase().trim()));
  const missing = [];
  
  const recipeIngredients = bestRecipe.ingredients || [];
  recipeIngredients.forEach(ing => {
    const parts = ing.name.toLowerCase().split(',').map(p => p.trim()).filter(Boolean);
    let hasOne = false;
    
    parts.forEach(part => {
      if (userSet.has(part)) hasOne = true;
      if (ing.originalName && userSet.has(ing.originalName.toLowerCase())) hasOne = true;
      
      for (const ui of userSet) {
        if (part.includes(ui) || ui.includes(part)) {
          hasOne = true;
          break;
        }
      }
    });

    if (!hasOne) {
      missing.push(parts.join(' veya '));
    }
  });

  const recipeName = bestRecipe.title;

  if (missing.length === 0) {
    return `Harika haber ${nameStr}! Elindeki malzemelerle veritabanımızdaki "${recipeName}" tarifini eksiksiz yapabilirsin. Hadi hemen mutfağa geçelim! 👨‍🍳✨`;
  }

  if (missing.length <= 2) {
    const missingStr = missing.join(' ve ');
    return `${nameStr}, elindeki malzemelerle "${recipeName}" tarifine çok yaklaştın! Sadece ${missingStr} eksik. Eksikleri tamamlayıp (veya yaratıcılığını konuşturup onlarsız) harika bir "${recipeName}" yapabiliriz! 🚀`;
  }

  return `${nameStr}, yazdığın malzemeler bana hemen "${recipeName}" tarifini hatırlattı. Tabi ${missing.slice(0, 2).join(', ')} gibi birkaç eksiğimiz var ama olsun, en yakın eşleşmemiz bu! Mutfakta harikalar yaratacağına eminim. 🍽️`;
}

module.exports = {
  generateAiResponse
};
