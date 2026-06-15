import { useState, useRef } from 'react';
import SensitivityQuiz from './SensitivityQuiz';

const SEVERITY_OPTIONS = [
  { value: 'low', label: 'Düşük', color: 'text-emerald-400' },
  { value: 'medium', label: 'Orta', color: 'text-amber-400' },
  { value: 'high', label: 'Yüksek', color: 'text-orange-400' },
  { value: 'fatal', label: 'Ölümcül', color: 'text-red-400' },
];

const COMMON_ALLERGENS = [
  'Yumurta', 'Süt', 'Yoğurt', 'Tereyağı', 'Beyaz Peynir',
  'Un', 'Buğday', 'Buğday Unu', 'İnce Bulgur', 'Gluten', 'Ceviz', 'Antep Fıstığı',
  'Fındık', 'Yer Fıstığı', 'Soya', 'Karides', 'Balık', 'Yumurta Sarısı', 'Yumurta Akı',
  'Yufka', 'Nişasta', 'Mısır', 'Susam', 'Bal', 'Kırmızı Et', 'Kıyma', 'Soya Sosu'
];

// ─── Otomatik alternatif haritası ───────────
const ALTERNATIVE_MAP = {
  // Süt ve Süt Ürünleri
  'süt':            ['Badem Sütü', 'Yulaf Sütü', 'Hindistan Cevizi Sütü', 'Pirinç Sütü', 'Soya Sütü'],
  'yoğurt':         ['Hindistan Cevizi Yoğurdu', 'Soya Yoğurdu', 'Badem Yoğurdu', 'Kaju Yoğurdu'],
  'tereyağı':       ['Zeytinyağı', 'Hindistan Cevizi Yağı', 'Avokado Yağı', 'Margarin (Bitkisel)'],
  'beyaz peynir':   ['Tofu', 'Vegan Peynir', 'Lor Peyniri (Keçi)', 'Kaju Peyniri'],
  
  // Yumurta
  'yumurta':        ['Keten Tohumu Jeli (Flax Egg)', 'Chia Jeli', 'Muz Püresi', 'Elma Püresi', 'Aquafaba (Nohut Suyu)'],
  'yumurta sarısı': ['Keten Tohumu Jeli', 'Chia Jeli'],
  'yumurta akı':    ['Aquafaba (Nohut Suyu)'],
  
  // Gluten / Buğday Tahıllar
  'un':             ['Glutensiz Un', 'Pirinç Unu', 'Badem Unu', 'Karabuğday Unu', 'Yulaf Unu', 'Nohut Unu'],
  'buğday':         ['Glutensiz Un', 'Pirinç Unu', 'Badem Unu', 'Karabuğday Unu', 'Yulaf Unu', 'Nohut Unu'],
  'buğday unu':     ['Glutensiz Un', 'Pirinç Unu', 'Badem Unu', 'Karabuğday Unu', 'Yulaf Unu', 'Nohut Unu'],
  'ince bulgur':    ['Kinoa', 'Karabuğday', 'Kuskus (Glutensiz)', 'Pirinç'],
  'gluten':         ['Glutensiz Un', 'Pirinç Unu', 'Mısır Unu', 'Karabuğday Unu'],
  'yufka':          ['Pirinç Kağıdı', 'Glutensiz Yufka', 'Mısır Tortillası'],
  
  // Kuruyemiş & Tohumlar
  'ceviz':          ['Ay Çekirdeği', 'Kabak Çekirdeği', 'Susam', 'Kavrulmuş Nohut'],
  'antep fıstığı':  ['Ay Çekirdeği', 'Kabak Çekirdeği', 'Kaju'],
  'fındık':         ['Ay Çekirdeği', 'Kabak Çekirdeği', 'Susam'],
  'yer fıstığı':    ['Ay Çekirdeği Ezmesi', 'Kavrulmuş Nohut', 'Tahin (Susam Ezmesi)'],
  'susam':          ['Ay Çekirdeği', 'Keten Tohumu', 'Haşhaş Tohumu'],
  
  // Diğer Büyük Alerjenler (Soya, Deniz Ürünleri, Mısır)
  'soya':           ['Nohut', 'Bezelye Proteini', 'Mercimek'],
  'soya sosu':      ['Hindistan Cevizi Aminosu (Coconut Aminos)'],
  'karides':        ['İstiridye Mantarı', 'Enginar', 'Kalp Palmiyesi (Palmito)'],
  'balık':          ['Tofu', 'Mantar', 'Patlıcan (Marine edilmiş)'],
  'mısır':          ['Nohut', 'Bezelye'],
  'mısır nişastası':['Patates Nişastası', 'Ararot Tozu', 'Tapyoka Nişastası'],
  'nişasta':        ['Patates Nişastası', 'Ararot Tozu', 'Tapyoka Nişastası'],
  
  // Et / Vegan Tercihler / Tatlandırıcılar
  'kırmızı et':     ['Mantar', 'Mercimek', 'Nohut', 'Soya Kıyması', 'Tofu'],
  'kıyma':          ['Mantar', 'Yeşil Mercimek', 'Soya Kıyması', 'İnce Çekilmiş Ceviz'],
  'bal':            ['Akçaağaç Şurubu', 'Agave Şurubu', 'Pekmez', 'Hurma Özü']
};

