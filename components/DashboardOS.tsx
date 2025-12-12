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

  if (viewMode === 'spark') {
    return (
      <div className="relative">
        {/* Simple Back Navigation for Spark Mode */}
        <div className="fixed bottom-6 left-6 z-50">
          <button
            onClick={() => setViewMode('pathfinder')}
            className="bg-slate-900 text-slate-400 border border-slate-700 px-4 py-2 rounded-full text-xs font-bold hover:text-white hover:border-amber-500 transition-all flex items-center gap-2 shadow-lg"
          >
            ← Return to Pathfinder
          </button>
        </div>
        <SparkDashboard user={user} result={result} ikigaiData={ikigaiData} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 relative">

      {/* Top Bar (Simplified) */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-3 flex justify-between items-center sticky top-0 z-50">
        <div onClick={() => console.log("Logo Click")} className="text-2xl font-serif font-bold text-slate-900 flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
          <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">IK</span>
          <span className="hidden md:inline">Pathfinder</span>
        </div>

        <div className="flex items-center gap-4">
          <nav className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('board')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${activeTab === 'board' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <LayoutGrid size={14} /> Board
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${activeTab === 'tasks' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <CheckSquare size={14} /> Tasks
            </button>
          </nav>

          {/* SPARK TOGGLE (Pro Feature) */}
          <div className="h-6 w-px bg-slate-300 mx-2"></div>
          <button
            onClick={() => isPro ? setViewMode('spark') : onUpgrade()}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${isPro ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:scale-105' : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'}`}
          >
            <Zap size={14} fill={isPro ? "currentColor" : "none"} />
            {isPro ? "Go to Spark" : "Unlock Spark"}
          </button>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden md:flex items-center gap-1 text-[10px] font-bold bg-amber-50 text-amber-600 px-3 py-1 rounded-full border border-amber-100">
            <Crown size={12} fill="currentColor" /> FOUNDER
          </span>
          <div className="flex items-center gap-2">
            <img src={user?.photoUrl} alt="User" className="w-8 h-8 rounded-full border border-slate-200" />
            <button onClick={onLogout} className="text-slate-400 hover:text-red-500">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main OS Canvas */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto relative pb-32">
        {/* pb-32 allows space for fixed bottom bar */}

        {activeTab === 'tasks' ? (
          <div className="max-w-7xl mx-auto h-full p-6">
            <TaskBoard userId={user?.email || 'demo'} />
          </div>
        ) : (
          <div className="max-w-5xl mx-auto flex flex-col items-center gap-12 p-6 md:p-12">

            {/* SECTION 1: HERO (Venn + Headline) */}
            <div className="w-full flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Venn Diagram */}
              <div className="w-80 md:w-96 mb-8 transform hover:scale-105 transition-transform duration-500">
                <VennWidget result={result} />
              </div>

              {/* Headline Statement */}
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
      </main>

      {/* FIXED BOTTOM BAR: Compact Quad Input */}
      <div className="fixed bottom-0 left-0 w-full z-40 px-4 pb-4 pointer-events-none">
        <div className="max-w-3xl mx-auto pointer-events-auto shadow-2xl rounded-2xl overflow-hidden border border-slate-200">
          <QuadInputWidget
            data={ikigaiData}
            onUpdate={setIkigaiData}
            onRegenerate={handleReAnalysis}
            isAnalysing={isAnalysing}
            compact={true} // New Prop for Compact Mode
          />
        </div>
      </div>

      {/* FLOATING CHAT */}
      <FloatingChat
        result={result}
        isPro={isPro}
        user={user}
        ikigaiData={ikigaiData}
        externalContext={launchpadContext}
        onClearContext={() => setLaunchpadContext(null)}
      />

    </div>
  );
};

export default DashboardOS;
