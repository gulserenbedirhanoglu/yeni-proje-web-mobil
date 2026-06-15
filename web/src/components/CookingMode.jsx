import { useState, useEffect } from 'react';

export default function CookingMode({ steps, title, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  const totalSteps = steps.length;
  const progress = ((currentStep) / totalSteps) * 100;

  useEffect(() => {
    // Prevent scrolling behind the full-screen modal
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  function handleNext() {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(c => c + 1);
    } else {
      setCompleted(true);
    }
  }

  function handlePrev() {
    if (currentStep > 0) {
      setCurrentStep(c => c - 1);
      setCompleted(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-gray-950 p-4 sm:p-8 animate-in fade-in duration-300">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-white/80 max-w-xl truncate">
          👨‍🍳 {title}
        </h2>
        <button
          onClick={onClose}
          className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-red-500/20 hover:text-red-400 transition-colors"
        >
          Kapat ✕
        </button>
      </div>

      {/* Progress Bar */}
      {!completed && (
        <div className="w-full max-w-4xl mx-auto mb-12">
          <div className="flex justify-between text-sm text-emerald-400/80 mb-2 font-medium">
            <span>Adım {currentStep + 1}</span>
            <span>{totalSteps} Adım</span>
          </div>
          <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center w-full max-w-4xl mx-auto">
        {completed ? (
          <div className="text-center animate-in slide-in-from-bottom-8 duration-500">
            <div className="text-7xl mb-6">🎉 🍽️</div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Harika İş!</h1>
            <p className="text-xl text-emerald-400 mb-12">Yemeğiniz hazır. Ellerinize sağlık, afiyet olsun!</p>
            <button
              onClick={onClose}
              className="rounded-2xl bg-emerald-600 px-8 py-4 text-xl font-bold text-white shadow-[0_0_40px_-10px] shadow-emerald-500 transition-all hover:scale-105 hover:bg-emerald-500"
            >
              Tarife Dön
            </button>
          </div>
        ) : (
          <div className="text-center w-full animate-in slide-in-from-right-8 duration-300" key={currentStep}>
            <p className="text-3xl sm:text-5xl md:text-6xl font-medium text-white leading-tight sm:leading-snug">
              {steps[currentStep]}
            </p>
          </div>
        )}
      </div>

      {/* Controls */}
      {!completed && (
        <div className="flex justify-center gap-4 mt-8 max-w-4xl mx-auto w-full">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex-1 max-w-[200px] rounded-2xl bg-white/10 py-5 text-lg font-bold text-white transition-colors hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Önceki
          </button>
          <button
            onClick={handleNext}
            className="flex-1 max-w-[300px] rounded-2xl bg-emerald-600 py-5 text-xl font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-500 hover:scale-[1.02]"
          >
            {currentStep === totalSteps - 1 ? '🎉 Bitir' : 'Sonraki →'}
          </button>
        </div>
      )}
    </div>
  );
}
