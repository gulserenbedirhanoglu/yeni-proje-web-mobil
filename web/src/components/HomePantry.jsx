import { useState } from 'react';

const COMMON_UNITS = ['g', 'ml', 'adet', 'yemek kaşığı', 'çay kaşığı', 'su bardağı', 'kg', 'lt', 'demet', 'dilim', 'diş'];

const COMMON_INGREDIENTS = [
  'Zeytinyağı', 'Tuz', 'Karabiber', 'Şeker', 'Un', 'Pirinç', 'Makarna',
  'Süt', 'Badem Sütü', 'Yumurta', 'Tereyağı', 'Yoğurt', 'Beyaz Peynir',
  'Soğan', 'Sarımsak', 'Domates', 'Biber', 'Patates', 'Salça',
  'Pul Biber', 'Kırmızı Biber', 'Nane', 'Kekik', 'Maydanoz', 'Dereotu',
  'Limon', 'Sirke', 'Soya Sosu', 'Tavuk Göğsü', 'Kıyma',
  'Glutensiz Un', 'Pirinç Unu', 'Badem Unu', 'Nohut Unu',
  'Hindistan Cevizi Sütü', 'Soya Sütü', 'Yulaf Sütü',
];

export default function HomePantry({ pantry, onUpdate }) {
  const [ingredient, setIngredient] = useState('');
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState('g');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = COMMON_INGREDIENTS.filter(
    (a) =>
      a.toLowerCase().includes(ingredient.toLowerCase()) &&
      !pantry.some((p) => p.ingredient.toLowerCase() === a.toLowerCase())
  );

  function handleAdd() {
    if (!ingredient.trim() || !amount) return;
    const newItem = {
      ingredient: ingredient.trim(),
      amount: Number(amount),
      unit,
    };
    onUpdate([...pantry, newItem]);
    setIngredient('');
    setAmount('');
    setUnit('g');
  }

  function handleRemove(index) {
    onUpdate(pantry.filter((_, i) => i !== index));
  }

  function handleEdit(index) {
    const item = pantry[index];
    setIngredient(item.ingredient);
    setAmount(String(item.amount));
    setUnit(item.unit);
    handleRemove(index);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">🏠 Evdeki Malzemeler</h2>
        <p className="text-white/50 text-sm">
          Evinizde bulunan malzemeleri girin. Tarif detaylarında sadece eksik malzemeler görüntülenecek.
        </p>
      </div>

      {/* Add form */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md space-y-4">
        <h3 className="text-lg font-semibold text-white/80">Malzeme Ekle</h3>

        {/* Ingredient input */}
        <div className="relative">
          <label className="block text-sm text-white/50 mb-1">Malzeme Adı</label>
          <input
            type="text"
            value={ingredient}
            onChange={(e) => { setIngredient(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Ör: Zeytinyağı, Badem Sütü..."
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none transition-all focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
          />
          {showSuggestions && ingredient && filteredSuggestions.length > 0 && (
            <ul className="absolute z-20 mt-1 w-full rounded-xl border border-white/10 bg-gray-900/95 backdrop-blur-md max-h-40 overflow-y-auto">
              {filteredSuggestions.map((s) => (
                <li
                  key={s}
                  onMouseDown={() => { setIngredient(s); setShowSuggestions(false); }}
                  className="cursor-pointer px-4 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Amount & Unit */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/50 mb-1">Miktar</label>
            <input
              type="number"
              min="0"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="200"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none focus:border-emerald-500/50"
            />
          </div>
          <div>
            <label className="block text-sm text-white/50 mb-1">Birim</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-emerald-500/50"
            >
              {COMMON_UNITS.map((u) => (
                <option key={u} value={u} className="bg-gray-900">{u}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleAdd}
          disabled={!ingredient.trim() || !amount}
          className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:shadow-emerald-500/30 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          + Ekle
        </button>
      </div>

      {/* Pantry list */}
      {pantry.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white/80">
            Evdeki Malzemeler ({pantry.length})
          </h3>
          {pantry.map((p, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-md transition-all hover:border-white/20"
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">🏠</span>
                <div>
                  <p className="font-semibold text-white">{p.ingredient}</p>
                  <p className="text-xs text-white/50">
                    {p.amount} {p.unit}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(i)}
                  className="rounded-lg p-2 text-white/40 transition-colors hover:bg-emerald-500/20 hover:text-emerald-400"
                  title="Düzenle"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleRemove(i)}
                  className="rounded-lg p-2 text-white/30 transition-colors hover:bg-red-500/20 hover:text-red-400"
                  title="Sil"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {pantry.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/10 py-12 text-center">
          <p className="text-4xl mb-3">🧊</p>
          <p className="text-white/40">
            Henüz evdeki malzeme eklenmedi. Yukarıdan ekleyebilirsiniz.
          </p>
        </div>
      )}
    </div>
  );
}
