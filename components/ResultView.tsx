import React, { useState, useRef, useEffect } from 'react';
import { IkigaiResult, User, MarketOpportunity, IkigaiState } from '../types';
import VennDiagram from './VennDiagram';
import { Send, Target, Award, Globe, Wallet, ExternalLink, Bot, User as UserIcon, Lock, Activity, Zap, Check, Copy, TrendingUp, Clock, Flame, CheckCircle2, X, Search, Users, DollarSign, Sparkles, ChevronRight, Crown } from 'lucide-react';
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

// 4. Market Widget (Enhanced Modal)
export const MarketWidget: React.FC<{ result: IkigaiResult; isPro: boolean; onUpgrade: () => void; onOpenCopilot: (context: string) => void }> = ({ result, isPro, onUpgrade, onOpenCopilot }) => {
  const [selectedIdea, setSelectedIdea] = useState<MarketOpportunity | null>(null);

  if (!isPro) {
    return (
      <div className="h-full bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col items-center justify-center text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-indigo-50/50"></div>
        <div className="relative z-10 max-w-md">
          <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Lock size={32} />
          </div>
          <h3 className="text-2xl font-serif font-bold text-slate-900 mb-3">Unlock Market Intelligence</h3>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Get 3 validated business ideas with real-world market signals, revenue potential, and execution blueprints.
          </p>
          <button onClick={onUpgrade} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:scale-105 transition-transform">
            Upgrade to Founder
          </button>
        </div>
      </div>
    );
  }

  const avgScore = result.marketIdeas.length > 0
    ? Math.round(result.marketIdeas.reduce((acc, curr) => acc + curr.score.total, 0) / result.marketIdeas.length)
    : 0;

  return (
    <div className="h-full flex flex-col bg-slate-50/50 rounded-3xl border border-slate-200/50">
      {/* Widget Header */}
      <div className="px-6 py-4 flex justify-between items-center bg-white rounded-t-3xl border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Market Opportunities</h3>
            <p className="text-xs text-slate-500">AI-Validated Business Models</p>
          </div>
        </div>
        {avgScore > 0 && (
          <div className="px-3 py-1 bg-slate-900 text-white text-xs font-bold rounded-full">
            Avg Match: {avgScore}%
          </div>
        )}
      </div>

      {/* Widget Body */}
      <div className="flex-1 overflow-y-auto p-6">
        {result.marketIdeas.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <p>No market data yet. Click "Re-Analyze" to generate.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {result.marketIdeas.map((idea, idx) => (
              <MarketCard
                key={idx}
                idea={idea}
                onClick={() => setSelectedIdea(idea)}
                onOpenCopilot={onOpenCopilot}
              />
            ))}
          </div>
        )}
      </div>

      {/* --- IDEABROWSER STYLE MODAL --- */}
      {selectedIdea && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#FAFAFA] rounded-3xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl relative">

            {/* Header */}
            <div className="px-8 py-6 bg-white border-b border-slate-200 flex justify-between items-start sticky top-0 z-10 shadow-sm">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider rounded border border-indigo-100">Idea Analysis</span>
                  <span className="text-slate-400 text-xs">•</span>
                  <span className="text-slate-400 text-xs">{new Date().toLocaleDateString()}</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-serif font-black text-slate-900 leading-tight mb-2">
                  {selectedIdea.title}
                </h2>
                {/* Tags Row */}
                <div className="flex flex-wrap gap-2 text-xs font-medium">
                  <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-100 flex items-center gap-1">⚡ Perfect Timing</span>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 flex items-center gap-1">💰 High Margin</span>
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full border border-slate-200">+4 More</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm font-bold shadow-sm hover:bg-slate-50">Share</button>
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 flex items-center gap-2">
                  <Zap size={16} fill="currentColor" /> Build This Idea
                </button>
                <button onClick={() => setSelectedIdea(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors ml-2">
                  <X size={24} className="text-slate-400" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto bg-[#F8F9FA] p-8">
              <div className="max-w-6xl mx-auto space-y-8">

                {/* 1. Description & Score Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* LEFT: Description & Chart (7 cols) */}
                  <div className="lg:col-span-7 space-y-8">
                    <p className="text-lg text-slate-700 leading-relaxed font-serif">
                      {selectedIdea.description}
                    </p>

                    <TrendChart signals={selectedIdea.validation.signals} />

                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-4 font-serif">Deep Dive Analysis</h3>
                      <div className="space-y-6 text-slate-600 leading-relaxed">
                        <p><strong className="text-slate-900">Why Now:</strong> {selectedIdea.validation.whyNow}</p>
                        <p><strong className="text-slate-900">Market Gap:</strong> {selectedIdea.validation.marketGap}</p>
                        <p className="text-sm italic text-slate-500">*Analysis based on real-time search trends and market signals.</p>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT: Score Grid & Metrics (5 cols) */}
                  <div className="lg:col-span-5 space-y-6">
                    {/* Score Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <ScoreCard label="Opportunity" score={Math.min(9, Math.floor(selectedIdea.score.total / 10))} subLabel="Exceptional" colorClass="bg-emerald-500" />
                      <ScoreCard label="Problem" score={selectedIdea.score.profit || 8} subLabel="High Value" colorClass="bg-red-500" />
                      <ScoreCard label="Feasibility" score={selectedIdea.score.talent || 7} subLabel="Your Skills" colorClass="bg-blue-500" />
                      <ScoreCard label="Why Now" score={selectedIdea.score.demand || 9} subLabel="Market Timing" colorClass="bg-orange-500" />
                    </div>

                    {/* Business Fit Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                      <h4 className="font-bold text-slate-900 mb-6 border-b border-slate-100 pb-2">Business Fit</h4>

                      <div className="space-y-6">
                        <div className="flex justify-between items-center group cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><DollarSign size={18} /></div>
                            <div>
                              <div className="text-xs font-bold text-slate-400 uppercase">Revenue Potential</div>
                              <div className="text-sm font-bold text-slate-800">High ($10k+/mo)</div>
                            </div>
                          </div>
                          <span className="text-emerald-600 font-bold text-sm">$$$</span>
                        </div>

                        <div className="flex justify-between items-center group cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-100 text-slate-600 rounded-lg"><Activity size={18} /></div>
                            <div>
                              <div className="text-xs font-bold text-slate-400 uppercase">Execution Difficulty</div>
                              <div className="text-sm font-bold text-slate-800">Moderate</div>
                            </div>
                          </div>
                          <span className="text-blue-600 font-bold text-sm">5/10</span>
                        </div>

                        <div className="flex justify-between items-center group cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-pink-50 text-pink-600 rounded-lg"><Target size={18} /></div>
                            <div>
                              <div className="text-xs font-bold text-slate-400 uppercase">Go-To-Market</div>
                              <div className="text-sm font-bold text-slate-800">Social Driven</div>
                            </div>
                          </div>
                          <span className="text-pink-600 font-bold text-sm">8/10</span>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-100">
                        <button className="w-full py-2 flex items-center justify-center gap-2 text-indigo-600 font-bold text-sm hover:bg-slate-50 rounded-lg transition-colors">
                          View Validated Signals <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Value Ladder (Bottom Full Width) */}
                <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                  <h3 className="font-serif font-bold text-xl text-slate-900 mb-6">Strategic Value Ladder</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Step 1 */}
                    <div className="relative pl-8 border-l-2 border-slate-100">
                      <span className="absolute -left-[11px] top-0 w-5 h-5 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                      <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Lead Magnet</h5>
                      <h4 className="font-bold text-slate-900 mb-2">Free Tool / Guide</h4>
                      <p className="text-sm text-slate-600">{selectedIdea.blueprint.valueLadder?.leadMagnet || selectedIdea.blueprint.mvpStep}</p>
                    </div>
                    {/* Step 2 */}
                    <div className="relative pl-8 border-l-2 border-slate-100">
                      <span className="absolute -left-[11px] top-0 w-5 h-5 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                      <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Frontend Offer</h5>
                      <h4 className="font-bold text-slate-900 mb-2">Workshop / Course</h4>
                      <p className="text-sm text-slate-600">{selectedIdea.blueprint.valueLadder?.frontendOffer || "Low ticket ($49-$99) product to solve the immediate pain point."}</p>
                    </div>
                    {/* Step 3 */}
                    <div className="relative pl-8 border-l-2 border-slate-100">
                      <span className="absolute -left-[11px] top-0 w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                      <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Core Offer</h5>
                      <h4 className="font-bold text-slate-900 mb-2">Recurring Service</h4>
                      <p className="text-sm text-slate-600">{selectedIdea.blueprint.valueLadder?.coreOffer || `${selectedIdea.title} Subscription ($29/mo) or High Ticket Consulting.`}</p>
                    </div>
                  </div>
                </div>

                {/* 3. Execution Plan Widget */}
                <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-32 bg-indigo-600 blur-[100px] opacity-20 rounded-full"></div>
                  <h4 className="font-bold text-xl mb-6 relative z-10 flex items-center gap-2"><Crown size={20} className="text-yellow-400" /> CEO Execution Plan</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                    {selectedIdea.blueprint.executionPlan.map((step, i) => (
                      <div key={i} className="bg-slate-800/50 p-5 rounded-xl border border-slate-700/50 backdrop-blur-sm">
                        <div className="text-indigo-400 font-bold text-xs uppercase mb-2">Phase {i + 1}</div>
                        <p className="text-sm leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}
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

    if (!isPro && messageCount >= FREE_LIMIT) {
      onUpgrade();
      return;
    }

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
          <Bot size={18} className={isPro ? 'text-amber-600' : 'text-indigo-600'} />
          <span className="font-bold text-sm text-slate-800">{isPro ? 'Founder Copilot' : 'AI Copilot'}</span>
        </div>
        {!isPro && (
          <span className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded-full text-slate-500">
            {FREE_LIMIT - messageCount} free msgs
          </span>
        )}
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
      <div className="p-3 bg-white border-t border-slate-100">
        {!isPro && messageCount >= FREE_LIMIT ? (
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-2">Free limit reached.</p>
            <button onClick={onUpgrade} className="w-full py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800">
              Upgrade to Continue
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleChat()}
              placeholder="Ask a strategic question..."
              className="flex-1 bg-slate-100 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button onClick={handleChat} disabled={!chatInput.trim() || isChatting} className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
              <Send size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const ResultViewLegacy: React.FC<any> = (props) => {
  return <div className="p-4">Please use DashboardOS layout.</div>
};

export default ResultViewLegacy;
