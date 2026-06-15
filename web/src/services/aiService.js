import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateRecipeWithGemini(apiKey, ingredients, sensitivities, blacklist, equipment, userName) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const ingredientList = ingredients.join(', ');
  
  let prompt = `Merhaba! Ben sana elimdeki malzemeleri ve özel durumlarımı vereceğim, sen de bana bunlara uygun yaratıcı, nefis ve detaylı bir yemek tarifi önereceksin. Tarifin bir adı, kısa bir açıklaması, malzeme listesi ve adım adım hazırlanışı olmalı.\n\n`;
  
  if (userName) prompt += `Kullanıcının adı: ${userName}\n`;
  prompt += `Elimdeki malzemeler: ${ingredientList}\n`;

  if (sensitivities && sensitivities.length > 0) {
    const allergies = sensitivities.filter(s => s.type === 'allergy').map(s => s.ingredient).join(', ');
    const intolerances = sensitivities.filter(s => s.type === 'intolerance').map(s => s.ingredient).join(', ');
    
    if (allergies) {
      prompt += `DİKKAT! Şiddetli alerjiler: ${allergies}. Bu malzemeleri KESİNLİKLE kullanma.\n`;
    }
    if (intolerances) {
      prompt += `Hafif intoleranslar: ${intolerances}. (Mümkünse kullanma veya alternatif öner).\n`;
    }
  }

  if (blacklist && blacklist.length > 0) {
    prompt += `İstenmeyen malzemeler (Kara liste): ${blacklist.join(', ')}. Lütfen bunları da kullanma.\n`;
  }

  if (equipment && equipment.length > 0) {
    prompt += `Evdeki ekipmanlar: ${equipment.join(', ')}. Tarifi bu ekipmanlara uygun hazırla.\n`;
  }

  prompt += `\nLütfen yanıtını JSON formatında ver. JSON formatı şöyle olmalı:
{
  "title": "Tarifin Adı",
  "description": "Kısa ve iştah açıcı açıklama",
  "ingredients": [
    { "name": "Malzeme 1", "amount": 1, "unit": "adet" }
  ],
  "instructions": [
    "Adım 1",
    "Adım 2"
  ],
  "prepTimeMinutes": 15,
  "cookTimeMinutes": 30,
  "difficulty": "Kolay/Orta/Zor",
  "tags": ["Tag1", "Tag2"],
  "matchScore": 100
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Extract JSON if it's wrapped in markdown code blocks
    let jsonText = text;
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    } else {
      const match2 = text.match(/{[\s\S]*}/);
      if (match2) {
        jsonText = match2[0];
      }
    }
    
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Gemini AI ile tarif oluşturulamadı.");
  }
}
