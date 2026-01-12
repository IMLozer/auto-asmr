
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { generateTitles, generateFullProject, generateSceneImage } from './services/geminiService';
import { RestorationScene, AppStep, YouTubeMetadata, StoryboardResponse, HistoryItem } from './types';

// Updated icon components to accept className prop to resolve type errors
const SparkleIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1-1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
);

const CopyIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
);

const PlayIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7 4 12 8-12 8V4Z"/></svg>
);

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
);

const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
);

const HistoryIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
);

const MenuIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
);

const RefreshIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
);

const SettingsIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
);

const STORAGE_KEY = 'auto_restorer_history';

const YEARS = Array.from({ length: 75 }, (_, i) => (2024 - i).toString());

const BRAND_DATA: Record<string, { founded: number; models: string[] }> = {
  "Porsche": { founded: 1931, models: ["911 Carrera", "911 Turbo", "356 Speedster", "944 Turbo", "Cayenne", "Taycan", "Carrera GT", "918 Spyder", "928"] },
  "Toyota": { founded: 1937, models: ["Supra MKIV", "Supra MKV", "Land Cruiser", "AE86 Trueno", "Celica GT-Four", "MR2 Turbo", "Hilux", "GR Yaris", "2000GT"] },
  "Ferrari": { founded: 1947, models: ["F40", "Testarossa", "250 GTO", "Enzo", "458 Italia", "F8 Tributo", "LaFerrari", "SF90 Stradale", "308 GTS"] },
  "Lamborghini": { founded: 1963, models: ["Countach", "Diablo", "Miura", "Aventador", "Huracan", "Murcielago", "Urus", "Revuelto"] },
  "Nissan": { founded: 1933, models: ["Skyline R34 GTR", "Skyline R32 GTR", "240Z", "Silvia S15", "GT-R R35", "350Z", "300ZX", "Patrol"] },
  "Ford": { founded: 1903, models: ["Mustang Fastback", "GT40", "F-150 Raptor", "Bronco", "Escort RS Cosworth", "GT", "Shelby GT500", "Sierra RS500"] },
  "BMW": { founded: 1916, models: ["M3 E30", "M3 E46", "M5 E39", "2002 Turbo", "850CSi", "M1", "i8", "Z8", "X5 M"] },
  "Mercedes-Benz": { founded: 1926, models: ["300SL Gullwing", "G-Wagon", "190E Evolution II", "SLS AMG", "AMG GT", "S-Class", "E63 AMG", "500E"] },
  "Chevrolet": { founded: 1911, models: ["Corvette C2", "Corvette C8", "Camaro SS", "Bel Air", "Chevelle SS", "Silverado", "Impala"] },
  "Tesla": { founded: 2003, models: ["Model S Plaid", "Model 3 Performance", "Model X", "Model Y", "Roadster", "Cybertruck"] },
  "Honda": { founded: 1948, models: ["NSX Type R", "Civic Type R EK9", "S2000", "Integra Type R DC2", "Prelude", "S600"] },
  "Mazda": { founded: 1920, models: ["RX-7 FD", "MX-5 Miata", "RX-8", "787B", "Cosmo Sport"] },
  "Subaru": { founded: 1953, models: ["Impreza 22B STi", "WRX STI", "BRZ", "Forester STi", "Legacy RS"] },
  "Audi": { founded: 1909, models: ["Quattro S1", "R8 V10", "RS6 Avant", "RS2 Avant", "TT RS"] },
  "Lexus": { founded: 1989, models: ["LFA", "LS400", "IS300", "LC500", "GS F"] },
  "McLaren": { founded: 1963, models: ["F1", "P1", "720S", "Senna", "MP4-12C"] },
  "Aston Martin": { founded: 1913, models: ["DB5", "Vantage", "DBS V12", "One-77", "Valhalla"] },
  "Rolls-Royce": { founded: 1904, models: ["Phantom", "Cullinan", "Silver Shadow", "Wraith", "Spectre"] },
  "Dodge": { founded: 1900, models: ["Viper GTS", "Challenger Hellcat", "Charger R/T", "Ram SRT-10"] },
  "Jaguar": { founded: 1922, models: ["E-Type", "XJ220", "F-Type", "MKII", "XKR-S"] }
};

const SCENE_COUNT_OPTIONS = [10, 15, 20, 25, 30, 40, 50];

