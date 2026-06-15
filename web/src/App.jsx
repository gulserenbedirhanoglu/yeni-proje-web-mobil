import { useState, useEffect, useCallback } from 'react';
import RecipeCard from './components/RecipeCard';
import RecipeDetail from './components/RecipeDetail';
import AllergyProfile from './components/AllergyProfile';
import AddRecipe from './components/AddRecipe';
import HomePantry from './components/HomePantry';
import AiAssistant from './components/AiAssistant';
import AiResultModal from './components/AiResultModal';
import { getRecipes, getSafeRecipes, matchRecipes, getAiRecommendation } from './services/api';
import { generateRecipeWithGemini } from './services/aiService';

const TABS = [
  { id: 'recipes', label: '🍽️ Tarifler', shortLabel: 'Tarifler' },
  { id: 'favorites', label: '❤️ Favoriler', shortLabel: 'Favoriler' },
  { id: 'pantry', label: '🏠 Evdekiler', shortLabel: 'Evdekiler' },
  { id: 'profile', label: '🛡️ Profilim', shortLabel: 'Profil' },
  { id: 'add', label: '➕ Tarif Ekle', shortLabel: 'Ekle' },
];

const CATEGORIES = [
  { value: '', label: 'Tümü' },
  { value: 'breakfast', label: '🌅 Kahvaltı' },
  { value: 'lunch', label: '🍽️ Öğle' },
  { value: 'dinner', label: '🌙 Akşam' },
  { value: 'snack', label: '🥨 Atıştırmalık' },
  { value: 'dessert', label: '🍰 Tatlı' },
  { value: 'beverage', label: '🥤 İçecek' },
];

