import { useState } from 'react';

const QUESTIONS = [
  {
    id: 'q1',
    text: 'Süt veya süt ürünleri tükettikten sonra şişkinlik, gaz veya karın ağrısı yaşıyor musunuz?',
    options: [
      { text: 'Evet, sık sık', value: 'high_dairy' },
      { text: 'Bazen', value: 'low_dairy' },
      { text: 'Hayır', value: 'none' }
    ]
  },
  {
    id: 'q2',
    text: 'Ekmek, makarna veya hamur işi yedikten sonra aşırı yorgunluk veya sindirim zorluğu hissediyor musunuz?',
    options: [
      { text: 'Evet, belirgin şekilde', value: 'high_gluten' },
      { text: 'Hafif bir ağırlık oluyor', value: 'low_gluten' },
      { text: 'Hayır, rahatım', value: 'none' }
    ]
  },
  {
    id: 'q3',
    text: 'Kuruyemiş (ceviz, fındık, fıstık vb.) yediğinizde kaşıntı, kızarıklık veya nefes darlığı gibi belirtiler olur mu?',
    options: [
      { text: 'Evet, ciddi tepki veriyorum', value: 'allergy_nuts' },
      { text: 'Hayır, sorun yaşamıyorum', value: 'none' }
    ]
  },
  {
    id: 'q4',
    text: 'Yumurta yediğinizde mide bulantısı veya ciltte döküntü fark ettiniz mi?',
    options: [
      { text: 'Evet', value: 'intol_egg' },
      { text: 'Hayır', value: 'none' }
    ]
  }
];

