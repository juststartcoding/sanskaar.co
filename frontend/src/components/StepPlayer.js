import React, { useState, useRef, useEffect } from "react";

const formatTime = (s) => `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;

const AudioPlayer = ({ src, autoPlay = false }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => { if (autoPlay && audioRef.current && src) audioRef.current.play().catch(()=>{}); }, [src, autoPlay]);

  if (!src) return null;
  return (
    <div className="bg-orange-50 rounded-xl p-4 mt-4">
      <audio ref={audioRef} src={src} onTimeUpdate={() => setProgress((audioRef.current?.currentTime/audioRef.current?.duration)*100)} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} />
      <div className="flex items-center gap-4">
        <button onClick={() => isPlaying ? audioRef.current?.pause() : audioRef.current?.play()} className="w-12 h-12 rounded-full bg-orange-600 text-white flex items-center justify-center">{isPlaying ? "⏸" : "▶️"}</button>
        <div className="flex-1"><div className="h-2 bg-orange-200 rounded-full"><div className="h-full bg-orange-600 rounded-full" style={{width:`${progress}%`}}/></div></div>
      </div>
    </div>
  );
};

const MantraCounter = ({ target = 11, repeatOptions = [1,11,21,108], onChange }) => {
  const [count, setCount] = useState(0);
  const [selectedTarget, setSelectedTarget] = useState(target);
  const increment = () => { setCount(c => { onChange?.(c+1); return c+1; }); };
  return (
    <div className="bg-amber-50 rounded-xl p-6 mt-4 text-center">
      <div className="text-sm text-gray-600 mb-2">जप गणना</div>
      <div className="flex justify-center gap-2 mb-4">{repeatOptions.map(o => <button key={o} onClick={() => setSelectedTarget(o)} className={`px-3 py-1 rounded-full text-sm ${selectedTarget===o?'bg-orange-600 text-white':'bg-white'}`}>{o}</button>)}</div>
      <div className="text-6xl font-bold text-orange-600">{count}</div>
      <div className="text-gray-500">/ {selectedTarget}</div>
      <div className="w-full bg-orange-200 rounded-full h-2 mt-4"><div className="bg-orange-600 h-2 rounded-full" style={{width:`${Math.min((count/selectedTarget)*100,100)}%`}}/></div>
      <div className="flex justify-center gap-4 mt-6">
        <button onClick={() => setCount(0)} className="px-6 py-2 bg-gray-200 rounded-lg">Reset</button>
        <button onClick={increment} className="px-8 py-3 bg-orange-600 text-white rounded-lg text-lg font-medium">🙏 जप</button>
      </div>
      {count >= selectedTarget && <div className="mt-4 text-green-600 font-medium">✅ पूर्ण!</div>}
    </div>
  );
};

const StepPlayer = ({ pooja, steps, aarti, userProgress, language = "hi", onStepComplete, onPoojaComplete, onClose }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(userProgress?.current_step_index || 0);
  const [showMantraCounter, setShowMantraCounter] = useState(false);
  const [mantraCount, setMantraCount] = useState(0);
  const [isAartiScreen, setIsAartiScreen] = useState(false);
  const [isCompleteScreen, setIsCompleteScreen] = useState(false);
  const [settings] = useState({ autoPlayAudio: true });

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;

  const handleNextStep = async () => {
    onStepComplete?.({ step_code: currentStep.step_code, mantra_count: mantraCount });
    setMantraCount(0); setShowMantraCounter(false);
    if (isLastStep) { if (aarti) setIsAartiScreen(true); else setIsCompleteScreen(true); } 
    else setCurrentStepIndex(i => i + 1);
  };

  if (isCompleteScreen) return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold mb-2">{language==="hi"?"पूजा पूर्ण!":"Pooja Complete!"}</h2>
        <p className="text-gray-600 mb-6">🙏 भगवान आपको सदा खुश रखें</p>
        <div className="mb-6"><p className="text-sm text-gray-500 mb-2">Rate:</p><div className="flex justify-center gap-2">{[1,2,3,4,5].map(s => <button key={s} onClick={() => { onPoojaComplete?.({rating:s}); onClose?.(); }} className="text-3xl hover:scale-110">⭐</button>)}</div></div>
        <button onClick={() => { onPoojaComplete?.({}); onClose?.(); }} className="text-orange-600">Skip</button>
      </div>
    </div>
  );

  if (isAartiScreen && aarti) return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 to-red-100 p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-6 text-center">
          <div className="text-4xl mb-2">🪔</div>
          <h2 className="text-2xl font-bold">{aarti.title?.[language]||aarti.title?.hi}</h2>
        </div>
        <div className="p-6">
          {aarti.audio_url && <AudioPlayer src={aarti.audio_url} autoPlay />}
          {aarti.lyrics?.[language] && <div className="mt-6 bg-amber-50 rounded-xl p-4 max-h-64 overflow-y-auto"><pre className="whitespace-pre-wrap">{aarti.lyrics[language]}</pre></div>}
          <button onClick={() => { setIsAartiScreen(false); setIsCompleteScreen(true); }} className="w-full mt-6 py-4 bg-orange-600 text-white rounded-xl font-medium text-lg">आरती पूर्ण ✓</button>
        </div>
      </div>
    </div>
  );

  if (!currentStep) return <div className="min-h-screen flex items-center justify-center">No steps</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button onClick={onClose} className="p-2">✕</button>
            <div className="text-center"><div className="text-sm text-gray-500">Step {currentStepIndex+1}/{steps.length}</div><div className="font-medium">{pooja?.name?.[language]}</div></div>
            <span>🔊</span>
          </div>
          <div className="mt-2 h-1 bg-gray-200 rounded-full"><div className="h-full bg-orange-600 rounded-full" style={{width:`${((currentStepIndex+1)/steps.length)*100}%`}}/></div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 text-center" style={{backgroundColor:currentStep.background_color}}>
            <h2 className="text-2xl font-bold">{currentStep.title?.[language]||currentStep.title?.hi}</h2>
            <p className="text-gray-600 mt-1">{currentStep.title?.[language==="hi"?"en":"hi"]}</p>
          </div>
          <div className="p-6">
            {currentStep.instruction?.[language] && <div className="bg-amber-50 rounded-xl p-4 mb-4"><p>{currentStep.instruction[language]}</p></div>}
            {currentStep.mantra && (
              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium mb-2">🕉️ {currentStep.mantra.name}</h3>
                {currentStep.mantra.text?.sa && <div className="bg-orange-50 rounded-xl p-4 mb-4"><p className="text-xl text-center text-orange-900">{currentStep.mantra.text.sa}</p></div>}
                {currentStep.mantra.audio_url && <AudioPlayer src={currentStep.mantra.audio_url} autoPlay={settings.autoPlayAudio}/>}
                <button onClick={() => setShowMantraCounter(!showMantraCounter)} className="w-full mt-4 py-2 border-2 border-orange-600 text-orange-600 rounded-lg">{showMantraCounter?"Hide":"🔢 Mantra Counter"}</button>
                {showMantraCounter && <MantraCounter target={currentStep.mantra.repeat_count} repeatOptions={currentStep.mantra.repeat_allowed} onChange={setMantraCount}/>}
              </div>
            )}
            {!currentStep.mantra && currentStep.media?.audio_url && <AudioPlayer src={currentStep.media.audio_url} autoPlay={settings.autoPlayAudio}/>}
          </div>
        </div>

        <div className="flex gap-4 mt-6 pb-8">
          {currentStepIndex > 0 && <button onClick={() => setCurrentStepIndex(i=>i-1)} className="flex-1 py-4 border-2 border-gray-300 rounded-xl">← पिछला</button>}
          <button onClick={handleNextStep} className="flex-1 py-4 bg-orange-600 text-white rounded-xl font-medium text-lg">{isLastStep?"पूर्ण ✓":"अगला →"}</button>
        </div>
      </div>
    </div>
  );
};

export default StepPlayer;