// Load/save sensitivities from localStorage
function loadSensitivities() {
  try {
    const raw = localStorage.getItem('saferecipe_sensitivities');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSensitivities(data) {
  localStorage.setItem('saferecipe_sensitivities', JSON.stringify(data));
}

function loadFavorites() {
  try {
    const raw = localStorage.getItem('saferecipe_favorites');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveFavorites(data) {
  localStorage.setItem('saferecipe_favorites', JSON.stringify(data));
}

function loadPantry() {
  try {
    const raw = localStorage.getItem('saferecipe_pantry');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePantry(data) {
  localStorage.setItem('saferecipe_pantry', JSON.stringify(data));
}

function loadBlacklist() {
  try {
    const raw = localStorage.getItem('saferecipe_blacklist');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveBlacklist(data) {
  localStorage.setItem('saferecipe_blacklist', JSON.stringify(data));
}

function loadEquipment() {
  try {
    const raw = localStorage.getItem('saferecipe_equipment');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEquipment(data) {
  localStorage.setItem('saferecipe_equipment', JSON.stringify(data));
}

function loadUserProfile() {
  try {
    const raw = localStorage.getItem('saferecipe_userprofile');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveUserProfile(data) {
  try {
    localStorage.setItem('saferecipe_userprofile', JSON.stringify(data));
  } catch (e) {
    console.error('Kullanıcı profili kaydedilirken hata oluştu. Depolama alanı dolu olabilir:', e);
    alert('Profil kaydedilirken bir hata oluştu. Lütfen daha küçük bir fotoğraf yüklemeyi deneyin.');
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState('recipes');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('');
  const [sensitivities, setSensitivities] = useState(loadSensitivities);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // New features state
  const [favorites, setFavorites] = useState(loadFavorites);
  const [fastOnly, setFastOnly] = useState(false);
  const [veganOnly, setVeganOnly] = useState(false);
  const [pantry, setPantry] = useState(loadPantry);
  const [matchMode, setMatchMode] = useState(false);
  const [userProfile, setUserProfile] = useState(loadUserProfile);
  const [blacklist, setBlacklist] = useState(loadBlacklist);
  const [equipment, setEquipment] = useState(loadEquipment);

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  function handleUserProfileUpdate(profile) {
    setUserProfile(profile);
    saveUserProfile(profile);
  }

  function handleBlacklistUpdate(newList) {
    setBlacklist(newList);
    saveBlacklist(newList);
  }

  function handleEquipmentUpdate(newList) {
    setEquipment(newList);
    saveEquipment(newList);
  }

  function handlePantryUpdate(newPantry) {
    setPantry(newPantry);
    savePantry(newPantry);
  }

  async function runPantryMatch() {
    if (pantry.length === 0) return;
    const ingredientNames = pantry.map(p => p.ingredient);
    setLoading(true);
    setError('');
    setMatchMode(true);
    try {
      const data = await matchRecipes(ingredientNames, sensitivities, blacklist, equipment);
      setRecipes(data);
    } catch (err) {
      setError('Eşleştirme sırasında hata oluştu.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function clearMatch() {
    setMatchMode(false);
    fetchRecipes();
  }

  function toggleFavorite(recipe) {
    const id = recipe._id || recipe.title;
    let newFavs;
    if (favorites.includes(id)) {
      newFavs = favorites.filter(f => f !== id);
    } else {
      newFavs = [...favorites, id];
    }
    setFavorites(newFavs);
    saveFavorites(newFavs);
  }

  // Fetch recipes
  async function handleAiSubmit(ingredients) {
    setIsAiLoading(true);
    try {
      const name = userProfile?.name || '';
      const apiKey = localStorage.getItem('saferecipe_gemini_key');
      
      let data;
      if (apiKey) {
        data = await generateRecipeWithGemini(apiKey, ingredients, sensitivities, blacklist, equipment, name);
      } else {
        data = await getAiRecommendation(ingredients, sensitivities, blacklist, equipment, name);
      }
      setAiResult(data);
    } catch (err) {
      console.error(err);
      alert('Yapay zeka asistanı şu an yanıt veremiyor.');
    } finally {
      setIsAiLoading(false);
    }
  }

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    setError('');
    setMatchMode(false);
    try {
      let data;
      if (sensitivities.length > 0) {
        data = await getSafeRecipes(sensitivities, blacklist, equipment);
      } else {
        data = await getRecipes({ category, blacklist, equipment });
      }

      // Apply category filter client-side for safe recipes
      if (sensitivities.length > 0 && category) {
        data = data.filter((r) => r.category === category);
      }

      setRecipes(data);
    } catch (err) {
      setError('Tarifler yüklenirken hata oluştu. Backend çalışıyor mu?');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [category, sensitivities, blacklist, equipment]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  // Save sensitivities
  function handleSensitivitiesUpdate(newSens) {
    setSensitivities(newSens);
    saveSensitivities(newSens);
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* ─── Header ─────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-gray-950/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🥗</span>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                  SafeRecipe
                </h1>
                <p className="text-xs text-white/30">Güvenli Beslenme Asistanı</p>
              </div>
            </div>

            {/* Sensitivity indicator */}
            {sensitivities.length > 0 && (
              <div 
                className="hidden sm:flex relative items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-2 cursor-pointer hover:bg-white/10 transition-colors group"
                onClick={() => setActiveTab('profile')}
              >
                <span className="text-xs text-white/40">Aktif filtre:</span>
                <span className="text-xs font-semibold text-emerald-400">
                  {sensitivities.length} hassasiyet
                </span>
                
                {/* Tooltip on hover */}
                <div className="absolute top-full right-0 mt-2 w-64 rounded-xl border border-white/10 bg-gray-900 p-3 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <p className="text-xs font-semibold text-white/70 border-b border-white/10 pb-2 mb-2">Hassasiyetleriniz</p>
                  <ul className="max-h-48 overflow-y-auto space-y-2">
                    {sensitivities.map((s, i) => (
                      <li key={i} className="flex justify-between items-center text-xs">
                        <span className="text-white/80 font-medium">{s.ingredient}</span>
                        <span className={`px-2 py-0.5 rounded border ${s.type === 'allergy' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                          {s.type === 'allergy' ? 'Alerji' : 'İntolerans'}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-[10px] text-white/40 mt-3 pt-2 border-t border-white/10 text-center flex items-center justify-center gap-1">
                    <span>✏️</span> Düzenlemek için tıklayın
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ─── Tab Navigation ─────────────── */}
      <nav className="sticky top-[73px] z-30 border-b border-white/5 bg-gray-950/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-6 py-3.5 text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'text-emerald-400'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* ─── Main Content ───────────────── */}
      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Recipes Tab */}
        {activeTab === 'recipes' && (
          <div className="space-y-6">
            <AiAssistant onSubmit={handleAiSubmit} isLoading={isAiLoading} />
            
            {/* Search Bar */}
            <div className="relative">
              <span className="absolute inset-y-0 left-4 flex items-center text-white/30 text-lg">🔍</span>
              <input 
                type="text"
                placeholder="Tarif ara... (Örn: Menemen, Çorba)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 py-4 text-white placeholder-white/30 outline-none focus:border-emerald-500/50 focus:bg-white/10 transition-all shadow-inner"
              />
            </div>

            {/* Pantry Matcher */}
            {pantry.length > 0 && (
              <div className="flex items-center gap-3">
                {!matchMode ? (
                  <button
                    onClick={runPantryMatch}
                    className="flex-1 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 py-4 px-6 font-semibold text-white shadow-lg shadow-violet-500/20 transition-all hover:shadow-violet-500/30 hover:brightness-110 flex items-center justify-center gap-3"
                  >
                    <span className="text-xl">🧪</span>
                    <span>Evdeki {pantry.length} Malzemeyle Ne Yapabilirim?</span>
                  </button>
                ) : (
                  <div className="flex-1 flex items-center justify-between rounded-2xl border border-violet-500/30 bg-violet-500/10 py-3 px-5">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">✨</span>
                      <div>
                        <p className="text-sm font-semibold text-violet-300">Evdeki malzemelere göre sıralandı</p>
                        <p className="text-xs text-white/40">{pantry.map(p => p.ingredient).join(', ')}</p>
                      </div>
                    </div>
                    <button
                      onClick={clearMatch}
                      className="rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-xs text-white/50 hover:text-white/80 transition-colors"
                    >
                      ✕ Tüm Tarifleri Göster
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Extended Filters */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-white/5 pb-4">
              {/* Category filter */}
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      category === cat.value
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-white/5 text-white/50 border border-white/10 hover:border-white/20 hover:text-white/70'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Advanced Filters */}
              <div className="flex flex-wrap gap-2 sm:border-l sm:border-white/10 sm:pl-4">
                <button
                  onClick={() => setFastOnly(!fastOnly)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    fastOnly 
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-md shadow-amber-500/10' 
                      : 'bg-white/5 text-white/50 border border-white/10 hover:border-white/20 hover:text-white/70'
                  }`}
                >
                  ⏱ Maks 30 dk
                </button>
                <button
                  onClick={() => setVeganOnly(!veganOnly)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    veganOnly 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-md shadow-emerald-500/10' 
                      : 'bg-white/5 text-white/50 border border-white/10 hover:border-white/20 hover:text-white/70'
                  }`}
                >
                  🌱 Vegan/Vej.
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-center text-red-400">
                <p className="text-lg mb-1">⚠️</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
              </div>
            )}

            {/* Recipe grid */}
            {!loading && !error && (
              (() => {
                const filteredRecipes = recipes.filter(r => {
                  const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (r.tags && r.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
                  
                  const totalTime = (r.prepTimeMinutes || 0) + (r.cookTimeMinutes || 0);
                  const matchesFast = !fastOnly || totalTime <= 30;

                  const matchesVegan = !veganOnly || (r.tags && r.tags.some(t => t.toLowerCase() === 'vegan' || t.toLowerCase() === 'vejetaryen'));

                  return matchesSearch && matchesFast && matchesVegan;
                });

                return (
                  <>
                    <p className="text-sm text-white/30">
                      {filteredRecipes.length} tarif bulundu
                      {sensitivities.length > 0 && ' (filtrelenmiş)'}
                      {searchQuery && ` - "${searchQuery}" için arama sonuçları`}
                      {matchMode && ' — Eşleşme oranına göre sıralandı'}
                    </p>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredRecipes.map((recipe) => (
                        <RecipeCard
                          key={recipe._id || recipe.title}
                          recipe={recipe}
                          riskScore={recipe.riskScore || 0}
                          onSelect={setSelectedRecipe}
                          isFavorite={favorites.includes(recipe._id || recipe.title)}
                          onToggleFavorite={toggleFavorite}
                          matchScore={matchMode ? (recipe.matchScore || 0) : undefined}
                        />
                      ))}
                    </div>

                    {filteredRecipes.length === 0 && (
                      <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center">
                        <p className="text-5xl mb-4">🔍</p>
                        <p className="text-white/40 text-lg">Arama veya filtreyle eşleşen tarif bulunamadı.</p>
                      </div>
                    )}
                  </>
                );
              })()
            )}
          </div>
        )}

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">❤️ Favoriler</h2>
              <p className="text-white/50 text-sm">Kaydettiğiniz favori tarifler.</p>
            </div>
            
            {(() => {
              const favRecipes = recipes.filter(r => favorites.includes(r._id || r.title));
              return (
                <>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {favRecipes.map((recipe) => (
                      <RecipeCard
                        key={recipe._id || recipe.title}
                        recipe={recipe}
                        riskScore={recipe.riskScore || 0}
                        onSelect={setSelectedRecipe}
                        isFavorite={true}
                        onToggleFavorite={toggleFavorite}
                      />
                    ))}
                  </div>

                  {favRecipes.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center">
                      <p className="text-5xl mb-4">💔</p>
                      <p className="text-white/40 text-lg">Henüz hiç favori tarifiniz yok. Kalp butonuna basarak ekleyebilirsiniz.</p>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {/* Pantry Tab */}
        {activeTab === 'pantry' && (
          <HomePantry
            pantry={pantry}
            onUpdate={handlePantryUpdate}
          />
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <AllergyProfile
            sensitivities={sensitivities}
            onUpdate={handleSensitivitiesUpdate}
            userProfile={userProfile}
            onProfileUpdate={handleUserProfileUpdate}
            blacklist={blacklist}
            onBlacklistUpdate={handleBlacklistUpdate}
            equipment={equipment}
            onEquipmentUpdate={handleEquipmentUpdate}
          />
        )}

        {/* Add Recipe Tab */}
        {activeTab === 'add' && (
          <AddRecipe 
            onRecipeAdded={() => {
              fetchRecipes();
              setActiveTab('recipes');
            }} 
          />
        )}
      </main>

      {/* ─── Recipe Detail Modal ────────── */}
      {selectedRecipe && (
        <RecipeDetail
          recipe={selectedRecipe}
          riskScore={selectedRecipe.riskScore || 0}
          onClose={() => setSelectedRecipe(null)}
          pantry={pantry}
        />
      )}

      {aiResult && (
        <AiResultModal
          aiData={aiResult}
          onClose={() => setAiResult(null)}
          onViewRecipe={(recipe) => {
            setAiResult(null);
            setSelectedRecipe(recipe);
          }}
        />
      )}

      {/* ─── Footer ─────────────────────── */}
      <footer className="mt-16 border-t border-white/5 py-8 text-center text-xs text-white/20">
        SafeRecipe © 2026 — Güvenli beslenme, mutlu yaşam 🌿
      </footer>
    </div>
  );
}
