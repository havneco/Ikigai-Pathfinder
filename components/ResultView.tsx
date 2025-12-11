import React, { useState, useRef, useEffect } from 'react';
import { IkigaiResult, User, MarketOpportunity, IkigaiState } from '../types';
import VennDiagram from './VennDiagram';
import { Send, Target, Award, Globe, Wallet, ExternalLink, Bot, User as UserIcon, Lock, Activity, Zap, Check, Copy, TrendingUp, Clock, Flame, CheckCircle2, X, Search, Users, DollarSign, Sparkles, ChevronRight, Crown, Loader2 } from 'lucide-react';
import { chatWithCopilot } from '../services/geminiService';
import MarketCard from './MarketCard';
import ReactMarkdown from 'react-markdown';

// Wrapper for Stripe Button
const StripeBuyButton = (props: any) => React.createElement('stripe-buy-button', props);

// Helper Components
const MarkdownText = ({ content }: { content: string }) => {
  const lines = content.split('\n');
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-2" />;
        if (trimmed.startsWith('### ')) return <h3 key={i} className="text-sm font-bold text-indigo-900 mt-2">{formatInline(trimmed.slice(4))}</h3>;
        if (trimmed.startsWith('## ')) return <h2 key={i} className="text-base font-bold text-indigo-900 mt-2">{formatInline(trimmed.slice(3))}</h2>;
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return <div key={i} className="flex gap-2 ml-2"><span className="text-indigo-500 mt-1.5">•</span><span className="flex-1">{formatInline(trimmed.slice(2))}</span></div>;
        }
        return <p key={i} className="leading-relaxed">{formatInline(line)}</p>;
      })}
    </div>
  );
};

const formatInline = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={index} className="font-bold text-slate-800">{part.slice(2, -2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*')) return <em key={index} className="italic">{part.slice(1, -1)}</em>;
    return part;
  });
};

const ScoreBar = ({ label, value, color }: { label: string, value: number, color: string }) => (
  <div className="mb-2">
    <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
      <span>{label}</span>
      <span>{value}/10</span>
    </div>
    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-1000 ${color}`} style={{ width: `${value * 10}%` }}></div>
    </div>
  </div>
);

// --- WIDGET EXPORTS ---

// 1. Statement Widget
export const StatementWidget = ({ result }: { result: IkigaiResult }) => (
  <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100 h-full flex flex-col justify-center text-center relative overflow-hidden group">
    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-400 via-teal-400 to-amber-400"></div>
    <h2 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-2">Your Ikigai Is</h2>
    <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 mb-4 leading-tight">
      {result.statement}
    </h1>
    <p className="text-slate-600 text-sm leading-relaxed italic">
      "{result.description}"
    </p>
  </div>
);

// 2. Venn Widget
export const VennWidget = ({ result }: { result: IkigaiResult }) => (
  <div className="bg-white rounded-3xl p-4 shadow-lg border border-slate-100 h-full flex items-center justify-center">
    <VennDiagram
      activeSection="center"
      labels={{
        passion: result.intersectionPoints.passion,
        mission: result.intersectionPoints.mission,
        profession: result.intersectionPoints.profession,
        vocation: result.intersectionPoints.vocation,
        ikigai: result.statement
      }}
    />
  </div>
);

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div>
    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">{title}</h4>
    {children}
  </div>
);

// --- HELPER: Trend Chart (Dynamic) ---
const TrendChart = ({ signals }: { signals?: { type: string, value: string, description: string }[] }) => {
  // Default fallback if no signals
  const primarySignal = signals?.[0] || { value: "+122% Growth", description: "Search Interest" };

  return (
    <div className="w-full h-64 bg-white rounded-2xl border border-slate-100 p-6 relative overflow-hidden">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-baseline gap-3">
          <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">{primarySignal.description}</h4>
          <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-xs font-bold">{primarySignal.value}</span>
        </div>
        <div className="text-2nd text-slate-400 text-xs">Past 12 Months</div>
      </div>

      {/* Chart Area */}
      <div className="relative h-40 w-full">
        {/* Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between text-slate-300">
          <div className="border-t border-dashed border-slate-100 w-full h-0"></div>
          <div className="border-t border-dashed border-slate-100 w-full h-0"></div>
          <div className="border-t border-dashed border-slate-100 w-full h-0"></div>
        </div>

        {/* The Line (Simulated Path) */}
        <svg viewBox="0 0 100 40" className="w-full h-full absolute inset-0 overflow-visible" preserveAspectRatio="none">
          <defs>
            <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0,35 Q10,35 15,25 T30,30 T45,15 T60,25 T75,10 T90,5 L100,2"
            fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          <path d="M0,35 Q10,35 15,25 T30,30 T45,15 T60,25 T75,10 T90,5 L100,2 V40 H0 Z"
            fill="url(#gradient)" stroke="none"
          />
        </svg>
      </div>

      {/* X-Axis */}
      <div className="flex justify-between mt-2 text-xs text-slate-400 font-medium">
        <span>2022</span>
        <span>2023</span>
        <span>2024</span>
        <span>2025</span>
      </div>
    </div>
  );
};

// --- HELPER: Score Card ---
const ScoreCard = ({ label, score, colorClass, subLabel }: any) => (
  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between h-28 relative overflow-hidden group hover:shadow-md transition-all">
    <div className={`absolute top-0 left-0 w-1 h-full ${colorClass}`}></div>
    <div className="flex justify-between items-start">
      <h5 className="text-sm font-bold text-slate-700">{label}</h5>
      <span className="text-xs text-slate-400 cursor-help">ⓘ</span>
    </div>
    <div>
      <div className="text-3xl font-serif font-bold text-slate-900 mb-1">{score}</div>
      <div className="text-xs font-medium text-slate-500">{subLabel}</div>
    </div>
    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
      <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${score * 10}%` }}></div>
    </div>
  </div>
);

