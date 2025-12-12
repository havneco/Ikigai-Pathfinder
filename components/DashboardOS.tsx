import React, { useState } from 'react';
import { IkigaiState, IkigaiResult, User } from '../types';
import { StatementWidget, VennWidget, MarketWidget } from './ResultView';
import SparkDashboard from './SparkDashboard';
import FloatingChat from './FloatingChat';
import QuadInputWidget from './QuadInputWidget';
import TaskBoard from './TaskBoard';
import { Crown, LogOut, LayoutGrid, CheckSquare, Zap } from 'lucide-react';
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
}

const DashboardOS: React.FC<DashboardOSProps> = ({
  user, result, ikigaiData, setIkigaiData, setResult, isPro, onUpgrade, onLogout, slotsLeft
}) => {
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [activeTab, setActiveTab] = useState<'board' | 'tasks'>('board');
  const [viewMode, setViewMode] = useState<'pathfinder' | 'spark'>('pathfinder');
  const [launchpadContext, setLaunchpadContext] = useState<string | null>(null);

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

        {/* LOGO */}
        <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-serif font-bold text-lg shadow-sm ${isSpark ? 'bg-amber-500 text-slate-900' : 'bg-slate-900 text-white'}`}>
            {isSpark ? <Zap size={18} fill="currentColor" /> : "IK"}
          </div>
          <span className={`hidden md:inline font-serif font-bold text-lg ${isSpark ? 'text-slate-100' : 'text-slate-900'}`}>
            {isSpark ? "Spark Studio" : "Pathfinder"}
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

          <span className={`hidden md:flex items-center gap-1 text-[10px] font-bold px-3 py-1 rounded-full border ${isSpark ? 'bg-amber-900/20 text-amber-500 border-amber-900/50' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
            <Crown size={12} fill="currentColor" /> FOUNDER
          </span>

          <img src={user?.photoUrl} alt="User" className={`w-8 h-8 rounded-full border ${isSpark ? 'border-slate-700' : 'border-slate-200'}`} />

          <button onClick={onLogout} className="text-slate-400 hover:text-red-500">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* CONTENT SWITCHER */}
      {isSpark ? (
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
                <div className="w-80 md:w-96 mb-8 transform hover:scale-105 transition-transform duration-500">
                  <VennWidget result={result} />
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
        </main>
      )}

    </div>
  );
};

export default DashboardOS;