export default function SensitivityQuiz({ onClose, onComplete }) {
  const [step, setStep] = useState('intro'); // intro -> profile -> quiz -> results
  const [profile, setProfile] = useState({ name: '', age: '', weight: '', height: '' });
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState([]);
  const [selectedResults, setSelectedResults] = useState([]);

  function handleProfileChange(e) {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  }

  function handleAnswer(questionId, value) {
    setAnswers({ ...answers, [questionId]: value });
  }

  function calculateResults() {
    const findings = [];
    
    // Süt
    if (answers['q1'] === 'high_dairy') findings.push({ ingredient: 'Süt', type: 'intolerance', severity: 'high' });
    else if (answers['q1'] === 'low_dairy') findings.push({ ingredient: 'Süt', type: 'intolerance', severity: 'low' });

    // Gluten/Buğday
    if (answers['q2'] === 'high_gluten') findings.push({ ingredient: 'Gluten', type: 'intolerance', severity: 'high' });
    else if (answers['q2'] === 'low_gluten') findings.push({ ingredient: 'Gluten', type: 'intolerance', severity: 'low' });

    // Kuruyemiş
    if (answers['q3'] === 'allergy_nuts') {
      findings.push({ ingredient: 'Ceviz', type: 'allergy', severity: 'high' });
      findings.push({ ingredient: 'Fındık', type: 'allergy', severity: 'high' });
      findings.push({ ingredient: 'Yer Fıstığı', type: 'allergy', severity: 'high' });
    }

    // Yumurta
    if (answers['q4'] === 'intol_egg') findings.push({ ingredient: 'Yumurta', type: 'intolerance', severity: 'medium' });

    setResults(findings);
    setSelectedResults(findings); // Default all selected
    setStep('results');
  }

  function toggleResult(index) {
    if (selectedResults.includes(results[index])) {
      setSelectedResults(selectedResults.filter(r => r !== results[index]));
    } else {
      setSelectedResults([...selectedResults, results[index]]);
    }
  }

  function handleFinish() {
    onComplete(selectedResults, profile);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative z-10 w-full max-w-lg overflow-y-auto rounded-3xl border border-white/10 bg-gray-900/95 p-8 shadow-2xl backdrop-blur-md">
        <button onClick={onClose} className="absolute right-4 top-4 text-white/40 hover:text-white">✕</button>

        {step === 'intro' && (
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold text-white">🧪 Hassasiyet Testi</h2>
            <p className="text-white/60">
              Vücudunuzun hangi besinlere tepki verdiğini anlamak için kısa bir test çözelim.
            </p>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-sm text-amber-400 text-left">
              <strong>⚠️ Uyarı:</strong> Bu testin sonuçları sadece tahmine dayalıdır ve tıbbi bir teşhis yerine geçmez. Ciddi bir alerjiniz varsa mutlaka bir doktora danışın.
            </div>
            <button onClick={() => setStep('profile')} className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-500 transition-colors">
              Başla
            </button>
          </div>
        )}

        {step === 'profile' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white text-center">👤 Seni Tanıyalım</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/50 mb-1">Adın</label>
                <input type="text" name="name" value={profile.name} onChange={handleProfileChange} className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-white outline-none focus:border-emerald-500" placeholder="Ör: Ayşe" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-white/50 mb-1">Yaş</label>
                  <input type="number" name="age" value={profile.age} onChange={handleProfileChange} className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-white outline-none focus:border-emerald-500" placeholder="25" />
                </div>
                <div>
                  <label className="block text-sm text-white/50 mb-1">Boy (cm)</label>
                  <input type="number" name="height" value={profile.height} onChange={handleProfileChange} className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-white outline-none focus:border-emerald-500" placeholder="165" />
                </div>
                <div>
                  <label className="block text-sm text-white/50 mb-1">Kilo (kg)</label>
                  <input type="number" name="weight" value={profile.weight} onChange={handleProfileChange} className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2 text-white outline-none focus:border-emerald-500" placeholder="60" />
                </div>
              </div>
            </div>
            <button 
              onClick={() => setStep('quiz')} 
              disabled={!profile.name}
              className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-500 transition-colors disabled:opacity-50"
            >
              İleri
            </button>
          </div>
        )}

        {step === 'quiz' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-4">Soru {Object.keys(answers).length + 1} / {QUESTIONS.length}</h2>
            
            {QUESTIONS.map((q, i) => {
              if (Object.keys(answers).length !== i) return null; // Show one by one
              return (
                <div key={q.id} className="space-y-4 animate-fadeIn">
                  <p className="text-lg text-white/90">{q.text}</p>
                  <div className="space-y-2">
                    {q.options.map((opt, j) => (
                      <button
                        key={j}
                        onClick={() => {
                          handleAnswer(q.id, opt.value);
                          if (i === QUESTIONS.length - 1) calculateResults();
                        }}
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-left text-white/80 hover:bg-white/10 transition-colors"
                      >
                        {opt.text}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {step === 'results' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white">Sonuçlar Hazır, {profile.name}!</h2>
              <p className="text-white/60 mt-2">Verdiğin cevaplara göre profiline eklemeni önerdiğimiz hassasiyetler şunlar:</p>
            </div>

            {results.length > 0 ? (
              <div className="space-y-3">
                {results.map((r, i) => {
                  const isSelected = selectedResults.includes(r);
                  return (
                    <div 
                      key={i} 
                      onClick={() => toggleResult(i)}
                      className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${isSelected ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-white/10 bg-white/5'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${isSelected ? 'border-emerald-400 bg-emerald-500' : 'border-white/30'}`}>
                          {isSelected && <span className="text-white text-xs">✓</span>}
                        </div>
                        <div>
                          <p className="text-white font-medium">{r.ingredient}</p>
                          <p className="text-xs text-white/50">{r.type === 'allergy' ? '🚨 Alerji' : '⚠️ İntolerans'} • {r.severity}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center">
                <span className="text-4xl mb-2 block">🎉</span>
                <p className="text-emerald-400">Harika! Belirgin bir gıda hassasiyetin görünmüyor.</p>
              </div>
            )}

            <button 
              onClick={handleFinish} 
              className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-500 transition-colors"
            >
              {selectedResults.length > 0 ? `Seçilenleri Profile Ekle (${selectedResults.length})` : 'Testi Bitir'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
