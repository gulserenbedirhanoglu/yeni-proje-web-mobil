import { useState } from 'react';

/**
 * RecipeCard – Compact card for recipe listings.
 */
export default function RecipeCard({ recipe, riskScore = 0, onSelect, isFavorite, onToggleFavorite, matchScore }) {
  const riskColor =
    riskScore >= 80
      ? 'bg-red-500'
      : riskScore >= 40
        ? 'bg-amber-500'
        : 'bg-emerald-500';

  const riskLabel =
    riskScore >= 80
      ? 'Yüksek Risk'
      : riskScore >= 40
        ? 'Orta Risk'
        : 'Güvenli';

  const categoryEmoji = {
    breakfast: '🌅',
    lunch: '🍽️',
    dinner: '🌙',
    snack: '🥨',
    dessert: '🍰',
    beverage: '🥤',
  };

  const matchColor =
    matchScore >= 80
      ? 'from-emerald-500 to-teal-500'
      : matchScore >= 50
        ? 'from-amber-500 to-orange-500'
        : matchScore > 0
          ? 'from-rose-500 to-pink-500'
          : '';

  return (
    <div
      onClick={() => onSelect(recipe)}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1 cursor-pointer"
    >
      {/* Top color bar */}
      <div className={`h-1 w-full ${riskColor}`} />

      {/* Match score badge (floating) */}
      {matchScore > 0 && (
        <div className={`absolute top-3 right-3 z-10 rounded-full bg-gradient-to-r ${matchColor} px-3 py-1.5 shadow-lg`}>
          <span className="text-xs font-bold text-white">%{matchScore}</span>
        </div>
      )}

      <div className="flex flex-col flex-1 p-6">
        {/* Risk badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/40">
              {categoryEmoji[recipe.category] || '📂'} {recipe.category}
            </span>
            {onToggleFavorite && (
              <button 
                onClick={(e) => { e.stopPropagation(); onToggleFavorite(recipe); }}
                className="text-lg hover:scale-110 transition-transform"
                title={isFavorite ? "Favorilerden Çıkar" : "Favorilere Ekle"}
              >
                {isFavorite ? '❤️' : '🤍'}
              </button>
            )}
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold text-white ${riskColor}`}
          >
            {riskLabel} {riskScore}
          </span>
        </div>

        {/* Badges & Warnings */}
        <div className="mb-3 flex flex-wrap gap-2">
          {recipe.badges?.map((badge, i) => (
            <span
              key={i}
              className="rounded-full bg-violet-500/20 px-2.5 py-0.5 text-xs font-medium text-violet-300"
            >
              {badge}
            </span>
          ))}
          {recipe.missingEquipment?.length > 0 && (
            <span
              className="rounded-full bg-rose-500/20 px-2.5 py-0.5 text-xs font-medium text-rose-300 border border-rose-500/30"
              title={`Eksik: ${recipe.missingEquipment.join(', ')}`}
            >
              ⚠️ Eksik Alet
            </span>
          )}
        </div>

        {/* Title & description */}
        <h3 className="mb-1 text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
          {recipe.title}
        </h3>
        <p className="mb-4 text-sm text-white/50 line-clamp-2 flex-1">{recipe.description}</p>

        {/* Meta */}
        <div className="flex gap-3 text-xs text-white/40">
          <span>🍽 {recipe.servings} porsiyon</span>
          <span>⏱ {(recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0)} dk</span>
          <span>🥘 {recipe.ingredients?.length || 0} malzeme</span>
        </div>
      </div>
    </div>
  );
}
