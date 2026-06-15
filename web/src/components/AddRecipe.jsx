import { useState } from 'react';
import { createRecipe } from '../services/api';

const CATEGORIES = [
  { value: 'breakfast', label: '🌅 Kahvaltı' },
  { value: 'lunch', label: '🍽️ Öğle' },
  { value: 'dinner', label: '🌙 Akşam' },
  { value: 'snack', label: '🥨 Atıştırmalık' },
  { value: 'dessert', label: '🍰 Tatlı' },
  { value: 'beverage', label: '🥤 İçecek' },
];

const PREDEFINED_ALLERGENS = [
  { id: 'gluten', label: 'Gluten' },
  { id: 'dairy', label: 'Süt/Süt Ürünleri' },
  { id: 'nuts', label: 'Kuruyemiş' },
  { id: 'eggs', label: 'Yumurta' },
  { id: 'shellfish', label: 'Kabuklu Deniz Ürünleri' },
  { id: 'soy', label: 'Soya' },
];

export default function AddRecipe({ onRecipeAdded }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Basic info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('lunch');
  const [prepTime, setPrepTime] = useState(15);
  const [cookTime, setCookTime] = useState(30);
  const [servings, setServings] = useState(4);
  const [tagsInput, setTagsInput] = useState('');

  // Dynamic lists
  const [ingredients, setIngredients] = useState([
    { name: '', amount: 1, unit: 'adet', allergenTags: [] }
  ]);
  const [steps, setSteps] = useState(['']);

  function handleAddIngredient() {
    setIngredients([...ingredients, { name: '', amount: 1, unit: 'adet', allergenTags: [] }]);
  }

  function handleRemoveIngredient(index) {
    setIngredients(ingredients.filter((_, i) => i !== index));
  }

  function handleIngredientChange(index, field, value) {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  }

  function handleToggleAllergen(ingIndex, allergenId) {
    const newIngredients = [...ingredients];
    const tags = newIngredients[ingIndex].allergenTags;
    if (tags.includes(allergenId)) {
      newIngredients[ingIndex].allergenTags = tags.filter(t => t !== allergenId);
    } else {
      newIngredients[ingIndex].allergenTags = [...tags, allergenId];
    }
    setIngredients(newIngredients);
  }

  function handleAddStep() {
    setSteps([...steps, '']);
  }

  function handleRemoveStep(index) {
    setSteps(steps.filter((_, i) => i !== index));
  }

  function handleStepChange(index, value) {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title || ingredients.length === 0 || steps.length === 0) {
      setError('Lütfen başlık, en az 1 malzeme ve 1 adım ekleyin.');
      return;
    }

    setLoading(true);
    setError('');

    const recipeData = {
      title,
      description,
      category,
      prepTimeMinutes: Number(prepTime),
      cookTimeMinutes: Number(cookTime),
      servings: Number(servings),
      ingredients: ingredients.map(ing => ({
        ...ing,
        amount: Number(ing.amount)
      })),
      steps: steps.filter(s => s.trim() !== ''),
      tags: tagsInput.split(',').map(t => t.trim()).filter(t => t !== ''),
    };

    try {
      await createRecipe(recipeData);
      onRecipeAdded();
    } catch (err) {
      setError(err.message || 'Tarif eklenirken bir hata oluştu.');
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">➕ Yeni Tarif Ekle</h2>
        <p className="text-white/50 text-sm">Tarif detaylarını doldurun, malzemeleri ve adımları ekleyin.</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info Section */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md space-y-5">
          <h3 className="text-xl font-semibold text-white border-b border-white/10 pb-2">Temel Bilgiler</h3>
          
          <div>
            <label className="block text-sm text-white/60 mb-1">Tarif Adı *</label>
            <input 
              type="text" required
              value={title} onChange={e => setTitle(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-emerald-500/50"
              placeholder="Örn: Zeytinyağlı Enginar"
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1">Açıklama</label>
            <textarea 
              value={description} onChange={e => setDescription(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-emerald-500/50 min-h-[80px]"
              placeholder="Tarif hakkında kısa bir açıklama..."
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-white/60 mb-1">Kategori</label>
              <select 
                value={category} onChange={e => setCategory(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-emerald-500/50"
              >
                {CATEGORIES.map(c => <option key={c.value} value={c.value} className="bg-gray-900">{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">Porsiyon</label>
              <input 
                type="number" min="1" required
                value={servings} onChange={e => setServings(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">Hazırlık (dk)</label>
              <input 
                type="number" min="0"
                value={prepTime} onChange={e => setPrepTime(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">Pişirme (dk)</label>
              <input 
                type="number" min="0"
                value={cookTime} onChange={e => setCookTime(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1">Etiketler (Virgülle ayırın)</label>
            <input 
              type="text" 
              value={tagsInput} onChange={e => setTagsInput(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-emerald-500/50"
              placeholder="sağlıklı, vegan, yaz tarifleri..."
            />
          </div>
        </div>

        {/* Ingredients Section */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h3 className="text-xl font-semibold text-white">Malzemeler *</h3>
            <button type="button" onClick={handleAddIngredient} className="text-sm font-medium text-emerald-400 hover:text-emerald-300">
              + Yeni Malzeme Ekle
            </button>
          </div>
          
          <div className="space-y-4">
            {ingredients.map((ing, i) => (
              <div key={i} className="flex flex-col gap-3 rounded-xl border border-white/5 bg-white/5 p-4 relative group">
                <button 
                  type="button" onClick={() => handleRemoveIngredient(i)}
                  className="absolute top-2 right-2 p-1 text-white/30 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Malzemeyi sil"
                >
                  ✕
                </button>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-xs text-white/50 mb-1">İsim</label>
                    <input 
                      type="text" required
                      value={ing.name} onChange={e => handleIngredientChange(i, 'name', e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-gray-900/50 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500/50"
                      placeholder="Örn: Un"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs text-white/50 mb-1">Miktar</label>
                      <input 
                        type="number" step="0.1" min="0" required
                        value={ing.amount} onChange={e => handleIngredientChange(i, 'amount', e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-gray-900/50 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500/50"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-white/50 mb-1">Birim</label>
                      <input 
                        type="text" required
                        value={ing.unit} onChange={e => handleIngredientChange(i, 'unit', e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-gray-900/50 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500/50"
                        placeholder="gr, ml, sb..."
                      />
                    </div>
                  </div>
                </div>
                
                {/* Allergen Tags Selector */}
                <div>
                  <label className="block text-xs text-white/50 mb-1.5">Bu malzemedeki alerjenler:</label>
                  <div className="flex flex-wrap gap-2">
                    {PREDEFINED_ALLERGENS.map(allergen => {
                      const isSelected = ing.allergenTags.includes(allergen.id);
                      return (
                        <button
                          key={allergen.id}
                          type="button"
                          onClick={() => handleToggleAllergen(i, allergen.id)}
                          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                            isSelected 
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                              : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10 hover:text-white/70'
                          }`}
                        >
                          {isSelected && '✓ '}{allergen.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Steps Section */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h3 className="text-xl font-semibold text-white">Hazırlanış Adımları *</h3>
            <button type="button" onClick={handleAddStep} className="text-sm font-medium text-emerald-400 hover:text-emerald-300">
              + Yeni Adım Ekle
            </button>
          </div>
          
          <div className="space-y-3">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-3 group">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-white/50">
                  {i + 1}
                </span>
                <textarea 
                  required
                  value={step} onChange={e => handleStepChange(i, e.target.value)}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-emerald-500/50 min-h-[60px]"
                  placeholder={`${i + 1}. adım...`}
                />
                <button 
                  type="button" onClick={() => handleRemoveStep(i)}
                  className="p-2 text-white/30 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Adımı sil"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-4 font-bold text-white text-lg shadow-lg shadow-emerald-500/20 transition-all hover:shadow-emerald-500/30 hover:brightness-110 disabled:opacity-50 disabled:cursor-wait"
          >
            {loading ? 'Ekleniyor...' : 'Tarifi Ekle ve Kaydet'}
          </button>
        </div>
      </form>
    </div>
  );
}
