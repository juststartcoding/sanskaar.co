import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, Pause, Volume2, VolumeX, CheckCircle, ChevronRight, ChevronLeft, X, List, RotateCcw } from "lucide-react";
import api from "../services/api";

const PoojaPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const audioRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [poojaData, setPoojaData] = useState(null);
  const [language, setLanguage] = useState("hi");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [phase, setPhase] = useState("intro");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showStepList, setShowStepList] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [mantraCount, setMantraCount] = useState(0);
  const [mantraTarget, setMantraTarget] = useState(11);

  useEffect(() => { fetchPoojaData(); }, [id]);

  const fetchPoojaData = async () => {
    try {
      setLoading(true);
      let res;
      try { res = await api.get(`/pooja-engine/${id}?language=${language}`); } 
      catch { res = await api.get(`/poojas/${id}`); }
      setPoojaData(res.data);
    } catch (err) { setError(err.response?.data?.message || "पूजा लोड नहीं हो सकी"); } 
    finally { setLoading(false); }
  };

  const handleStart = () => setPhase("playing");
  
  const handleNextStep = () => {
    setCompletedSteps([...completedSteps, currentStepIndex]);
    setMantraCount(0);
    const steps = poojaData?.steps || [];
    if (currentStepIndex < steps.length - 1) setCurrentStepIndex(currentStepIndex + 1);
    else if (poojaData?.aarti) setPhase("aarti");
    else setPhase("complete");
  };

  const handlePrevStep = () => { if (currentStepIndex > 0) setCurrentStepIndex(currentStepIndex - 1); };
  
  const handleComplete = (rating) => {
    try { api.post(`/pooja-engine/${id}/complete`, { rating }); } catch {}
    navigate(-1);
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-amber-900 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="text-6xl mb-6 animate-pulse">🙏</div>
        <div className="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-orange-200">पूजा लोड हो रही है...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 to-red-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center text-white max-w-md">
        <div className="text-6xl mb-4">😔</div>
        <h2 className="text-2xl font-bold mb-2">त्रुटि</h2>
        <p className="text-orange-200 mb-6">{error}</p>
        <button onClick={() => navigate(-1)} className="px-8 py-3 bg-white text-orange-600 rounded-full font-bold">वापस जाएं</button>
      </div>
    </div>
  );

  const pooja = poojaData?.pooja || poojaData?.data || poojaData;
  const steps = poojaData?.steps || pooja?.steps?.[language] || [];
  const aarti = poojaData?.aarti;
  const currentStep = steps[currentStepIndex];
  const progress = steps.length > 0 ? ((currentStepIndex + 1) / steps.length) * 100 : 0;

  // INTRO SCREEN
  if (phase === "intro") return (
    <div className="min-h-screen bg-gradient-to-br from-orange-800 via-red-900 to-amber-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 text-8xl">🕉️</div>
        <div className="absolute bottom-10 right-10 text-8xl">🪔</div>
      </div>
      <button onClick={() => navigate(-1)} className="absolute top-4 left-4 p-3 bg-white/10 backdrop-blur rounded-full z-10"><ArrowLeft className="w-6 h-6" /></button>
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        <div className="w-40 h-40 rounded-full bg-gradient-to-br from-orange-400 to-red-600 p-1 mb-6 shadow-2xl">
          {pooja?.main_image_url || pooja?.thumbnail ? (
            <img src={pooja.main_image_url || pooja.thumbnail} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            <div className="w-full h-full rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-6xl">🙏</div>
          )}
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-2">{pooja?.name?.hi || pooja?.poojaType || "पूजा"}</h1>
        <p className="text-orange-200 text-xl mb-8">{pooja?.name?.en || "Divine Worship"}</p>
        
        <div className="flex gap-6 mb-8">
          <div className="text-center"><div className="text-3xl font-bold">{steps.length}</div><div className="text-orange-300 text-sm">चरण</div></div>
          <div className="w-px bg-orange-500/30" />
          <div className="text-center"><div className="text-3xl font-bold">{pooja?.total_duration_minutes || Math.max(15, steps.length * 5)}</div><div className="text-orange-300 text-sm">मिनट</div></div>
        </div>
        
        <div className="flex gap-3 mb-8 bg-white/10 backdrop-blur rounded-full p-1">
          <button onClick={() => setLanguage("hi")} className={`px-6 py-2 rounded-full font-medium transition-all ${language === "hi" ? "bg-white text-orange-600" : "text-white"}`}>हिंदी</button>
          <button onClick={() => setLanguage("en")} className={`px-6 py-2 rounded-full font-medium transition-all ${language === "en" ? "bg-white text-orange-600" : "text-white"}`}>English</button>
        </div>
        
        {pooja?.description?.[language] && <p className="text-center text-orange-100 max-w-md mb-8">{pooja.description[language]}</p>}
        
        {(pooja?.samagri_list?.length > 0) && (
          <div className="bg-white/10 backdrop-blur rounded-2xl p-4 mb-8 max-w-md w-full">
            <h3 className="font-bold mb-3">🪔 {language === "hi" ? "आवश्यक सामग्री" : "Required Materials"}</h3>
            <div className="grid grid-cols-2 gap-2">
              {pooja.samagri_list.slice(0, 8).map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm"><span className="w-2 h-2 bg-orange-400 rounded-full" /><span>{item.item_name?.[language] || item.product_name || item}</span></div>
              ))}
            </div>
          </div>
        )}
        
        <button onClick={handleStart} className="group px-12 py-5 bg-gradient-to-r from-orange-500 to-red-600 rounded-full font-bold text-xl shadow-2xl hover:scale-105 transition-all flex items-center gap-3">
          <Play className="w-6 h-6" fill="white" />{language === "hi" ? "पूजा प्रारंभ करें" : "Start Pooja"}
        </button>
      </div>
    </div>
  );

  // AARTI SCREEN
  if (phase === "aarti" && aarti) return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-amber-900 text-white">
      <div className="bg-black/20 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button onClick={() => setPhase("complete")} className="p-2"><X className="w-6 h-6" /></button>
          <h2 className="text-xl font-bold">🪔 आरती</h2>
          <div className="w-10" />
        </div>
      </div>
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 animate-pulse">🪔</div>
          <h1 className="text-3xl font-bold">{aarti.title?.[language] || aarti.title?.hi}</h1>
        </div>
        {aarti.audio_url && (
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 mb-6">
            <audio ref={audioRef} src={aarti.audio_url} />
            <div className="flex items-center justify-center gap-6">
              <button onClick={() => { if (audioRef.current) { if (isPlaying) audioRef.current.pause(); else audioRef.current.play(); setIsPlaying(!isPlaying); }}} className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" fill="white" />}
              </button>
            </div>
          </div>
        )}
        {aarti.lyrics?.[language] && (
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-lg leading-relaxed text-center">{aarti.lyrics[language]}</pre>
          </div>
        )}
        <button onClick={() => setPhase("complete")} className="w-full mt-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl font-bold text-xl">आरती पूर्ण ✓</button>
      </div>
    </div>
  );

  // COMPLETE SCREEN
  if (phase === "complete") return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-emerald-900 to-teal-900 text-white flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="text-8xl animate-bounce mb-8">🎉</div>
        <h1 className="text-4xl font-bold mb-4">{language === "hi" ? "पूजा पूर्ण!" : "Pooja Complete!"}</h1>
        <p className="text-green-200 text-xl mb-8">🙏 {language === "hi" ? "भगवान आपको सदा खुश रखें" : "May God bless you always"}</p>
        <p className="text-green-200 mb-4">अपना अनुभव बताएं:</p>
        <div className="flex justify-center gap-3 mb-8">{[1,2,3,4,5].map((s) => <button key={s} onClick={() => handleComplete(s)} className="text-4xl hover:scale-125 transition-transform">⭐</button>)}</div>
        <button onClick={() => handleComplete(0)} className="px-8 py-3 border-2 border-white/30 rounded-full">बाद में</button>
      </div>
    </div>
  );

  // MAIN PLAYER SCREEN
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 flex flex-col">
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-6 h-6 text-gray-600" /></button>
            <div className="text-center flex-1 mx-4">
              <p className="text-xs text-orange-600 font-medium">चरण {currentStepIndex + 1} / {steps.length}</p>
              <h1 className="font-bold text-gray-900 truncate">{pooja?.name?.[language] || pooja?.poojaType}</h1>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsMuted(!isMuted)} className="p-2 hover:bg-gray-100 rounded-full">{isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}</button>
              <button onClick={() => setShowStepList(!showStepList)} className="p-2 hover:bg-gray-100 rounded-full"><List className="w-5 h-5" /></button>
            </div>
          </div>
          <div className="mt-3 h-2 bg-orange-100 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all" style={{ width: `${progress}%` }} /></div>
        </div>
      </header>

      {showStepList && (
        <div className="fixed inset-0 z-30 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowStepList(false)} />
          <div className="relative ml-auto w-80 bg-white h-full shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between"><h3 className="font-bold">सभी चरण</h3><button onClick={() => setShowStepList(false)}><X className="w-5 h-5" /></button></div>
            <div className="p-2">
              {steps.map((step, idx) => (
                <button key={idx} onClick={() => { setCurrentStepIndex(idx); setShowStepList(false); }} className={`w-full text-left p-3 rounded-xl mb-1 flex items-center gap-3 ${idx === currentStepIndex ? "bg-orange-100 border-2 border-orange-500" : completedSteps.includes(idx) ? "bg-green-50" : "hover:bg-gray-50"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${idx === currentStepIndex ? "bg-orange-500 text-white" : completedSteps.includes(idx) ? "bg-green-500 text-white" : "bg-gray-200"}`}>{completedSteps.includes(idx) ? "✓" : idx + 1}</div>
                  <div className="flex-1"><p className="font-medium truncate">{step.title?.[language] || step.title?.hi || step.title}</p></div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-4">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="p-8 text-center" style={{ background: currentStep?.background_color || `linear-gradient(135deg, #fed7aa 0%, #fecaca 100%)` }}>
              {currentStep?.icon_url ? <img src={currentStep.icon_url} alt="" className="w-20 h-20 mx-auto mb-4 rounded-2xl object-cover" /> : <div className="text-5xl mb-4">{currentStepIndex === 0 ? "🙏" : currentStepIndex === steps.length - 1 ? "✨" : "🕉️"}</div>}
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{currentStep?.title?.[language] || currentStep?.title?.hi || currentStep?.title || `Step ${currentStepIndex + 1}`}</h2>
              <p className="text-gray-600">{currentStep?.title?.[language === "hi" ? "en" : "hi"]}</p>
            </div>

            <div className="p-6 md:p-8">
              {(currentStep?.instruction?.[language] || currentStep?.instruction?.hi || currentStep?.text) && (
                <div className="bg-amber-50 rounded-2xl p-5 mb-6 border-l-4 border-amber-400">
                  <p className="text-gray-800 leading-relaxed text-lg">{currentStep?.instruction?.[language] || currentStep?.instruction?.hi || currentStep?.text}</p>
                </div>
              )}

              {(currentStep?.mantra || currentStep?.mantra_text) && (
                <div className="bg-orange-50 rounded-2xl p-6 mb-6 border-2 border-orange-200">
                  <h3 className="font-bold text-orange-800 mb-4">🕉️ मंत्र</h3>
                  <div className="bg-white rounded-xl p-4 mb-4">
                    <p className="text-xl md:text-2xl text-center text-orange-900 font-medium leading-relaxed">{currentStep?.mantra?.text?.sa || currentStep?.mantra_text}</p>
                  </div>
                  {(currentStep?.mantra?.audio_url || currentStep?.audio) && (
                    <div className="bg-white rounded-xl p-4 mb-4">
                      <audio ref={audioRef} src={currentStep?.mantra?.audio_url || currentStep?.audio} />
                      <div className="flex items-center justify-center gap-4">
                        <button onClick={() => { if (audioRef.current) { if (isPlaying) audioRef.current.pause(); else audioRef.current.play(); setIsPlaying(!isPlaying); }}} className="w-14 h-14 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white shadow-lg">
                          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" fill="white" />}
                        </button>
                        <span className="text-orange-600 font-medium">{isPlaying ? "बजा रहा है..." : "मंत्र सुनें"}</span>
                      </div>
                    </div>
                  )}
                  <div className="bg-white rounded-xl p-6 text-center">
                    <p className="text-sm text-gray-500 mb-2">जप गणना</p>
                    <div className="flex justify-center gap-2 mb-4">{[1, 11, 21, 108].map((num) => <button key={num} onClick={() => setMantraTarget(num)} className={`px-3 py-1 rounded-full text-sm font-medium ${mantraTarget === num ? "bg-orange-500 text-white" : "bg-gray-100"}`}>{num}</button>)}</div>
                    <div className="text-6xl font-bold text-orange-600 mb-2">{mantraCount}</div>
                    <div className="text-gray-500 mb-4">/ {mantraTarget}</div>
                    <div className="w-full bg-orange-100 rounded-full h-3 mb-4"><div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all" style={{ width: `${Math.min((mantraCount / mantraTarget) * 100, 100)}%` }} /></div>
                    <div className="flex justify-center gap-4">
                      <button onClick={() => setMantraCount(0)} className="px-6 py-2 bg-gray-100 rounded-full"><RotateCcw className="w-5 h-5" /></button>
                      <button onClick={() => setMantraCount(c => c + 1)} className="px-10 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-bold text-lg shadow-lg hover:scale-105 transition-all">🙏 जप</button>
                    </div>
                    {mantraCount >= mantraTarget && <div className="mt-4 text-green-600 font-bold flex items-center justify-center gap-2"><CheckCircle className="w-5 h-5" />पूर्ण!</div>}
                  </div>
                </div>
              )}

              {!currentStep?.mantra && (currentStep?.audio_url || currentStep?.audio) && (
                <div className="bg-orange-50 rounded-2xl p-6 mb-6">
                  <audio ref={audioRef} src={currentStep.audio_url || currentStep.audio} />
                  <div className="flex items-center justify-center gap-4">
                    <button onClick={() => { if (audioRef.current) { if (isPlaying) audioRef.current.pause(); else audioRef.current.play(); setIsPlaying(!isPlaying); }}} className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white shadow-lg">
                      {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" fill="white" />}
                    </button>
                  </div>
                </div>
              )}

              {(currentStep?.video_url || currentStep?.video) && <div className="rounded-2xl overflow-hidden mb-6"><video src={currentStep.video_url || currentStep.video} controls className="w-full" /></div>}
            </div>
          </div>

          <div className="flex gap-4 mt-6 pb-8">
            <button onClick={handlePrevStep} disabled={currentStepIndex === 0} className="flex-1 py-4 bg-white rounded-2xl font-bold text-gray-700 shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"><ChevronLeft className="w-5 h-5" />पिछला</button>
            <button onClick={handleNextStep} className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl font-bold shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
              {currentStepIndex === steps.length - 1 ? <>पूर्ण<CheckCircle className="w-5 h-5" /></> : <>अगला<ChevronRight className="w-5 h-5" /></>}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PoojaPlayer;
