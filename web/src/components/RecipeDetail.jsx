import { useState, useMemo } from 'react';
import CookingMode from './CookingMode';

export default function RecipeDetail({ recipe, riskScore = 0, onClose, pantry = [] }) {
  const [servings, setServings] = useState(recipe.servings);
  const [copied, setCopied] = useState(false);
  const [isCooking, setIsCooking] = useState(false);
  const factor = servings / recipe.servings;

  // ─── Pure: Calculate missing ingredients ───
  const shoppingList = useMemo(() => {
    if (!Array.isArray(recipe.ingredients)) return [];
    const pantryMap = new Map();
    pantry.forEach((p) => {
      pantryMap.set(p.ingredient.toLowerCase(), {
        amount: p.amount,
        unit: p.unit,
      });
    });

    return recipe.ingredients.map((ing) => {
      const key = ing.name.toLowerCase();
      const needed = Math.round(ing.amount * factor * 100) / 100;
      const home = pantryMap.get(key);

      if (!home || home.unit !== ing.unit) {
        return {
          ingredient: ing.name,
          originalName: ing.originalName || null,
          needed,
          have: 0,
          toBuy: needed,
          unit: ing.unit,
          isPartial: false,
          atHome: false,
        };
      }

      const toBuy = Math.max(0, Math.round((needed - home.amount) * 100) / 100);
      return {
        ingredient: ing.name,
        originalName: ing.originalName || null,
        needed,
        have: Math.min(home.amount, needed),
        toBuy,
        unit: ing.unit,
        isPartial: toBuy > 0 && home.amount > 0,
        atHome: toBuy === 0,
      };
    });
  }, [recipe.ingredients, pantry, factor]);

  const itemsToBuy = shoppingList.filter((s) => !s.atHome);
  const itemsAtHome = shoppingList.filter((s) => s.atHome);

  function copyToClipboard() {
    let text = `*${recipe.title}*\n`;
    if (recipe.description) text += `${recipe.description}\n`;
    text += `\nPorsiyon: ${servings}\n`;
    text += `Hazırlık: ${recipe.prepTimeMinutes}dk, Pişirme: ${recipe.cookTimeMinutes}dk\n\n`;
    text += `*Malzemeler*\n`;
    recipe.ingredients?.forEach(ing => {
      let line = `- ${ing.name}`;
      if (ing.originalName) line += ` (yerine: ${ing.originalName})`;
      line += `: ${Math.round(ing.amount * factor * 100) / 100} ${ing.unit}\n`;
      text += line;
    });
    if (itemsToBuy.length > 0) {
      text += `\n*Alışveriş Listesi (Eksik Malzemeler)*\n`;
      itemsToBuy.forEach(item => {
        text += `- ${item.ingredient}: ${item.toBuy} ${item.unit}`;
        if (item.isPartial) text += ` (evde ${item.have} ${item.unit} var)`;
        if (item.originalName) text += ` [${item.originalName} yerine]`;
        text += `\n`;
      });
    }
    text += `\n*Hazırlanış*\n`;
    recipe.steps?.forEach((step, i) => {
      text += `${i + 1}. ${step}\n`;
    });

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => console.error("Kopyalama hatası:", err));
  }

  const riskColor =
    riskScore >= 80 ? 'text-red-400' : riskScore >= 40 ? 'text-amber-400' : 'text-emerald-400';
  const riskBg =
    riskScore >= 80 ? 'bg-red-500/10 border-red-500/20' : riskScore >= 40 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/20';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-gray-900/95 p-8 shadow-2xl backdrop-blur-md">
        {/* Actions (Copy & Close) */}
        <div className="absolute right-4 top-4 flex items-center gap-3">
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-sm font-medium text-white/70 transition-all hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/30"
          >
            {copied ? '✅ Kopyalandı' : '📤 Paylaş'}
          </button>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/40 transition-colors hover:bg-red-500/20 hover:text-red-400"
          >
            ✕
          </button>
        </div>

        {/* Header */}
        <div className="mb-6">
          {/* Badges & Warnings */}
          <div className="mb-3 flex flex-wrap gap-2">
            {recipe.badges?.map((badge, i) => (
              <span
                key={i}
                className="rounded-full bg-violet-500/20 px-3 py-1 text-xs font-semibold text-violet-300"
              >
                {badge}
              </span>
            ))}
            {recipe.missingEquipment?.length > 0 && (
              <span
                className="rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-400 border border-rose-500/30"
              >
                ⚠️ <strong>Eksik Aletler:</strong> {recipe.missingEquipment.join(', ')}
              </span>
            )}
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">{recipe.title}</h2>
          <p className="text-white/50">{recipe.description}</p>
        </div>

        {/* Meta & Risk */}
        <div className="mb-6 flex flex-wrap gap-3">
          <span className="rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm text-white/60">
            ⏱ Hazırlık: {recipe.prepTimeMinutes} dk
          </span>
          <span className="rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm text-white/60">
            🔥 Pişirme: {recipe.cookTimeMinutes} dk
          </span>
          <span className="rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-sm text-white/60 capitalize">
            📂 {recipe.category}
          </span>
          <span className={`rounded-xl border px-4 py-2 text-sm font-semibold ${riskBg} ${riskColor}`}>
            🛡️ Risk: {riskScore}
          </span>
        </div>

        {/* Serving slider */}
        <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-white/70">Porsiyon Sayısı</label>
            <span className="text-2xl font-bold text-emerald-400">{servings}</span>
          </div>
          <input
            type="range"
            min="1"
            max="20"
            value={servings}
            onChange={(e) => setServings(Number(e.target.value))}
            className="w-full accent-emerald-500"
          />
          <div className="flex justify-between text-xs text-white/30 mt-1">
            <span>1</span>
            <span>20</span>
          </div>
        </div>

        {/* Ingredients */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">🥘 Malzemeler</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {recipe.ingredients?.map((ing, i) => {
              const shopItem = shoppingList[i];
              return (
                <div
                  key={i}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-all ${
                    shopItem?.atHome
                      ? 'border-emerald-500/20 bg-emerald-500/5'
                      : 'border-white/5 bg-white/[0.03]'
                  }`}
                >
                  <span className="text-white/80 flex items-center gap-2">
                    {shopItem?.atHome && <span className="text-emerald-400 text-xs">🏠</span>}
                    {ing.name}
                    {ing.originalName && (
                      <span className="ml-1 text-xs text-amber-400">(yerine: {ing.originalName})</span>
                    )}
                  </span>
                  <span className="text-sm font-mono text-white/50">
                    {Math.round(ing.amount * factor * 100) / 100} {ing.unit}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Shopping List (Missing Ingredients) ───── */}
        <div className="mb-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
          <h3 className="text-lg font-semibold text-white mb-1">🛒 Alışveriş Listesi</h3>
          <p className="text-xs text-white/40 mb-4">
            Evdeki malzemeler düşüldükten sonra almanız gerekenler.
          </p>

          {itemsToBuy.length > 0 ? (
            <div className="space-y-2">
              {itemsToBuy.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-gray-900/50 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-amber-400">🛒</span>
                    <div>
                      <span className="text-white/90 font-medium">{item.ingredient}</span>
                      {item.originalName && (
                        <span className="ml-2 text-xs text-violet-400">({item.originalName} yerine)</span>
                      )}
                      {item.isPartial && (
                        <p className="text-xs text-amber-400/70 mt-0.5">
                          Evde {item.have} {item.unit} var, {item.toBuy} {item.unit} daha lazım
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-mono font-semibold text-amber-300">
                    {item.toBuy} {item.unit}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center">
              <p className="text-emerald-400 font-medium">🎉 Tüm malzemeler evde mevcut!</p>
              <p className="text-xs text-emerald-400/60 mt-1">Bu tarif için alışverişe gitmenize gerek yok.</p>
            </div>
          )}

          {itemsAtHome.length > 0 && itemsToBuy.length > 0 && (
            <div className="mt-4 pt-3 border-t border-white/5">
              <p className="text-xs text-emerald-400/60 mb-2">
                🏠 Evde bulunanlar ({itemsAtHome.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {itemsAtHome.map((item, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs text-emerald-400"
                  >
                    ✓ {item.ingredient}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Steps */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">📝 Hazırlanış</h3>
            <button
              onClick={() => setIsCooking(true)}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-500 hover:scale-105"
            >
              👨‍🍳 Hazırlamaya Başla
            </button>
          </div>
          <ol className="space-y-3">
            {recipe.steps?.map((step, i) => (
              <li key={i} className="flex gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">
                  {i + 1}
                </span>
                <p className="text-white/70 pt-0.5">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
      
      {/* Cooking Mode Overlay */}
      {isCooking && (
        <CookingMode 
          steps={recipe.steps} 
          title={recipe.title} 
          onClose={() => setIsCooking(false)} 
        />
      )}
    </div>
  );
}