// 4. Market Widget (Tabbed Interface)
export const MarketWidget: React.FC<{ result: IkigaiResult; isPro: boolean; onUpgrade: () => void; onOpenCopilot: (context: string) => void }> = ({ result, isPro, onUpgrade, onOpenCopilot }) => {
  const [activeTab, setActiveTab] = useState(0);

  if (!result.marketIdeas || result.marketIdeas.length === 0) {
    // Loading / Empty State
    return (
      <div className="w-full bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm animate-pulse">
        <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto mb-4"></div>
        <h3 className="text-lg font-bold text-slate-300">Generating Opportunities...</h3>
      </div>
    );
  }

  const selectedIdea = result.marketIdeas[activeTab];

  return (
    <div className="w-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col min-h-[600px]">

      {/* TABS HEADER */}
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-md"><Sparkles size={18} /></div>
          <span className="font-bold text-slate-900 tracking-tight">Market Opportunities</span>
        </div>

        <div className="flex p-1 bg-slate-200/50 rounded-xl">
          {result.marketIdeas.map((idea, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === idx
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              Option {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT AREA (IdeaBrowser Inline) */}
      <div className="flex-1 p-6 md:p-8 bg-slate-50/30">

        {/* Title & Tags */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider rounded">
              Score: {selectedIdea.score?.total || 0}/100
            </span>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded">
              {selectedIdea.analysisStatus ? (
                <span className="flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> {selectedIdea.analysisStatus}</span>
              ) : (
                selectedIdea.validation?.revenuePotential || "High Revenue"
              )}
            </span>
          </div>
          <h2 className="text-3xl font-serif font-black text-slate-900 leading-tight mb-2">
            {selectedIdea.title}
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed font-serif max-w-4xl">
            {selectedIdea.description}
          </p>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

          {/* LEFT: Charts & Analysis (7 cols) */}
          <div className="xl:col-span-7 space-y-8">
            {/* Trend Chart */}
            <TrendChart signals={selectedIdea.validation?.signals || []} />

            {/* Deep Dive Text */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-4">Strategic Validation</h3>
              <div className="space-y-4 text-sm text-slate-600">
                <div className="flex gap-4">
                  <div className="min-w-[4px] bg-orange-400 rounded-full"></div>
                  <div>
                    <strong className="block text-slate-900 mb-1">Why Now?</strong>
                    {selectedIdea.validation?.whyNow || "Analyzing market timing..."}
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="min-w-[4px] bg-blue-400 rounded-full"></div>
                  <div>
                    <strong className="block text-slate-900 mb-1">Market Gap</strong>
                    {selectedIdea.validation?.marketGap || "Searching for blue ocean..."}
                  </div>
                </div>
              </div>
            </div>

            {/* The Wedge (Actionable) */}
            <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl">
              <div className="flex items-center gap-2 mb-2 text-indigo-700 font-bold text-xs uppercase tracking-widest">
                <Zap size={14} /> The Wedge (Entry Point)
              </div>
              <p className="text-indigo-900 italic font-medium">
                "{selectedIdea.blueprint?.theWedge || "Calculating entry strategy..."}"
              </p>
            </div>
          </div>

          {/* RIGHT: Scorecards & Plan (5 cols) */}
          <div className="xl:col-span-5 space-y-6">

            {/* Score Grid */}
            <div className="grid grid-cols-2 gap-3">
              <ScoreCard label="Demand" score={selectedIdea.score.demand} subLabel="Market Pull" colorClass="bg-orange-500" />
              <ScoreCard label="Profit" score={selectedIdea.score.profit} subLabel="Margins" colorClass="bg-emerald-500" />
              <ScoreCard label="Talent" score={selectedIdea.score.talent} subLabel="Founder Fit" colorClass="bg-blue-500" />
              <ScoreCard label="Viability" score={selectedIdea.score.complexity ? 10 - selectedIdea.score.complexity : 8} subLabel="Ease of Build" colorClass="bg-purple-500" />
            </div>

            {/* Execution Plan (Condensed) */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl">
              <h4 className="font-bold flex items-center gap-2 mb-4 border-b border-slate-700 pb-2">
                <Crown size={18} className="text-yellow-400" /> Execution Roadmap
              </h4>
              <div className="space-y-4">
                {selectedIdea.blueprint.executionPlan.slice(0, 3).map((step, i) => (
                  <div key={i} className="flex gap-3 items-start text-sm">
                    <span className="text-slate-500 font-mono">0{i + 1}</span>
                    <p className="text-slate-300">{step}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => onOpenCopilot(`Initialize Launchpad for: ${selectedIdea.title}`)}
                className="w-full mt-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Bot size={16} /> Initialize Launchpad
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

// 5. Chat Widget
// 5. Chat Widget
export const ChatWidget = ({ result, isPro, onUpgrade, user, slotsLeft = 7, ikigaiData, externalContext }: { result: IkigaiResult, isPro: boolean, onUpgrade: () => void, user: User | null, slotsLeft?: number, ikigaiData: IkigaiState, externalContext?: string | null }) => {
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [isChatting, setIsChatting] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const FREE_LIMIT = 3;

  // Handle External Context (Launchpad)
  useEffect(() => {
    if (externalContext) {
      handleChat(externalContext);
    }
  }, [externalContext]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isChatting]);

  const handleChat = async (overrideInput?: string) => {
    const textToSend = overrideInput || chatInput;
    if (!textToSend.trim()) return;

    if (!overrideInput) setChatInput(''); // Only clear input if manual
    setMessageCount(prev => prev + 1);

    // Don't show the massive raw Launchpad system prompt in UI if it's an override
    const displayMsg = overrideInput ? "🚀 Initializing Launchpad Strategy..." : textToSend;

    setChatHistory(prev => [...prev, { role: 'user', text: displayMsg }]);
    setIsChatting(true);

    try {
      // If overrideInput is present, it contains the full prompt including the "INITIALIZING LAUNCHPAD" keyword
      const historyForApi = chatHistory.map(h => ({ role: h.role, parts: [{ text: h.text }] }));
      const response = await chatWithCopilot(historyForApi, textToSend, result, ikigaiData, user?.name);

      setChatHistory(prev => [...prev, { role: 'model', text: response }]);
    } catch (e) {
      console.error(e);
      setChatHistory(prev => [...prev, { role: 'model', text: "Error connecting to Copilot." }]);
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div className="h-full bg-white rounded-3xl shadow-lg border border-slate-100 flex flex-col overflow-hidden relative">
      {/* Header */}
      <div className={`px-4 py-3 border-b flex justify-between items-center ${isPro ? 'bg-gradient-to-r from-amber-50 to-orange-50' : 'bg-slate-50'}`}>
        <div className="flex items-center gap-2">
          <Bot size={18} className='text-amber-600' />
          <span className="font-bold text-sm text-slate-800">Founder Copilot</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30 widget-scroll">
        {chatHistory.length === 0 && (
          <div className="text-center text-slate-400 text-xs mt-10">
            <p>Ask me how to execute your plan.</p>
            <p className="mt-2">"How do I start being a {result.marketIdeas?.[0]?.title || 'Professional'}?"</p>
          </div>
        )}
        {chatHistory.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-800 text-white' : 'bg-indigo-600 text-white'}`}>
              {msg.role === 'user' ? <UserIcon size={12} /> : <Bot size={12} />}
            </div>
            <div className={`p-3 rounded-xl max-w-[85%] text-xs shadow-sm leading-relaxed ${msg.role === 'user' ? 'bg-slate-800 text-white' : 'bg-white border border-slate-100 text-slate-700'
              }`}>
              <MarkdownText content={msg.text} />
            </div>
          </div>
        ))}
        {isChatting && (
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white"><Bot size={12} /></div>
            <div className="bg-white border border-slate-100 p-3 rounded-xl text-xs text-slate-400">Thinking...</div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input / Upgrade Overlay */}
      {/* Input Overlay */}
      <div className="p-3 bg-white border-t border-slate-100">
        <div className="flex gap-2">
          <input
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleChat()}
            placeholder="Ask a strategic question..."
            className="flex-1 bg-slate-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button onClick={() => handleChat()} disabled={!chatInput.trim() || isChatting} className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

const ResultViewLegacy: React.FC<any> = (props) => {
  return <div className="p-4">Please use DashboardOS layout.</div>
};

export default ResultViewLegacy;
