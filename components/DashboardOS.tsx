import React, { useState, useEffect } from 'react';
import { IkigaiState, IkigaiResult, User } from '../types';
import { StatementWidget, VennWidget, MarketWidget } from './ResultView';
import SparkDashboard from './SparkDashboard';
import FloatingChat from './FloatingChat';
import QuadInputWidget from './QuadInputWidget';
import TaskBoard from './TaskBoard';
import { Crown, LogOut, LayoutGrid, CheckSquare, Zap, Share2 } from 'lucide-react';
import { generateStructure, generateIdeaTitles, enrichIdea } from '../services/geminiService';

interface DashboardOSProps {
  user: User | null;
  result: IkigaiResult;
  ikigaiData: IkigaiState;
  setIkigaiData: (data: IkigaiState) => void;
  setResult: (res: IkigaiResult) => void;
  isPro: boolean;
  onUpgrade: () => void;
  onLogout: () => void;
  slotsLeft: number;
  isReadOnly?: boolean;
}

const DashboardOS: React.FC<DashboardOSProps> = ({
  user, result, ikigaiData, setIkigaiData, setResult, isPro, onUpgrade, onLogout, slotsLeft, isReadOnly = false
}) => {
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [activeTab, setActiveTab] = useState<'board' | 'tasks'>('board');
  const [viewMode, setViewMode] = useState<'pathfinder' | 'spark'>('pathfinder');
  const [launchpadContext, setLaunchpadContext] = useState<string | null>(null);
  const [isMorphing, setIsMorphing] = useState(false);

  // Logo Transition Logic
  useEffect(() => {
    setIsMorphing(true);
    const timer = setTimeout(() => setIsMorphing(false), 500); // 500ms transition time
    return () => clearTimeout(timer);
  }, [viewMode]);

  const handleShare = async () => {
    if (!user?.id) return;
    const shareUrl = `${window.location.protocol}//${window.location.host}?share_id=${user.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("Share link copied to clipboard! Anyone with this link can view your analysis.");
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleReAnalysis = async () => {
    setIsAnalysing(true);
    // 1. Skeleton Reset
    setResult({
      ...result,
      statement: "",
      marketIdeas: [],
      description: "AI is rethinking your strategy..."
    });

    try {
      // 2. Stream Structure
      const structure = await generateStructure(ikigaiData);
      setResult(prev => ({ ...prev, ...structure }));

      // 3. Stream Ideas
      const ideasData = await generateIdeaTitles(ikigaiData);
      const initialIdeas = ideasData.marketIdeas || [];
      setResult(prev => ({ ...prev, marketIdeas: initialIdeas }));

      // 4. Enrich Loop
      const enrichedIdeas = [...initialIdeas];
      for (let i = 0; i < enrichedIdeas.length; i++) {
        const deepData = await enrichIdea(enrichedIdeas[i], ikigaiData);
        if (deepData) {
          enrichedIdeas[i] = { ...enrichedIdeas[i], ...deepData };
          setResult(prev => ({ ...prev, marketIdeas: [...enrichedIdeas] }));
        }
      }
    } catch (e) {
      console.error("Re-analysis failed", e);
    } finally {
      setIsAnalysing(false);
    }
  };

  const isSpark = viewMode === 'spark';

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-500 ${isSpark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>

      {/* GLOBAL HEADER */}
      <header className={`px-4 md:px-6 py-3 flex justify-between items-center sticky top-0 z-[60] backdrop-blur-xl border-b transition-colors duration-500 ${isSpark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200'}`}>

        {/* LOGO (MORPHING) */}
        <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity w-40 relative h-10">
          {/* IMAGE 1: IKIGAI LOGO (Visible when Pathfinder & Not Morphing) */}
          {/* PATHFINDER TEXT LOGO */}
          <span className={`absolute left-0 top-1/2 -translate-y-1/2 font-serif font-bold text-xl tracking-tight transition-all duration-500 ${!isSpark && !isMorphing ? 'opacity-100 scale-100 text-slate-900' : 'opacity-0 scale-90 blur-sm'}`}>
            Pathfinder
          </span>

          {/* SPARK TEXT LOGO */}
          <span className={`absolute left-0 top-1/2 -translate-y-1/2 font-serif font-bold text-xl tracking-tight transition-all duration-500 ${isSpark && !isMorphing ? 'opacity-100 scale-100 text-slate-100 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'opacity-0 scale-90 blur-sm'}`}>
            Spark Studio
          </span>


        </div>

        {/* CENTRAL NAV TABS */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <nav className={`flex p-1 rounded-full border transition-colors ${isSpark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
            <button
              onClick={() => setViewMode('pathfinder')}
              className={`px-4 md:px-6 py-1.5 rounded-full text-xs md:text-sm font-bold transition-all ${!isSpark ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Pathfinder
            </button>
            <button
              onClick={() => isPro ? setViewMode('spark') : onUpgrade()}
              className={`flex items-center gap-1.5 px-4 md:px-6 py-1.5 rounded-full text-xs md:text-sm font-bold transition-all ${isSpark ? 'bg-amber-500 text-slate-900 shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <Zap size={12} fill={isSpark ? "currentColor" : "none"} />
              Spark
            </button>
          </nav>
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-3">
          {/* Sub-Nav for Pathfinder (Only visible in Pathfinder Mode) */}
          {!isSpark && (
            <div className="hidden md:flex bg-slate-100 p-1 rounded-lg mr-2">
              <button
                onClick={() => setActiveTab('board')}
                className={`p-1.5 rounded text-xs transition-all ${activeTab === 'board' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                title="Board View"
              >
                <LayoutGrid size={14} />
              </button>
              <button
                onClick={() => setActiveTab('tasks')}
                className={`p-1.5 rounded text-xs transition-all ${activeTab === 'tasks' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                title="Tasks View"
              >
                <CheckSquare size={14} />
              </button>
            </div>
          )}


          {/* SHARE BUTTON */}
          <button
            onClick={handleShare}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border ${isSpark
              ? 'bg-indigo-900/30 text-indigo-400 border-indigo-500/30 hover:bg-indigo-900/50'
              : 'bg-white text-slate-500 border-slate-200 hover:text-indigo-600 hover:border-indigo-200'
              }`}
          >
            <Share2 size={12} /> Share
          </button>

          <span className={`hidden md:flex items-center gap-1 text-[10px] font-bold px-3 py-1 rounded-full border ${isSpark ? 'bg-amber-900/20 text-amber-500 border-amber-900/50' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
            <Crown size={12} fill="currentColor" /> FOUNDER
          </span>

          {/* USER PROFILE & LOGOUT */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200/50">
            <div className="relative group/profile">
              <img
                src={user?.photoUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
                alt="User"
                className={`w-8 h-8 rounded-full border cursor-default ${isSpark ? 'border-indigo-500/50' : 'border-slate-200'}`}
                title={user?.name}
              />
            </div>

            <button
              onClick={onLogout}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-medium transition-colors group ${isSpark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-500 hover:text-red-600 hover:bg-red-50'
                }`}
              title="Sign Out / Switch Account"
            >
              <LogOut size={14} className="group-hover:scale-110 transition-transform" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header >

      {/* CONTENT SWITCHER */}
      {
        isSpark ? (
          <div className="flex-1 overflow-hidden relative animate-in fade-in zoom-in-95 duration-300">
            <SparkDashboard user={user} result={result} ikigaiData={ikigaiData} />
          </div>
        ) : (
          <main className="flex-1 overflow-x-hidden overflow-y-auto relative pb-32">
            {activeTab === 'tasks' ? (
              <div className="max-w-7xl mx-auto h-full p-6">
                <TaskBoard userId={user?.email || 'demo'} />
              </div>
            ) : (
              <div className="max-w-5xl mx-auto flex flex-col items-center gap-12 p-6 md:p-12">
                {/* SECTION 1: HERO (Venn + Headline) */}
                <div className="w-full flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="w-full max-w-lg md:max-w-xl mb-8 transform hover:scale-105 transition-transform duration-500">
                    <VennWidget result={result} mode={viewMode} />
                  </div>
                  <div className="max-w-3xl">
                    <h2 className="text-xs font-bold tracking-[0.2em] text-slate-400 uppercase mb-4">Your Ikigai Is</h2>
                    <h1 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 leading-tight mb-4">
                      {result.statement || <span className="animate-pulse bg-slate-200 rounded text-transparent">Generating your purpose...</span>}
                    </h1>
                    <p className="text-lg md:text-xl text-slate-500 italic max-w-2xl mx-auto leading-relaxed">
                      {result.description}
                    </p>
                  </div>
                </div>

                {/* SECTION 2: MARKET TABS */}
                <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
                  <MarketWidget result={result} isPro={isPro} onUpgrade={onUpgrade} onOpenCopilot={setLaunchpadContext} />
                </div>
              </div>
            )}

            {/* FLOATERS For Pathfinder */}
            {!isReadOnly && (
              <>
                <div className="fixed bottom-0 left-0 w-full z-40 px-4 pb-4 pointer-events-none">
                  <div className="max-w-3xl mx-auto pointer-events-auto shadow-2xl rounded-2xl overflow-hidden border border-slate-200">
                    <QuadInputWidget
                      data={ikigaiData}
                      onUpdate={setIkigaiData}
                      onRegenerate={handleReAnalysis}
                      isAnalysing={isAnalysing}
                      compact={true}
                    />
                  </div>
                </div>
                <FloatingChat
                  result={result}
                  isPro={isPro}
                  user={user}
                  ikigaiData={ikigaiData}
                  externalContext={launchpadContext}
                  onClearContext={() => setLaunchpadContext(null)}
                />
              </>
            )}
          </main>
        )
      }

    </div >
  );
};

export default DashboardOS;
