import React, { useState } from 'react';
import { X, Crown, TrendingUp, Zap, Target, ArrowRight, ShieldCheck, DollarSign, Bot } from 'lucide-react';
import { MarketOpportunity, IkigaiState } from '../types';
import { WedgeCard } from './WedgeCard';
import FinancialSimulator from './FinancialSimulator';
import CompetitorWidget from './CompetitorWidget';

interface BlueprintModalProps {
    idea: MarketOpportunity;
    isOpen: boolean;
    onClose: () => void;
    onOpenCopilot: (context: string) => void;
}

export const BlueprintModal: React.FC<BlueprintModalProps> = ({ idea, isOpen, onClose, onOpenCopilot }) => {
    const [isRoasting, setIsRoasting] = useState(false);
    const [roastResponse, setRoastResponse] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleRoast = () => {
        setIsRoasting(true);
        setRoastResponse(null);
        onClose();
        // Generate a skeptical investor prompt
        const roastPrompt = `🔥 ROAST MODE ACTIVATED 🔥

You are a skeptical Silicon Valley investor who has seen 10,000 pitches. Your job is to find the 5 biggest weaknesses in this idea:

**Idea:** ${idea.title}
**Description:** ${idea.description}
**Market Gap:** ${idea.validation?.marketGap || "Not specified"}
**Revenue Model:** ${idea.blueprint?.pricing?.model || "Not specified"}

Be brutally honest but constructive. For each weakness:
1. State the problem clearly
2. Explain why it's a risk
3. Suggest how to mitigate it

End with an overall "Investability Score" out of 10.`;

        onOpenCopilot(roastPrompt);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Container */}
            <div className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="flex justify-between items-start p-6 md:p-8 bg-slate-50 border-b border-slate-200">
                    <div>
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider rounded">
                                Blueprint Mode
                            </span>
                            {/* Dynamic Premium Badges */}
                            {idea.score.demand >= 7 && (
                                <span className="px-2 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-bold uppercase tracking-wider rounded shadow-sm">
                                    🚀 High Growth
                                </span>
                            )}
                            {idea.score.profit >= 7 && (
                                <span className="px-2 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-bold uppercase tracking-wider rounded shadow-sm">
                                    💰 High Profit
                                </span>
                            )}
                            {idea.validation?.whyNow && (
                                <span className="px-2 py-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider rounded shadow-sm">
                                    ⏰ Perfect Timing
                                </span>
                            )}
                            {idea.score.talent >= 7 && (
                                <span className="px-2 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-[10px] font-bold uppercase tracking-wider rounded shadow-sm">
                                    🎯 Strong Fit
                                </span>
                            )}
                        </div>
                        <h2 className="text-2xl md:text-3xl font-serif font-black text-slate-900 leading-tight">
                            {idea.title}
                        </h2>
                        <p className="text-slate-600 font-medium max-w-2xl mt-2 line-clamp-2">
                            {idea.description}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-slate-50/50 space-y-12">

                    {/* 1. KEY METRICS GRID */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <MetricCard label="Demand Score" value={idea.score.demand} max={10} color="text-orange-500" />
                        <MetricCard label="Profit Potential" value={idea.score.profit} max={10} color="text-emerald-600" />
                        <MetricCard label="Founder Fit" value={idea.score.talent} max={10} color="text-indigo-600" />
                        <MetricCard label="Feasibility" value={10 - (idea.score.complexity || 5)} max={10} color="text-blue-500" />
                    </div>

                    {/* 2. THE STRATEGY (Wedge & Competitors) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 mb-2">
                                <Zap className="text-amber-500" size={20} />
                                <h3 className="font-bold text-slate-900">Your "Trojan Horse" Strategy</h3>
                            </div>
                            <WedgeCard wedge={idea.blueprint?.theWedge || "Defined in comprehensive analysis."} />

                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                                    <Crown size={16} className="text-yellow-500" /> Value Ladder
                                </h4>
                                <div className="space-y-3">
                                    <LadderStep label="Lead Magnet (Free)" value={idea.blueprint?.valueLadder?.leadMagnet} />
                                    <LadderStep label="Frontend Offer (Low $$)" value={idea.blueprint?.valueLadder?.frontendOffer} />
                                    <LadderStep label="Core Offer (High $$$)" value={idea.blueprint?.valueLadder?.coreOffer} highlight />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-2 mb-2">
                                <ShieldCheck className="text-red-500" size={20} />
                                <h3 className="font-bold text-slate-900">Competitive Landscape</h3>
                            </div>
                            <CompetitorWidget competitors={idea.validation?.competitors} />
                        </div>
                    </div>

                    {/* 3. EXECUTION ROADMAP */}
                    <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none"></div>

                        <h3 className="text-xl font-bold mb-8 relative z-10 flex items-center gap-3">
                            <TrendingUp className="text-emerald-400" /> Strategic Execution Roadmap
                        </h3>

                        <div className="space-y-6 relative z-10">
                            {idea.blueprint?.executionPlan?.map((step, i) => (
                                <div key={i} className="flex gap-4 group">
                                    <div className="flex flex-col items-center">
                                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-sm shadow-lg ring-4 ring-slate-900 group-hover:bg-indigo-500 transition-colors">
                                            {i + 1}
                                        </div>
                                        {i !== (idea.blueprint?.executionPlan?.length || 0) - 1 && (
                                            <div className="w-0.5 flex-1 bg-slate-700 my-2"></div>
                                        )}
                                    </div>
                                    <div className="pb-6">
                                        <p className="text-lg font-medium text-slate-200 leading-relaxed group-hover:text-white transition-colors">
                                            {step}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 4. FINANCIAL PROJECTION */}
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <DollarSign className="text-emerald-600" size={20} />
                            <h3 className="font-bold text-slate-900 text-xl">Revenue Projection</h3>
                        </div>
                        <FinancialSimulator
                            initialPrice={idea.blueprint?.pricing?.minPrice || 50}
                            initialConversion={idea.blueprint?.pricing?.estimatedConversion || 0.02}
                            model={idea.blueprint?.pricing?.model || "Subscription"}
                        />
                    </div>

                    {/* 5. BUILDER PROMPTS (NEW) */}
                    <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] pointer-events-none"></div>

                        <h3 className="text-xl font-bold mb-6 relative z-10 flex items-center gap-3">
                            <Zap className="text-amber-400" /> 1-Click Builder Prompts
                        </h3>
                        <p className="text-slate-400 text-sm mb-6 max-w-2xl">Copy these prompts directly into your favorite AI tools to instantly generate assets for this idea.</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                            <BuilderPromptCard
                                title="Landing Page"
                                tool="V0 / Lovable"
                                icon="🌐"
                                prompt={`Build a modern, conversion-optimized landing page for:

**Product:** ${idea.title}
**Description:** ${idea.description}
**Target Audience:** Entrepreneurs and professionals
**Key Value Prop:** ${idea.blueprint?.valueLadder?.coreOffer || idea.description}

Include:
- Hero section with compelling headline
- Features/Benefits section
- Social proof placeholder
- CTA button
- Mobile-responsive design
- Modern aesthetic with gradient accents`}
                            />
                            <BuilderPromptCard
                                title="MVP App"
                                tool="Replit / Cursor"
                                icon="⚡"
                                prompt={`Create a functional MVP for:

**Product:** ${idea.title}
**Core Feature:** ${idea.blueprint?.theWedge || idea.description}

Tech Stack: React + Tailwind CSS
Features:
1. User authentication (email/password)
2. Main dashboard with key functionality
3. Simple data persistence (localStorage or Supabase)
4. Clean, modern UI

Focus on the core value proposition only. No extra features.`}
                            />
                            <BuilderPromptCard
                                title="Pitch Deck"
                                tool="Claude / ChatGPT"
                                icon="📊"
                                prompt={`Create a 10-slide pitch deck outline for:

**Startup:** ${idea.title}
**Problem:** ${idea.validation?.marketGap || "Market gap exists"}
**Solution:** ${idea.description}
**Revenue Model:** ${idea.blueprint?.pricing?.model || "Subscription"}

Slides needed:
1. Title & Hook
2. Problem Statement
3. Solution
4. Market Size (TAM/SAM/SOM)
5. Business Model
6. Traction/Roadmap
7. Competition
8. Team
9. Financials
10. Ask/CTA

Make it investor-ready with data points.`}
                            />
                        </div>
                    </div>

                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-white border-t border-slate-200 flex justify-between z-50">
                    {/* Roast Button */}
                    <button
                        onClick={handleRoast}
                        className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-xl font-bold shadow-lg shadow-red-200 transition-all flex items-center gap-2"
                    >
                        🔥 Roast This Idea
                    </button>

                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-6 py-3 font-bold text-slate-500 hover:text-slate-800 transition-colors">
                            Close Blueprint
                        </button>
                        <button
                            onClick={() => {
                                onClose();
                                onOpenCopilot(`Help me implement step 1 of the execution plan for ${idea.title}`);
                            }}
                            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2"
                        >
                            <Bot size={18} /> Activate Copilot
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

// --- Sub-components ---

const MetricCard = ({ label, value, max, color }: any) => (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</div>
        <div className="flex items-end gap-1">
            <span className={`text-3xl font-black ${color}`}>{value}</span>
            <span className="text-sm font-bold text-slate-300 mb-1">/{max}</span>
        </div>
    </div>
);

const LadderStep = ({ label, value, highlight }: any) => (
    <div className={`p-4 rounded-xl border ${highlight ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100'}`}>
        <div className="flex justify-between items-center mb-1">
            <span className={`text-xs font-bold uppercase tracking-wider ${highlight ? 'text-indigo-600' : 'text-slate-500'}`}>
                {label}
            </span>
            {highlight && <Target size={14} className="text-indigo-500" />}
        </div>
        <div className={`font-medium ${highlight ? 'text-indigo-900' : 'text-slate-700'}`}>
            {value || "To be defined..."}
        </div>
    </div>
);

const BuilderPromptCard = ({ title, tool, icon, prompt }: { title: string, tool: string, icon: string, prompt: string }) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(prompt);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (e) {
            console.error("Failed to copy", e);
        }
    };

    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 hover:border-purple-500/50 transition-colors group">
            <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{icon}</span>
                <div>
                    <h4 className="font-bold text-white">{title}</h4>
                    <span className="text-xs text-slate-400">{tool}</span>
                </div>
            </div>
            <p className="text-xs text-slate-400 mb-4 line-clamp-3">{prompt.substring(0, 120)}...</p>
            <button
                onClick={handleCopy}
                className={`w-full py-2 rounded-lg text-sm font-bold transition-all ${copied
                    ? 'bg-emerald-500 text-white'
                    : 'bg-purple-600 hover:bg-purple-500 text-white'}`}
            >
                {copied ? '✓ Copied!' : 'Copy Prompt'}
            </button>
        </div>
    );
};
