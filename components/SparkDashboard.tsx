import React, { useState } from 'react';
import { IkigaiResult, User, IkigaiState } from '../types';
import { supabase } from '../lib/supabaseClient';
import { Zap, Play, Box, Image as ImageIcon, Video, Mic, PenTool, Layout, Calendar, ChevronRight, Lock, Plus, Search, Settings } from 'lucide-react';
import { VennDiagram } from './VennDiagram';

interface SparkDashboardProps {
    user: User | null;
    result: IkigaiResult;
    ikigaiData: IkigaiState;
}

const SparkDashboard: React.FC<SparkDashboardProps> = ({ user, result, ikigaiData }) => {
    const [activeModule, setActiveModule] = useState<'mission' | 'studio' | 'timeline'>('mission');

    // Dynamic Data
    const selectedIdea = result.marketIdeas?.[0]; // Default to first idea for now

    // Derived Projects State
    const projects = result.marketIdeas?.map(idea => ({
        title: idea.title,
        status: idea === selectedIdea ? "Active" : "Idea",
        progress: idea.score.complexity ? (10 - idea.score.complexity) * 10 : 0
    })) || [];

    return (
        <div className="h-full bg-slate-950 text-slate-100 font-sans flex flex-col md:flex-row overflow-hidden">
            {/* MAIN CONTENT */}
            <main className="flex-1 relative overflow-y-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">

                {/* HERO VENN */}
                <div className="w-full flex items-center justify-center p-6 md:p-12 pb-0">
                    <div className="w-full max-w-lg md:max-w-xl transform hover:scale-105 transition-transform duration-500">
                        <VennDiagram mode="spark" labels={{ centerLabel: selectedIdea?.title || "Ignite" }} />
                    </div>
                </div>

                {/* Header (Sticky below Hero) */}
                <div className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/50 transition-all duration-300">
                    <header className="max-w-5xl mx-auto h-16 flex items-center justify-between px-6 md:px-12">
                        {/* NAVIGATION TABS */}
                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => setActiveModule('mission')}
                                className={`flex items-center gap-2 text-sm font-medium transition-colors ${activeModule === 'mission' ? 'text-amber-500' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                <Layout size={16} /> Mission Control
                            </button>
                            <button
                                onClick={() => setActiveModule('timeline')}
                                className={`hidden md:flex items-center gap-2 text-sm font-medium transition-colors ${activeModule === 'timeline' ? 'text-amber-500' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                <Calendar size={16} /> Timeline
                            </button>
                            <div className="h-4 w-px bg-slate-800 mx-2"></div>
                            <button
                                onClick={() => setActiveModule('studio')}
                                className={`flex items-center gap-2 text-sm font-medium transition-colors ${activeModule === 'studio' ? 'text-amber-500' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                <PenTool size={16} /> Studio
                            </button>
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all transform hover:scale-105">
                                <Play size={14} fill="currentColor" /> Ignite Campaign
                            </button>
                        </div>
                    </header>
                </div>

                {/* Content Viewport */}
                <div className="p-6 md:p-12 pt-8 space-y-12 max-w-5xl mx-auto">

                    {activeModule === 'mission' && (
                        <>
                            {/* WELCOME / PROJECT STATUS */}
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Main Card */}
                                <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group flex items-center justify-between gap-6">
                                    <div className="absolute top-0 right-0 p-32 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-all duration-700 pointer-events-none"></div>

                                    <div className="relative z-10 flex-1">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="px-2 py-1 bg-amber-900/30 text-amber-500 text-xs font-bold rounded border border-amber-900/50 uppercase tracking-wide inline-block">Active Venture</div>
                                        </div>
                                        <h1 className="text-3xl font-serif font-bold text-white mb-2">{selectedIdea?.title || "No Project Selected"}</h1>
                                        <p className="text-slate-400 text-sm max-w-xl mb-6">
                                            {selectedIdea?.validation?.revenuePotential || "High Growth"} • {selectedIdea?.blueprint?.role || "Founder"} Mode
                                        </p>

                                        <div className="flex items-center gap-4">
                                            {/* Launch Readiness */}
                                            <div className="flex-1 max-w-xs">
                                                <div className="flex justify-between text-xs text-slate-500 mb-2">
                                                    <span>Launch Readiness</span>
                                                    <span>{selectedIdea ? (10 - ((selectedIdea.score?.complexity || 5) / 2)) * 10 : 0}%</span>
                                                </div>
                                                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-amber-600 to-orange-500" style={{ width: `${selectedIdea ? (10 - ((selectedIdea.score?.complexity || 5) / 2)) * 10 : 0}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Stats / Sparks */}
                                <div className="w-full md:w-80 bg-gradient-to-br from-indigo-950 to-slate-900 border border-indigo-900/50 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                                    <div>
                                        <div className="text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">Spark Balance</div>
                                        <div className="text-4xl font-mono font-bold text-white flex items-baseline gap-2">
                                            {user ? "500" : "0"} <span className="text-sm text-indigo-400 font-sans font-normal">Sparks</span>
                                        </div>
                                    </div>
                                    <div className="mt-6">
                                        <button className="w-full py-2 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/50 rounded-lg text-indigo-200 text-sm font-medium transition-colors">
                                            Top Up Balance
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeModule === 'timeline' && selectedIdea?.blueprint?.executionPlan && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-serif font-bold text-white">Execution Timeline</h2>
                                <span className="text-xs font-mono text-amber-500 bg-amber-900/20 px-2 py-1 rounded border border-amber-900/50">PHASE 1: ACTIVATION</span>
                            </div>

                            <div className="relative border-l border-slate-800 ml-4 space-y-10">
                                {selectedIdea.blueprint.executionPlan.map((step, i) => (
                                    <div key={i} className="relative pl-8 group">
                                        {/* Dot */}
                                        <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-600 group-hover:bg-amber-500 group-hover:border-amber-400 transition-colors"></div>

                                        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 hover:border-slate-600 transition-colors flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">Step 0{i + 1}</span>
                                                    <div className="h-px bg-slate-800 flex-1"></div>
                                                </div>
                                                <p className="text-slate-200 font-medium leading-relaxed">{step}</p>
                                            </div>

                                            {/* Action: Add to Tasks */}
                                            <button
                                                onClick={async () => {
                                                    if (!user?.id) return;
                                                    // Add to DB
                                                    try {
                                                        const { error } = await supabase.from('tasks').insert({
                                                            user_id: user.id || 'demo',
                                                            title: `Step 0${i + 1}: ${step.substring(0, 50)}...`,
                                                            description: step,
                                                            status: 'todo',
                                                            priority: 'high',
                                                            ai_generated: true
                                                        });
                                                        if (!error) alert("Added to your Action Board!");
                                                    } catch (e) { console.error(e); }
                                                }}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-slate-500 hover:text-amber-500 hover:bg-amber-500/10 rounded-lg"
                                                title="Add to Action Board"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeModule === 'studio' && (
                        <div className="h-64 flex flex-col items-center justify-center text-slate-500 bg-slate-900/20 rounded-2xl border border-dashed border-slate-800 animate-in fade-in zoom-in duration-500">
                            <PenTool size={48} className="mb-4 opacity-50" />
                            <h3 className="text-lg font-bold">Studio Coming Soon</h3>
                            <p className="text-sm">Create logos, ads, and content with GenAI.</p>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
};

const SuggestionItem = ({ text, cost }: any) => (
    <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors cursor-pointer group">
        <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
            <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{text}</span>
        </div>
        <span className={`text-xs font-mono px-2 py-1 rounded ${cost === 'Free' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-indigo-500/10 text-indigo-400'}`}>
            {cost}
        </span>
    </div>
);

const SidebarItem = ({ icon, label, active, onClick, locked, badge }: any) => (
    <button
        onClick={!locked ? onClick : undefined}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active
            ? 'bg-amber-500/10 text-amber-500'
            : locked
                ? 'text-slate-600 cursor-not-allowed'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
    >
        {icon}
        <span className="flex-1 text-left">{label}</span>
        {locked && <Lock size={12} className="opacity-50" />}
        {badge && <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-500">{badge}</span>}
    </button>
);



const BotIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" /><path d="m8 6 4-4 4 4" /><path d="M12 14a6 6 0 0 0-6-6h12a6 6 0 0 0-6 6Z" /><path d="M12 14v10" /><path d="M9 17h6" /></svg>
);

export default SparkDashboard;
