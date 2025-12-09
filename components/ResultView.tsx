
import React, { useState, useRef, useEffect } from 'react';
import { IkigaiResult, User, MarketOpportunity, IkigaiState } from '../types';
import VennDiagram from './VennDiagram';
import { Send, Target, Award, Globe, Wallet, ExternalLink, Bot, User as UserIcon, Lock, Activity, Zap, Check, Copy, TrendingUp, Clock, Flame, CheckCircle2, X, Search, Users, DollarSign } from 'lucide-react';
import { chatWithCopilot } from '../services/geminiService';

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

// 3. Market Idea Card (Deep IdeaBrowser Style)
const MarketCard = ({ idea, isPro, onUpgrade }: { idea: MarketOpportunity, isPro: boolean, onUpgrade: () => void }) => {
  const [copied, setCopied] = useState<string | null>(null);

  <p className="text-[10px] text-slate-400">{action.tool}</p>
                      </div >
  {
    isPro?(
                          <button onClick = {() => copyToClipboard(action.prompt, `p-${i}`)} className = "text-slate-400 hover:text-indigo-600" >
  { copied === `p-${i}` ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                          </button >
                      ) : <Lock size={12} className="text-gray-300" />}
                   </div >
                ))}
             </div >
  {!isPro && (
    <button onClick={onUpgrade} className="w-full mt-2 text-xs bg-slate-900 text-white py-1.5 rounded-lg font-bold">Unlock Prompts</button>
  )}
          </div >
       </div >
    </div >
  );
};

// 4. Market Widget
export const MarketWidget = ({ result, isPro, onUpgrade }: { result: IkigaiResult, isPro: boolean, onUpgrade: () => void }) => {
  const [index, setIndex] = useState(0);
  const ideas = result.marketIdeas || [];

  if (ideas.length === 0) return (
    <div className="h-full bg-white rounded-3xl shadow-lg border border-slate-100 p-6 flex items-center justify-center text-center">
      <div>
        <Search size={32} className="text-slate-300 mx-auto mb-2" />
        <p className="text-slate-400 text-sm">No market validation found.</p>
      </div>
    </div>
  );

  const currentIdea = ideas[index];

  return (
    <div className="h-full flex flex-col bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
      <div className="p-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Market Opportunities</h3>
        <div className="flex gap-1">
          {ideas.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === index ? 'bg-indigo-600 w-4' : 'bg-slate-300'}`}
            />
          ))}
        </div>
      </div>
      <div className="flex-1 p-3 bg-slate-50/50 overflow-hidden">
        {currentIdea ? (
          <MarketCard idea={currentIdea} isPro={isPro} onUpgrade={onUpgrade} />
        ) : (
          <div className="flex items-center justify-center h-full text-xs text-slate-400">Select an opportunity</div>
        )}
      </div>
    </div>
  );
};

// 5. Chat Widget
export const ChatWidget = ({ result, isPro, onUpgrade, user, slotsLeft = 7, ikigaiData }: { result: IkigaiResult, isPro: boolean, onUpgrade: () => void, user: User | null, slotsLeft?: number, ikigaiData: IkigaiState }) => {
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [isChatting, setIsChatting] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const FREE_LIMIT = 3;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isChatting]);

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    if (!isPro && messageCount >= FREE_LIMIT) {
      onUpgrade();
      return;
    }

    const userMsg = chatInput;
    setChatInput('');
    setMessageCount(prev => prev + 1);
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatting(true);

    try {
      const historyForApi = chatHistory.map(h => ({ role: h.role, parts: [{ text: h.text }] }));
      const response = await chatWithCopilot(historyForApi, userMsg, result, ikigaiData, user?.name);
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
