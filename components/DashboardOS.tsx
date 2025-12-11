
import React, { useState } from 'react';
import { IkigaiState, IkigaiResult, User } from '../types';
import { StatementWidget, VennWidget, MarketWidget, ChatWidget } from './ResultView';
import QuadInputWidget from './QuadInputWidget';
import TaskBoard from './TaskBoard';
import { Crown, LogOut, LayoutGrid, CheckSquare, RefreshCcw } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">

      {/* Top Bar (OS Header) */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-serif font-bold text-lg shadow-md">IK</div>

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
        </div>

        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-50 text-amber-600 px-3 py-1 rounded-full border border-amber-100">
            <Crown size={12} fill="currentColor" /> FOUNDER
          </span>

          <div className="h-6 w-px bg-slate-200"></div>

          <div className="flex items-center gap-2">
            <img src={user?.photoUrl} alt="User" className="w-8 h-8 rounded-full border border-slate-200" />
            <button onClick={onLogout} className="text-slate-400 hover:text-red-500">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main OS Canvas */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 relative">

        {activeTab === 'tasks' ? (
          <div className="max-w-7xl mx-auto h-full">
            <TaskBoard userId={user?.email || 'demo'} /> {/* Use email as ID fallback for MVP */}
          </div>
        ) : (
          /* STATIC CSS GRID LAYOUT - ROBUST & CLEAN */
          <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-fr">

            {/* ROW 1 */}

            {/* Statement: Top Left (3 cols) */}
            <div className="md:col-span-3 min-h-[450px] flex flex-col">
              <StatementWidget result={result} />
            </div>

            {/* Venn: Top Center (4 cols) */}
            <div className="md:col-span-4 min-h-[450px] flex flex-col">
              <VennWidget result={result} />
            </div>

            {/* Chat: Top Right (5 cols) */}
            <div className="md:col-span-5 min-h-[450px] flex flex-col">
              <ChatWidget
                result={result}
                isPro={isPro}
                onUpgrade={onUpgrade}
                user={user}
                slotsLeft={slotsLeft}
                ikigaiData={ikigaiData}
                externalContext={launchpadContext}
              />
            </div>

            {/* ROW 2 */}

            {/* Market Ideas: Full Width (12 cols) for better readability */}
            <div className="md:col-span-12 min-h-[500px] flex flex-col">
              <MarketWidget result={result} isPro={isPro} onUpgrade={onUpgrade} onOpenCopilot={setLaunchpadContext} />
            </div>

            {/* ROW 3 */}

            {/* Quad Editor: Full Width (12 cols) */}
            <div className="md:col-span-12 min-h-[500px] flex flex-col">
              <QuadInputWidget
                data={ikigaiData}
                onUpdate={setIkigaiData}
                onRegenerate={handleReAnalysis}
                isAnalysing={isAnalysing}
              />
            </div>

          </div>
        )}
      </main>

    </div>
  );
};

export default DashboardOS;
