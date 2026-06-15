import { useState } from 'react';

export default function AiAssistant({ onSubmit, isLoading }) {
  const [input, setInput] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    // Split by comma and clean up
    const ingredients = input.split(',').map(i => i.trim()).filter(Boolean);
    if (ingredients.length > 0) {
      onSubmit(ingredients);
      setInput('');
    }
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-indigo-500/5 p-6 shadow-2xl shadow-indigo-500/10 backdrop-blur-md">
      {/* Decorative AI glowing orb */}
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-fuchsia-500/20 blur-3xl" />

      <div className="relative z-10 flex flex-col items-start gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-xl shadow-inner shadow-indigo-500/50">
            🤖
          </span>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">
              Yapay Zeka Mutfak Asistanı
            </h2>
            <p className="text-sm text-indigo-200/60">
              Evdeki malzemeleri aralarına virgül koyarak yazın, sizin için en iyi tarifi bulayım!
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col sm:flex-row gap-3 mt-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Örn: domates, yumurta, peynir, bayat ekmek..."
              className="w-full rounded-2xl border border-indigo-500/20 bg-indigo-950/40 px-5 py-4 text-indigo-100 placeholder:text-indigo-300/40 outline-none focus:border-indigo-400/50 focus:bg-indigo-950/60 transition-all shadow-inner"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="group relative overflow-hidden rounded-2xl bg-indigo-500 px-6 py-4 font-bold text-white shadow-lg shadow-indigo-500/30 transition-all hover:bg-indigo-400 hover:shadow-indigo-500/50 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin text-xl">⏳</span> Analiz ediliyor...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Bana Tarif Bul ✨
              </span>
            )}
            {/* Hover shine effect */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
          </button>
        </form>
      </div>
    </div>
  );
}