export default function App() {
  const [step, setStep] = useState<AppStep>(AppStep.TITLES);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState("");
  const [titles, setTitles] = useState<string[]>([]);
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const [storyboard, setStoryboard] = useState<RestorationScene[]>([]);
  const [youtubeMetadata, setYoutubeMetadata] = useState<YouTubeMetadata | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [autoGenProgress, setAutoGenProgress] = useState<number>(0);
  const [showMetadata, setShowMetadata] = useState(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  const [selectedYear, setSelectedYear] = useState<string>("any");
  const [selectedBrand, setSelectedBrand] = useState<string>("any");
  const [selectedModel, setSelectedModel] = useState<string>("any");
  const [selectedSceneCount, setSelectedSceneCount] = useState<number>(20);
  const [topicPrompt, setTopicPrompt] = useState<string>("Generate 5 YouTube video titles for ASMR car restoration");
  const [isAutoStart, setIsAutoStart] = useState<boolean>(false);

  const progressIntervalRef = useRef<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const availableBrands = useMemo(() => {
    if (selectedYear === "any") return Object.keys(BRAND_DATA);
    const yearInt = parseInt(selectedYear);
    return Object.keys(BRAND_DATA).filter(brand => BRAND_DATA[brand].founded <= yearInt);
  }, [selectedYear]);

  const availableModels = useMemo(() => {
    if (selectedBrand === "any") return [];
    return BRAND_DATA[selectedBrand]?.models || [];
  }, [selectedBrand]);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 5000);
  };

  const handleStartAutoASMR = async () => {
    if (!process.env.API_KEY || process.env.API_KEY === 'undefined') {
      showFeedback("CRITICAL ERROR: API_KEY is missing. Check Vercel Environment Variables.");
      return;
    }

    setLoading(true);
    startLoadingSimulation(80, "Generating Content Ideas...");
    setTitles([]);
    setAutoGenProgress(0);
    setIsMenuOpen(false);

    try {
      const generated = await generateTitles({
        year: selectedYear,
        brand: selectedBrand,
        model: selectedModel
      }, topicPrompt);
      stopLoadingSimulation();
      setTitles(generated);
      setStep(AppStep.TITLES);

      if (isAutoStart && generated.length > 0) {
        setTimeout(() => handleSelectTitle(generated[0]), 800);
      }
    } catch (error: any) {
      console.error("API Error Trace:", error);
      showFeedback(`API ERROR: ${error?.message || "Check your key."}`);
    } finally {
      setTimeout(() => {
        setLoading(false);
        setLoadingProgress(0);
      }, 400);
    }
  };

  const handleSelectTitle = async (title: string) => {
    setSelectedTitle(title);
    setLoading(true);
    startLoadingSimulation(60, "Architecting Project Foundation...");
    setStoryboard([]); 
    setYoutubeMetadata(null);
    setAutoGenProgress(0);
    try {
      const data = await generateFullProject(title, selectedSceneCount);
      stopLoadingSimulation();
      setLoadingStatus("Architecture Complete.");
      setTimeout(() => {
        setStoryboard(data.scenes);
        setYoutubeMetadata(data.metadata);
        setStep(AppStep.STORYBOARD);
        setLoading(false);
        setLoadingProgress(0);
        saveToHistory(data);
        processImageQueue(data.scenes);
      }, 300);
    } catch (error: any) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      showFeedback(`Generation failed: ${error?.message || 'Unknown'}`);
      setLoading(false);
    }
  };

  const startLoadingSimulation = (initialTarget: number, initialStatus: string) => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    setLoadingProgress(0);
    setLoadingStatus(initialStatus);
    progressIntervalRef.current = window.setInterval(() => {
      setLoadingProgress(prev => {
        if (prev < initialTarget) return prev + Math.floor(Math.random() * 12 + 5);
        else if (prev < 99) return prev + 1;
        return prev;
      });
    }, 150);
  };

  const stopLoadingSimulation = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setLoadingProgress(100);
  };

  const saveToHistory = (data: StoryboardResponse) => {
    const newItem: HistoryItem = { id: crypto.randomUUID(), timestamp: Date.now(), data };
    const updated = [newItem, ...history].slice(0, 10);
    setHistory(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const loadFromHistory = (item: HistoryItem) => {
    setSelectedTitle(item.data.metadata.title);
    setStoryboard(item.data.scenes);
    setYoutubeMetadata(item.data.metadata);
    setStep(AppStep.STORYBOARD);
    setIsMenuOpen(false);
    processImageQueue(item.data.scenes);
  };

  const deleteFromHistory = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    showFeedback("Project deleted from vault");
  };

  const handleGenerateImage = async (index: number, currentList?: RestorationScene[]) => {
    const list = currentList || storyboard;
    const targetScene = list[index];
    if (!targetScene) return false;
    setStoryboard(prev => prev.map((s, i) => i === index ? { ...s, isGeneratingImage: true } : s));
    let imageUrl = await generateSceneImage(targetScene.visualPrompt);
    setStoryboard(prev => {
      const updated = prev.map((s, i) => i === index ? { ...s, imageUrl: imageUrl || undefined, isGeneratingImage: false } : s);
      if (imageUrl && selectedTitle) {
        const itemIndex = history.findIndex(h => h.data.metadata.title === selectedTitle);
        if (itemIndex !== -1) {
          const newHistory = [...history];
          newHistory[itemIndex].data.scenes = updated;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
          setHistory(newHistory);
        }
      }
      return updated;
    });
    return !!imageUrl;
  };

  const processImageQueue = async (scenes: RestorationScene[]) => {
    for (let i = 0; i < scenes.length; i++) {
      if (scenes[i].imageUrl) continue;
      setAutoGenProgress(i + 1);
      await handleGenerateImage(i, scenes);
      await new Promise(r => setTimeout(r, 400)); 
    }
    setAutoGenProgress(scenes.length + 1); 
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showFeedback(`${label} copied!`);
  };

  const copySceneBundle = (scene: RestorationScene) => {
    const bundle = `${scene.stageTitle}\nVISUAL: ${scene.visualPrompt}\nCAM: ${scene.animationPrompt}`;
    copyToClipboard(bundle, `Scene ${scene.stageNumber}`);
  };

  const playASMRClick = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch(e) {}
  };

  const handlePlayScene = (index: number) => {
    if (playingIndex === index) {
      setPlayingIndex(null);
      return;
    }
    playASMRClick();
    setPlayingIndex(index);
    setTimeout(() => setPlayingIndex(prev => prev === index ? null : prev), 5000);
  };

  const refreshCurrentView = () => {
    setIsMenuOpen(false);
    if (step === AppStep.STORYBOARD && selectedTitle) {
      handleSelectTitle(selectedTitle);
    } else {
      handleStartAutoASMR();
    }
  };

  const goToHistory = () => {
    setStep(AppStep.TITLES);
    setIsMenuOpen(false);
    setTimeout(() => document.getElementById('history-vault')?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0f172a]">
      <header className="sticky top-0 z-[60] bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => setStep(AppStep.TITLES)}>
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20 rotate-3">
              <SparkleIcon />
            </div>
            <div className="hidden sm:block text-left">
              <h1 className="text-xl font-black text-white uppercase italic tracking-tighter leading-none">AutoRestorer <span className="text-amber-500">PRO</span></h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Live Engine</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={handleStartAutoASMR}
              disabled={loading}
              className="px-4 sm:px-6 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-900 font-black rounded-full transition-all shadow-xl shadow-amber-500/10 text-xs uppercase tracking-widest min-w-[120px] sm:min-w-[140px]"
            >
              {loading && step === AppStep.TITLES ? (
                 <div className="flex items-center justify-center gap-2">
                   <div className="w-3 h-3 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                   <span>{loadingProgress}%</span>
                 </div>
              ) : (
                <>START AUTO ASMR</>
              )}
            </button>

            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-10 h-10 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl flex items-center justify-center transition-all border border-slate-700/50"
              >
                <MenuIcon />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-3 py-2 border-b border-slate-800 mb-2">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Global Protocol</p>
                  </div>
                  <button onClick={refreshCurrentView} className="w-full flex items-center gap-3 px-3 py-3 text-left text-xs font-bold text-slate-300 hover:text-amber-500 hover:bg-slate-800 rounded-xl transition-all"><RefreshIcon /><span>REFRESH</span></button>
                  <button onClick={goToHistory} className="w-full flex items-center gap-3 px-3 py-3 text-left text-xs font-bold text-slate-300 hover:text-amber-500 hover:bg-slate-800 rounded-xl transition-all"><HistoryIcon /><span>VAULT</span></button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-4 lg:p-8">
        {feedback && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-900 px-6 py-3 rounded-2xl font-black shadow-2xl z-[100] animate-in fade-in slide-in-from-top-4 uppercase text-[10px] tracking-widest text-center max-w-[90vw]">
            {feedback}
          </div>
        )}

        {step === AppStep.TITLES && !loading && (
          <div className="mt-8 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            <div className="max-w-4xl mx-auto bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500"><SettingsIcon /></div>
                <div className="text-left">
                  <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Project Specification</h3>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Target Chassis, Era & Prompt Logic</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-3 text-left">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Release Year</label>
                  <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors font-bold appearance-none cursor-pointer">
                    <option value="any">ANY YEAR</option>{YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="space-y-3 text-left">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Brand</label>
                  <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)} className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors font-bold appearance-none cursor-pointer">
                    <option value="any">ANY BRAND</option>{availableBrands.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="space-y-3 text-left">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Model</label>
                  <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} disabled={selectedBrand === "any"} className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors font-bold appearance-none cursor-pointer disabled:opacity-40">
                    <option value="any">ANY MODEL</option>{availableModels.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="space-y-3 text-left">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Scenes</label>
                  <select value={selectedSceneCount} onChange={(e) => setSelectedSceneCount(parseInt(e.target.value))} className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors font-bold appearance-none cursor-pointer">
                    {SCENE_COUNT_OPTIONS.map(c => <option key={c} value={c}>{c} SCENES</option>)}
                  </select>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <div className="space-y-3 text-left">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Topic Prompt Override</label>
                  <input type="text" value={topicPrompt} onChange={(e) => setTopicPrompt(e.target.value)} className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors font-bold" />
                </div>
                
                <div className="flex items-center justify-between bg-slate-950/30 p-4 rounded-2xl border border-slate-800/50">
                   <div className="text-left">
                     <p className="text-xs font-black text-slate-300 uppercase tracking-widest italic">AUTO START ASMR MODE</p>
                     <p className="text-[9px] text-slate-500 uppercase font-bold">Automatically select title and build project</p>
                   </div>
                   <button onClick={() => setIsAutoStart(!isAutoStart)} className={`w-14 h-8 rounded-full transition-all flex items-center p-1 ${isAutoStart ? 'bg-amber-500' : 'bg-slate-800'}`}>
                     <div className={`w-6 h-6 bg-white rounded-full shadow-lg transform transition-transform ${isAutoStart ? 'translate-x-6' : 'translate-x-0'}`}></div>
                   </button>
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <button onClick={handleStartAutoASMR} className="px-10 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl transition-all shadow-xl uppercase italic tracking-[0.2em] text-xs">Generate Titles</button>
              </div>
            </div>

            {titles.length > 0 && (
              <div className="space-y-6">
                <div className="text-center space-y-4">
                   <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Generated Concepts</h2>
                </div>
                <div className="grid gap-4 max-w-3xl mx-auto">
                  {titles.map((title, idx) => (
                    <button key={idx} onClick={() => handleSelectTitle(title)} className="group p-6 bg-slate-800/20 hover:bg-slate-800/40 border border-slate-700/50 rounded-2xl text-left transition-all hover:scale-[1.01] shadow-lg">
                      <span className="text-amber-500 font-mono text-[9px] font-black uppercase tracking-[0.3em] mb-1 block">ID 0{idx + 1}</span>
                      <h3 className="text-lg font-black text-white uppercase italic group-hover:text-amber-400 transition-colors">{title}</h3>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {history.length > 0 && (
              <div id="history-vault" className="space-y-6 pt-12">
                <div className="flex items-center gap-3 px-4 max-w-3xl mx-auto border-l-4 border-amber-500"><HistoryIcon /><h2 className="text-xl font-black text-white italic uppercase tracking-tighter">Vault</h2></div>
                <div className="grid gap-4 max-w-3xl mx-auto">
                  {history.map((item) => (
                    <div key={item.id} onClick={() => loadFromHistory(item)} className="group p-6 bg-slate-900/40 hover:bg-slate-800/40 border border-slate-800 rounded-2xl text-left transition-all cursor-pointer flex justify-between items-center">
                      <div className="text-left">
                        <span className="text-slate-500 font-mono text-[9px] uppercase tracking-[0.2em]">{new Date(item.timestamp).toLocaleDateString()}</span>
                        <h3 className="text-md font-black text-slate-300 italic group-hover:text-amber-400">{item.data.metadata.title}</h3>
                      </div>
                      <button onClick={(e) => deleteFromHistory(e, item.id)} className="p-3 text-slate-600 hover:text-red-500 transition-all"><TrashIcon /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {step === AppStep.STORYBOARD && (
          <div className="mt-4 space-y-10 animate-in fade-in">
             {youtubeMetadata && (
                <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
                   <div className="flex justify-between items-center mb-8">
                      <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">SEO Metadata</h2>
                      <button onClick={() => setShowMetadata(!showMetadata)} className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center transition-transform">{showMetadata ? <ChevronDownIcon className="rotate-180" /> : <ChevronDownIcon />}</button>
                   </div>
                   {showMetadata && (
                     <div className="space-y-6 text-left">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-amber-500/60 uppercase tracking-widest flex justify-between">Title <button onClick={() => copyToClipboard(youtubeMetadata.title, "Title")}><CopyIcon /></button></label>
                           <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 text-white font-bold italic">{youtubeMetadata.title}</div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-amber-500/60 uppercase tracking-widest flex justify-between">Description <button onClick={() => copyToClipboard(youtubeMetadata.description, "Desc")}><CopyIcon /></button></label>
                           <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 text-slate-400 text-xs leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto">{youtubeMetadata.description}</div>
                        </div>
                     </div>
                   )}
                </div>
             )}

             {autoGenProgress > 0 && autoGenProgress <= storyboard.length && (
               <div className="p-4 bg-slate-900/50 rounded-2xl border border-amber-500/20 text-center uppercase text-[10px] font-black tracking-widest text-amber-500">Rendering Stage {autoGenProgress} of {storyboard.length}...</div>
             )}

             <div className="grid gap-12">
               {storyboard.map((scene, idx) => (
                 <div key={idx} className="group grid lg:grid-cols-[1fr_2fr] gap-10 bg-slate-800/10 border border-slate-800/50 rounded-[3rem] p-8 hover:bg-slate-800/20 transition-all">
                    <div className="aspect-square bg-slate-950 rounded-[2.5rem] overflow-hidden border border-slate-800 relative">
                       {scene.imageUrl ? (
                         <img src={scene.imageUrl} alt={scene.stageTitle} className={`w-full h-full object-cover ${playingIndex === idx ? 'animate-ken-burns' : ''}`} />
                       ) : (
                         <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">{scene.isGeneratingImage ? <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div> : <SparkleIcon />}</div>
                       )}
                       {scene.imageUrl && (
                         <button onClick={() => handlePlayScene(idx)} className="absolute bottom-4 right-4 p-4 bg-slate-900/90 text-amber-500 rounded-2xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"><PlayIcon /></button>
                       )}
                    </div>
                    <div className="flex flex-col justify-center space-y-6 text-left">
                       <div className="flex justify-between">
                          <h3 className="text-2xl font-bold text-white tracking-tight uppercase italic">{scene.stageTitle}</h3>
                          <button onClick={() => copySceneBundle(scene)} className="text-slate-500 hover:text-amber-500 transition-all"><CopyIcon /></button>
                       </div>
                       <div className="space-y-4">
                          <div className="p-5 bg-slate-950/40 rounded-2xl border border-slate-800/50 text-slate-300 text-sm italic">{scene.visualPrompt}</div>
                          <div className="flex items-center gap-3 p-3 bg-amber-500/5 rounded-xl border border-amber-500/10 text-amber-500 font-black italic uppercase text-[10px] tracking-widest"><PlayIcon className="w-3 h-3" />{scene.animationPrompt}</div>
                       </div>
                    </div>
                 </div>
               ))}
             </div>
          </div>
        )}

        {loading && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-2xl z-[70] flex flex-col items-center justify-center p-6 text-center">
             <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-6"></div>
             <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">{loadingStatus}</h3>
             <div className="w-48 bg-slate-900 h-1.5 rounded-full overflow-hidden"><div className="h-full bg-amber-500 transition-all" style={{ width: `${loadingProgress}%` }}></div></div>
          </div>
        )}
      </main>
    </div>
  );
}
