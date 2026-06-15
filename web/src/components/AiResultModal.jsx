export default function AiResultModal({ aiData, onClose, onViewRecipe }) {
  if (!aiData) return null;

  const { recipe, aiMessage } = aiData;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl border border-indigo-500/20 bg-gray-900 shadow-2xl shadow-indigo-500/10 animate-in zoom-in-95 duration-300">
        
        {/* Top glowing bar */}
        <div className="h-2 w-full bg-gradient-to-r from-fuchsia-500 via-indigo-500 to-cyan-500" />
        
        <div className="p-6 sm:p-10">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500/10 text-3xl shadow-inner shadow-indigo-500/20">
                🤖
              </div>
              <h2 className="text-2xl font-bold text-white">Yapay Zeka Asistanı</h2>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/40 transition-colors hover:bg-red-500/20 hover:text-red-400"
            >
              ✕
            </button>
          </div>

          {/* AI Message Bubble */}
          <div className="relative mb-8 rounded-2xl rounded-tl-none bg-indigo-950/50 p-6 border border-indigo-500/20">
            <p className="text-lg leading-relaxed text-indigo-50">
              {aiMessage}
            </p>
          </div>

          {/* Suggested Recipe Card */}
          {recipe && (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 hover:bg-emerald-500/10 transition-colors cursor-pointer" onClick={() => onViewRecipe(recipe)}>
              <div className="flex items-center justify-between mb-2">
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400">
                  ✨ Önerilen Tarif
                </span>
                <span className="text-sm text-emerald-400/60">
                  {recipe.prepTimeMinutes + recipe.cookTimeMinutes} dk • {recipe.servings} Porsiyon
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{recipe.title}</h3>
              <p className="text-sm text-white/50 line-clamp-2">{recipe.description}</p>
              
              <div className="mt-4 flex justify-end">
                <button className="text-sm font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                  Tarifi Görüntüle →
                </button>
              </div>
            </div>
          )}
          
          <div className="mt-8 flex justify-center">
            <button
              onClick={onClose}
              className="rounded-xl border border-white/10 px-8 py-3 font-semibold text-white/70 hover:bg-white/5 hover:text-white transition-colors"
            >
              Tamam
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
