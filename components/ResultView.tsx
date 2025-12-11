import React, { useState, useRef, useEffect } from 'react';
import { IkigaiResult, User, MarketOpportunity, IkigaiState } from '../types';
import VennDiagram from './VennDiagram';
import { Send, Target, Award, Globe, Wallet, ExternalLink, Bot, User as UserIcon, Lock, Activity, Zap, Check, Copy, TrendingUp, Clock, Flame, CheckCircle2, X, Search, Users, DollarSign, Sparkles, ChevronRight, Crown, Loader2, Printer } from 'lucide-react';
import { chatWithCopilot } from '../services/geminiService';
import MarketCard from './MarketCard';
import FinancialSimulator from './FinancialSimulator';
import CompetitorWidget from './CompetitorWidget';
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
const TrendChart = ({ signals, data }: { signals?: { type: string, value: string, description: string }[], data?: number[] }) => {
  const TrendChart = ({ signals, data }: { signals: any[], data?: number[] }) => {
    const points = data && data.length > 0 ? data : [20, 25, 30, 45, 40, 50, 60, 65, 80, 85, 90, 100];

    // Bezier Smoothing Logic
    const generateCurve = (points: number[]) => {
      // Normalization
      const height = 100; // SVG space
      const width = 300;
      const max = Math.max(...points, 100);

      const formatted = points.map((p, i) => ({
        x: (i / (points.length - 1)) * width,
        y: height - (p / max) * height * 0.8 - 10 // Padding
      }));

      // Build Curve (Catmull-Rom or Cubic Spline simplified)
      // First point
      let d = `M ${formatted[0].x},${formatted[0].y}`;

      for (let i = 0; i < formatted.length - 1; i++) {
        const p0 = i > 0 ? formatted[i - 1] : formatted[i];
        const p1 = formatted[i];
        const p2 = formatted[i + 1];
        const p3 = i < formatted.length - 2 ? formatted[i + 2] : p2;

        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;

        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
      }

      // Fill Path (Line + corners to bottom)
      const fillPath = `${d} L ${width},${height} L 0,${height} Z`;

      return { line: d, fill: fillPath };
    };

    const { line, fill } = generateCurve(points);

    // Select signals
    const displayedSignals = signals && signals.length > 0 ? signals.slice(0, 2) : [{ type: "Growth", value: "+122%", description: "Search Interest" }];

    return (
      <div className="w-full h-72 glass-card rounded-3xl p-8 isolate">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 relative z-10">
          <div className="flex gap-10">
            {displayedSignals.map((sig, i) => (
              <div key={i}>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{sig.type || "Metric"}</div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-slate-800 tracking-tight">{sig.value}</span>
                  {(sig as any).source && (
                    <a href={(sig as any).source} target="_blank" rel="noopener noreferrer" className="bg-indigo-50 text-indigo-500 hover:bg-indigo-100 p-1 rounded-full transition-colors" title="View Source">
                      <ExternalLink size={10} />
                    </a>
                  )}
                </div>
                <div className="text-xs text-slate-400 font-medium mt-0.5 truncate max-w-[120px]" title={sig.description}>{sig.description}</div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            <TrendingUp size={14} /> 1 Year Trend
          </div>
        </div>

        {/* CHART SVG */}
        <div className="absolute bottom-0 left-0 right-0 h-48 w-full">
          <svg viewBox="0 0 300 100" preserveAspectRatio="none" className="w-full h-full">
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Area Fill */}
            <path d={fill} fill="url(#gradient)" />
            {/* Line */}
            <path d={line} fill="none" stroke="#6366f1" strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
          </svg>

          {/* X-Axis Labels */}
          <div className="absolute bottom-2 inset-x-0 flex justify-between px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>12mo Ago</span>
            <span>Now</span>
          </div>
        </div>
      </div>
    );
  };

  // --- HELPER: Score Card ---
  const ScoreCard = ({ label, score, colorClass, subLabel, explanation }: any) => (
    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between h-28 relative overflow-hidden group hover:shadow-md transition-all">
      <div className={`absolute top-0 left-0 w-1 h-full ${colorClass}`}></div>
      <div className="flex justify-between items-start">
        <h5 className="text-sm font-bold text-slate-700">{label}</h5>
        <span className="text-xs text-slate-400 cursor-help" title={explanation || `${label} Score: ${score}/10. Represents ${subLabel}.`}>ⓘ</span>
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

          <button
            onClick={() => window.print()}
            className="ml-auto hidden md:flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:border-slate-400 hover:text-slate-900 transition-colors shadow-sm print:hidden"
          >
            <Printer size={14} /> Save Plan
          </button>
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
            {/* Trend Chart */}
            <TrendChart signals={selectedIdea.validation?.signals || []} data={selectedIdea.validation?.trendCurve} />

            {/* The Wedge (Moved to Bottom) */}
          </div>

          {/* RIGHT: Scorecards & Plan (5 cols) */}
          <div className="xl:col-span-5 space-y-6">

            {/* Score Grid */}
            <div className="grid grid-cols-2 gap-3">
              <ScoreCard label="Demand" score={selectedIdea.score.demand} subLabel="Market Pull" colorClass="bg-orange-500" explanation={selectedIdea.score.explanations?.demand} />
              <ScoreCard label="Profit" score={selectedIdea.score.profit} subLabel="Margins" colorClass="bg-emerald-500" explanation={selectedIdea.score.explanations?.profit} />
              <ScoreCard label="Talent" score={selectedIdea.score.talent} subLabel="Founder Fit" colorClass="bg-blue-500" explanation={selectedIdea.score.explanations?.talent} />
              <ScoreCard label="Viability" score={selectedIdea.score.complexity ? 10 - selectedIdea.score.complexity : 8} subLabel="Ease of Build" colorClass="bg-purple-500" explanation={selectedIdea.score.explanations?.complexity} />
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

        {/* THE WEDGE (Bottom Full Width) */}
        <div className="mt-8 bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 p-8 rounded-3xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100/50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

          {/* Cute Pie Visual (Left) */}
          <div className="w-32 h-32 shrink-0 relative animate-in zoom-in duration-700">
            {/* SVG Pie Chart */}
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl transform rotate-12 hover:rotate-0 transition-transform duration-500">
              <circle cx="50" cy="50" r="45" fill="#fff" stroke="#e2e8f0" strokeWidth="2" />
              {/* The Slice (20% wedge) */}
              <path d="M50,50 L50,5 A45,45 0 0,1 93,20 z" fill="#4f46e5" stroke="white" strokeWidth="2" />
              {/* Center Dot */}
              <circle cx="50" cy="50" r="6" fill="#312e81" />
            </svg>
            <div className="absolute top-0 right-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg transform translate-x-1/2 -translate-y-1/2">
              START HERE
            </div>
          </div>

          {/* FULL WIDTH: Strategic Analysis Stack */}
          <div className="space-y-8 mt-12 mb-12">

            {/* 1. Competitors (The Fight) */}
            <CompetitorWidget competitors={selectedIdea.validation?.competitors} />

            {/* 2. Strategic Validation (Deep Dive) */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-6 text-lg">Strategic Validation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-slate-600">
                <div className="flex gap-4">
                  <div className="min-w-[4px] bg-orange-400 rounded-full h-full"></div>
                  <div>
                    <strong className="block text-slate-900 mb-2 text-base">Why Now?</strong>
                    <p className="leading-relaxed">{selectedIdea.validation?.whyNow || "Analyzing market timing..."}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="min-w-[4px] bg-blue-400 rounded-full h-full"></div>
                  <div>
                    <strong className="block text-slate-900 mb-2 text-base">The Market Gap</strong>
                    <p className="leading-relaxed">{selectedIdea.validation?.marketGap || "Searching for blue ocean..."}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. The Plan ($10k/mo) */}
            <FinancialSimulator
              initialPrice={selectedIdea.blueprint?.pricing?.minPrice || 50}
              initialConversion={selectedIdea.blueprint?.pricing?.estimatedConversion || 0.02}
              model={selectedIdea.blueprint?.pricing?.model || "Subscription"}
            />

          </div>

          {/* Content */}
          <div className="flex-1 relative z-10 text-center md:text-left">
            <div className="inline-flex items-center gap-2 mb-3 text-indigo-700 font-bold text-xs uppercase tracking-widest bg-indigo-100/50 px-3 py-1 rounded-full">
              <Zap size={14} /> The Wedge Strategy
            </div>
            <h3 className="text-2xl font-serif font-bold text-indigo-900 mb-3">
              Your "Trojan Horse" into the Market
            </h3>
            <p className="text-lg text-slate-600 leading-relaxed font-medium italic">
              "{selectedIdea.blueprint?.theWedge || "Calculating entry strategy..."}"
            </p>
          </div>
        </div>

      </div>

    </div >
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