function getAlternatives(ingredient) {
  const key = ingredient.toLowerCase().trim();
  return ALTERNATIVE_MAP[key] || [];
}

const KITCHEN_EQUIPMENT = [
  'Ocak', 'Fırın', 'Mikrodalga', 'Airfryer', 'Blender', 'Mikser', 'Mutfak Robotu',
  'Tava', 'Tencere', 'Düdüklü Tencere', 'Kek Kalıbı', 'Rende', 'Tost Makinesi',
  'Waffle Makinesi', 'Ekmek Kızartma Makinesi', 'Cezve', 'Izgara', 'Süzgeç'
];

export default function AllergyProfile({ 
  sensitivities, 
  onUpdate, 
  userProfile, 
  onProfileUpdate,
  blacklist = [],
  onBlacklistUpdate,
  equipment = [],
  onEquipmentUpdate
}) {
  const [ingredient, setIngredient] = useState('');
  const [type, setType] = useState('allergy');
  const [severity, setSeverity] = useState('medium');
  const [selectedAlt, setSelectedAlt] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  
  const [isEditingProfile, setIsEditingProfile] = useState(!userProfile?.name);
  const [tempProfile, setTempProfile] = useState({
    name: userProfile?.name || '',
    age: userProfile?.age || '',
    height: userProfile?.height || '',
    weight: userProfile?.weight || '',
    avatar: userProfile?.avatar || '',
  });

  const fileInputRef = useRef(null);

  const [geminiApiKey, setGeminiApiKey] = useState(localStorage.getItem('saferecipe_gemini_key') || '');

  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      // Compress the image before saving
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 256;
        const MAX_HEIGHT = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with lower quality to save space
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setTempProfile({ ...tempProfile, avatar: compressedDataUrl });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  const alternatives = getAlternatives(ingredient);

  const filteredSuggestions = COMMON_ALLERGENS.filter(
    (a) =>
      a.toLowerCase().includes(ingredient.toLowerCase()) &&
      !sensitivities.some((s) => s.ingredient.toLowerCase() === a.toLowerCase())
  );

  function handleIngredientChange(value) {
    setIngredient(value);
    setSelectedAlt('');
    setShowSuggestions(true);
  }

  const [blacklistInput, setBlacklistInput] = useState('');

  function handleBlacklistAdd(e) {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      const val = blacklistInput.trim().toLowerCase();
      if (val && !blacklist.includes(val)) {
        onBlacklistUpdate([...blacklist, val]);
      }
      setBlacklistInput('');
    }
  }

  function handleBlacklistRemove(itemToRemove) {
    onBlacklistUpdate(blacklist.filter(item => item !== itemToRemove));
  }

  function handleEquipmentToggle(eq) {
    if (equipment.includes(eq)) {
      onEquipmentUpdate(equipment.filter(e => e !== eq));
    } else {
      onEquipmentUpdate([...equipment, eq]);
    }
  }

  function handleAdd() {
    if (!ingredient.trim()) return;
    const alts = getAlternatives(ingredient);
    const newSens = {
      ingredient: ingredient.trim(),
      type,
      severity,
      safeAlternatives: type === 'intolerance' && selectedAlt
        ? [selectedAlt]
        : type === 'intolerance' && alts.length > 0
          ? [alts[0]]
          : [],
    };
    onUpdate([...sensitivities, newSens]);
    setIngredient('');
    setSelectedAlt('');
    setSeverity('medium');
    setType('allergy');
  }

  function handleRemove(index) {
    onUpdate(sensitivities.filter((_, i) => i !== index));
  }

  function handleEdit(index) {
    const item = sensitivities[index];
    setIngredient(item.ingredient);
    setType(item.type);
    setSeverity(item.severity);
    if (item.safeAlternatives && item.safeAlternatives.length > 0) {
      setSelectedAlt(item.safeAlternatives[0]);
    } else {
      setSelectedAlt('');
    }
    handleRemove(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleQuizComplete(findings, profileData) {
    if (findings && findings.length > 0) {
      // Create valid sensitivity objects from findings
      const newItems = findings.map(f => {
        const alts = getAlternatives(f.ingredient);
        return {
          ingredient: f.ingredient,
          type: f.type,
          severity: f.severity,
          safeAlternatives: f.type === 'intolerance' && alts.length > 0 ? [alts[0]] : []
        };
      });
      onUpdate([...sensitivities, ...newItems]);
    }
    if (profileData && profileData.name) {
      onProfileUpdate(profileData);
    }
    setIsQuizOpen(false);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">🎛️ Sağlık ve Mutfak Kontrol Merkezi</h2>
          <p className="text-white/50 text-sm">
            Hassasiyetleriniz, kara listeniz ve evinizdeki aletlere göre tarifleriniz filtrelenir.
          </p>
        </div>
        <button
          onClick={() => setIsQuizOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-violet-600/20 border border-violet-500/30 px-4 py-2 text-sm font-medium text-violet-300 hover:bg-violet-600/30 hover:text-white transition-all shadow-sm"
        >
          <span>🤔 Neye hassasiyetim olabilir?</span>
          <span className="font-bold underline decoration-violet-400 underline-offset-2">Testi Çöz</span>
        </button>
      </div>

      {/* External API Key Section */}
      <div className="rounded-2xl border border-slate-500/20 bg-slate-500/5 p-6 backdrop-blur-md space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-300 flex items-center gap-2">
            <span>⚙️</span> Gelişmiş Tarif Motoru Yapılandırması
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Daha kapsamlı ve dinamik sonuçlar almak için bulut sağlayıcısı yapılandırmanızı (API Anahtarı) buradan tanımlayabilirsiniz. Anahtar tanımlanmadığında sistem yerel veritabanı ile standart modda çalışmaya devam edecektir.
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="password"
            value={geminiApiKey}
            onChange={(e) => setGeminiApiKey(e.target.value)}
            placeholder="Anahtarınızı buraya girin..."
            className="flex-1 rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-white outline-none focus:border-slate-500 transition-colors"
          />
          <button
            onClick={() => {
              localStorage.setItem('saferecipe_gemini_key', geminiApiKey);
              alert('Yapılandırma başarıyla kaydedildi!');
            }}
            className="rounded-xl bg-slate-600 px-6 py-2 text-sm font-medium text-white hover:bg-slate-500 transition-colors"
          >
            Kaydet
          </button>
        </div>
      </div>

      {/* User Profile Form / Card */}
      {isEditingProfile ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 backdrop-blur-md space-y-6">
          <h3 className="text-lg font-semibold text-emerald-400">👤 Kişisel Bilgileriniz</h3>
          
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-3">
              <div 
                className="relative flex h-24 w-24 overflow-hidden rounded-full border-2 border-dashed border-white/20 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors group"
                onClick={() => fileInputRef.current?.click()}
              >
                {tempProfile.avatar ? (
                  <img src={tempProfile.avatar} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center text-white/40">
                    <span className="text-2xl">📷</span>
                    <span className="text-[10px] mt-1 text-center leading-tight">Fotoğraf<br/>Ekle</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs font-semibold">Değiştir</span>
                </div>
              </div>
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                onChange={handleAvatarChange} 
                className="hidden" 
              />
            </div>

            {/* User Info Fields */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-white/50 mb-1">Adınız</label>
              <input
                type="text"
                value={tempProfile.name}
                onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-white outline-none focus:border-emerald-500"
                placeholder="Ör: Ayşe"
              />
            </div>
            <div>
              <label className="block text-sm text-white/50 mb-1">Yaş</label>
              <input
                type="number"
                value={tempProfile.age}
                onChange={(e) => setTempProfile({ ...tempProfile, age: e.target.value })}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-white outline-none focus:border-emerald-500"
                placeholder="25"
              />
            </div>
            <div>
              <label className="block text-sm text-white/50 mb-1">Boy (cm)</label>
              <input
                type="number"
                value={tempProfile.height}
                onChange={(e) => setTempProfile({ ...tempProfile, height: e.target.value })}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-white outline-none focus:border-emerald-500"
                placeholder="165"
              />
            </div>
            <div>
              <label className="block text-sm text-white/50 mb-1">Kilo (kg)</label>
              <input
                type="number"
                value={tempProfile.weight}
                onChange={(e) => setTempProfile({ ...tempProfile, weight: e.target.value })}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-white outline-none focus:border-emerald-500"
                placeholder="60"
              />
            </div>
          </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-2">
            {userProfile?.name && (
              <button
                onClick={() => setIsEditingProfile(false)}
                className="rounded-xl border border-white/10 px-5 py-2 text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white transition-colors"
              >
                İptal
              </button>
            )}
            <button
              disabled={!tempProfile.name.trim()}
              onClick={() => {
                onProfileUpdate(tempProfile);
                setIsEditingProfile(false);
              }}
              className="rounded-xl bg-emerald-600 px-6 py-2 text-sm font-medium text-white hover:bg-emerald-500 transition-colors disabled:opacity-50"
            >
              Kaydet
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 p-5 group">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-emerald-500/20 border-2 border-emerald-500/30">
              {userProfile.avatar ? (
                <img src={userProfile.avatar} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-emerald-400">{userProfile.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Merhaba, {userProfile.name}! 👋</h3>
              <p className="text-sm text-emerald-400/80">
                {userProfile.age && `${userProfile.age} yaş`}
                {userProfile.height && ` • ${userProfile.height} cm`}
                {userProfile.weight && ` • ${userProfile.weight} kg`}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsEditingProfile(true)}
            className="text-white/30 hover:text-emerald-400 transition-colors p-2 rounded-lg hover:bg-white/5 opacity-0 group-hover:opacity-100"
            title="Bilgilerimi Düzenle"
          >
            ✏️
          </button>
        </div>
      )}

      {/* Add form */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md space-y-4">
        <h3 className="text-lg font-semibold text-white/80">Yeni Hassasiyet Ekle</h3>

        {/* Ingredient input with autocomplete */}
        <div className="relative">
          <label className="block text-sm text-white/50 mb-1">Malzeme</label>
          <input
            type="text"
            value={ingredient}
            onChange={(e) => handleIngredientChange(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Ör: Süt, Gluten, Ceviz..."
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 outline-none transition-all focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
          />
          {showSuggestions && ingredient && filteredSuggestions.length > 0 && (
            <ul className="absolute z-20 mt-1 w-full rounded-xl border border-white/10 bg-gray-900/95 backdrop-blur-md max-h-40 overflow-y-auto">
              {filteredSuggestions.map((s) => (
                <li
                  key={s}
                  onMouseDown={() => {
                    handleIngredientChange(s);
                    setShowSuggestions(false);
                  }}
                  className="cursor-pointer px-4 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Type & Severity */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/50 mb-1">Tür</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-emerald-500/50"
            >
              <option value="allergy" className="bg-gray-900">🚨 Şiddetli (Tarifi Tamamen Gizle)</option>
              <option value="intolerance" className="bg-gray-900">⚠️ Hafif (Sadece Alternatif Göster)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-white/50 mb-1">Şiddet</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-emerald-500/50"
            >
              {SEVERITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-gray-900">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Auto-suggested alternatives (only for intolerance) */}
        {type === 'intolerance' && alternatives.length > 0 && (
          <div>
            <label className="block text-sm text-white/50 mb-2">
              🔄 Önerilen Alternatifler
            </label>
            <div className="flex flex-wrap gap-2">
              {alternatives.map((alt) => (
                <button
                  key={alt}
                  type="button"
                  onClick={() => setSelectedAlt(alt)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    selectedAlt === alt
                      ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 shadow-md shadow-emerald-500/10'
                      : 'bg-white/5 text-white/60 border border-white/10 hover:border-white/20 hover:text-white/80'
                  }`}
                >
                  {selectedAlt === alt && '✓ '}{alt}
                </button>
              ))}
            </div>
            {selectedAlt && (
              <p className="mt-2 text-xs text-emerald-400/70">
                ✨ <strong>{ingredient}</strong> yerine <strong>{selectedAlt}</strong> kullanılacak
              </p>
            )}
          </div>
        )}

        {type === 'intolerance' && alternatives.length === 0 && ingredient.trim() && (
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3">
            <p className="text-sm text-amber-400/80">
              ⚠️ Bu malzeme için hazır alternatif bulunamadı. Yine de intolerans olarak ekleyebilirsiniz.
            </p>
          </div>
        )}

        {type === 'allergy' && ingredient.trim() && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3">
            <p className="text-sm text-red-400/80">
              🚨 Şiddetli modunda bu malzemeyi içeren tarifler tamamen gizlenecek.
            </p>
          </div>
        )}

        <button
          onClick={handleAdd}
          disabled={!ingredient.trim()}
          className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:shadow-emerald-500/30 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          + Ekle
        </button>
      </div>

      {/* Current sensitivities list */}
      {sensitivities.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-white/80">
            Mevcut Hassasiyetler ({sensitivities.length})
          </h3>
          {sensitivities.map((s, i) => {
            const sevInfo = SEVERITY_OPTIONS.find((o) => o.value === s.severity);
            return (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-md transition-all hover:border-white/20"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">
                    {s.type === 'allergy' ? '🚨' : '⚠️'}
                  </span>
                  <div>
                    <p className="font-semibold text-white">{s.ingredient}</p>
                    <div className="flex gap-3 text-xs text-white/50">
                      <span>{s.type === 'allergy' ? 'Alerji' : 'İntolerans'}</span>
                      <span className={sevInfo?.color}>{sevInfo?.label}</span>
                      {s.safeAlternatives?.length > 0 && (
                        <span className="text-violet-400">
                          → {s.safeAlternatives[0]}
                        </span>
                      )}
                    </div>
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
            );
          })}
        </div>
      )}

      {sensitivities.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/10 py-12 text-center">
          <p className="text-4xl mb-3">🌿</p>
          <p className="text-white/40">
            Henüz hassasiyet eklenmedi. Yukarıdan ekleyebilirsiniz.
          </p>
        </div>
      )}

      {/* Blacklist Section */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-white/80">🚫 Sevmediğim Malzemeler (Kara Liste)</h3>
          <p className="text-sm text-white/50">Bu listeye eklediğiniz malzemeleri içeren tarifler hiçbir zaman gösterilmez.</p>
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={blacklistInput}
            onChange={(e) => setBlacklistInput(e.target.value)}
            onKeyDown={handleBlacklistAdd}
            placeholder="Ör: Kereviz, Mantar..."
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white outline-none focus:border-red-500/50"
          />
          <button
            onClick={handleBlacklistAdd}
            disabled={!blacklistInput.trim()}
            className="rounded-xl bg-red-600/80 px-4 py-2 text-white hover:bg-red-500 transition-colors disabled:opacity-50"
          >
            Ekle
          </button>
        </div>

        {blacklist.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {blacklist.map((item, idx) => (
              <span key={idx} className="flex items-center gap-2 rounded-full bg-red-500/10 border border-red-500/20 px-3 py-1 text-sm text-red-300">
                {item}
                <button onClick={() => handleBlacklistRemove(item)} className="hover:text-red-100">&times;</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Equipment Section */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-white/80">🍳 Evimdeki Aletler</h3>
          <p className="text-sm text-white/50">Sahip olduğunuz mutfak ekipmanlarını seçin. Eksik ekipman gerektiren tariflerde uyarı alırsınız.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {KITCHEN_EQUIPMENT.map((eq) => {
            const hasEq = equipment.includes(eq);
            return (
              <button
                key={eq}
                onClick={() => handleEquipmentToggle(eq)}
                className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-medium transition-all ${
                  hasEq
                    ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300 shadow-sm shadow-emerald-500/10'
                    : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                <div className={`flex h-4 w-4 items-center justify-center rounded border ${hasEq ? 'border-emerald-400 bg-emerald-500' : 'border-white/30'}`}>
                  {hasEq && <span className="text-[10px] text-white">✓</span>}
                </div>
                {eq}
              </button>
            )
          })}
        </div>
      </div>

      {isQuizOpen && (
        <SensitivityQuiz 
          onClose={() => setIsQuizOpen(false)} 
          onComplete={handleQuizComplete} 
        />
      )}
    </div>
  );
}
