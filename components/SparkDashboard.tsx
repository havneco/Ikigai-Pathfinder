import React, { useState } from 'react';
import { IkigaiResult, User, IkigaiState } from '../types';
import { Zap, Play, Box, Image as ImageIcon, Video, Mic, PenTool, Layout, Calendar, ChevronRight, Lock, Plus, Search, Settings } from 'lucide-react';
import { VennDiagram } from './VennDiagram';

interface SparkDashboardProps {
    user: User | null;
    result: IkigaiResult;
    ikigaiData: IkigaiState;
}

const SparkDashboard: React.FC<SparkDashboardProps> = ({ user, result }) => {
    const [activeModule, setActiveModule] = useState<'mission' | 'studio' | 'timeline'>('mission');

    // Placeholder Data for visual mockup
    const projects = [
        { title: result.marketIdeas?.[0]?.title || "Main Venture", status: "Active", progress: 15 },
        { title: "Weekly Newsletter", status: "Drafting", progress: 0 }
    ];

    const assets = [
        { type: 'image', name: 'Logo_Main_v2.png', date: '2h ago' },
        { type: 'text', name: 'Mission_Manifesto.md', date: '5h ago' },
        { type: 'video', name: 'Hero_Loop_4k.mp4', date: '1d ago' }
    ];

    return (
        <div className="h-full bg-slate-950 text-slate-100 font-sans flex flex-col md:flex-row overflow-hidden">

            {/* SIDEBAR NAVIGATION */}
            <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 relative z-20 pt-4">

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto w-full">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 py-2">Core</div>
                    <SidebarItem
                        icon={<Layout size={18} />}
                        label="Mission Control"
                        active={activeModule === 'mission'}
                        onClick={() => setActiveModule('mission')}
                    />
                    <SidebarItem
                        icon={<Calendar size={18} />}
                        label="Launch Timeline"
                        active={activeModule === 'timeline'}
                        onClick={() => setActiveModule('timeline')}
                    />

                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 py-2 mt-6">Studio</div>
                    <SidebarItem
                        icon={<PenTool size={18} />}
                        label="Copywriter"
                        onClick={() => setActiveModule('studio')}
                    />
                    <SidebarItem
                        icon={<ImageIcon size={18} />}
                        label="Visual Lab"
                        locked={true}
                        badge="5 Sparks"
                    />
                    <SidebarItem
                        icon={<Video size={18} />}
                        label="Motion Engine"
                        locked={true}
                        badge="50 Sparks"
                    />
                </nav>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">

                {/* Header */}
                <header className="h-16 border-b border-slate-800/50 flex items-center justify-between px-6 backdrop-blur-sm sticky top-0 z-10">
                    <h2 className="text-lg font-medium text-slate-300 flex items-center gap-2">
                        {activeModule === 'mission' ? 'Mission Control' : activeModule === 'timeline' ? 'Launch Timeline' : 'Creative Studio'}
                    </h2>
                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all transform hover:scale-105">
                            <Play size={14} fill="currentColor" /> Ignite Campaign
                        </button>
                    </div>
                </header>

                {/* Content Viewport */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">

                    {/* WELCOME / PROJECT STATUS */}
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Main Card */}
                        <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group flex items-center justify-between gap-6">
                            <div className="absolute top-0 right-0 p-32 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-all duration-700 pointer-events-none"></div>

                            <div className="relative z-10 flex-1">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="px-2 py-1 bg-amber-900/30 text-amber-500 text-xs font-bold rounded border border-amber-900/50 uppercase tracking-wide inline-block">Active Venture</div>
                                </div>
                                <h1 className="text-3xl font-serif font-bold text-white mb-2">{projects[0].title}</h1>
                                <p className="text-slate-400 text-sm max-w-xl mb-6">
                                    {result.marketIdeas?.[0]?.validation?.revenuePotential || "High Growth"} • {result.marketIdeas?.[0]?.blueprint?.role} Mode
                                </p>

                                <div className="flex items-center gap-4">
                                    {/* Launch Readiness */}
                                    <div className="flex-1 max-w-xs">
                                        <div className="flex justify-between text-xs text-slate-500 mb-2">
                                            <span>Launch Readiness</span>
                                            <span>15%</span>
                                        </div>
                                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-amber-600 to-orange-500 w-[15%]"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SPARK VENN DIAGRAM */}
                            <div className="hidden md:block w-48 h-48 lg:w-56 lg:h-56 shrink-0 relative opacity-90 group-hover:opacity-100 transition-opacity">
                                <VennDiagram mode="spark" activeSection="center" />
                            </div>

                        </div>

                        {/* Quick Stats / Sparks */}
                        <div className="w-full md:w-80 bg-gradient-to-br from-indigo-950 to-slate-900 border border-indigo-900/50 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                            <div>
                                <div className="text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">Spark Balance</div>
                                <div className="text-4xl font-mono font-bold text-white flex items-baseline gap-2">
                                    500 <span className="text-sm text-indigo-400 font-sans font-normal">Sparks</span>
                                </div>
                            </div>
                            <div className="mt-6">
                                <button className="w-full py-2 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/50 rounded-lg text-indigo-200 text-sm font-medium transition-colors">
                                    Top Up Balance
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ASSET LIBRARY ROW */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-slate-300 font-bold text-sm uppercase tracking-wider">Recent Assets</h3>
                            <button className="text-slate-500 hover:text-white text-xs flex items-center gap-1 transition-colors">View All <ChevronRight size={12} /></button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {assets.map((asset, i) => (
                                <div key={i} className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-4 rounded-xl flex items-center gap-4 group cursor-pointer transition-all hover:translate-y-[-2px]">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${asset.type === 'video' ? 'bg-indigo-500/10 text-indigo-500' :
                                        asset.type === 'image' ? 'bg-pink-500/10 text-pink-500' :
                                            'bg-emerald-500/10 text-emerald-500'
                                        }`}>
                                        {asset.type === 'video' ? <Video size={20} /> : asset.type === 'image' ? <ImageIcon size={20} /> : <PenTool size={20} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-slate-200 truncate group-hover:text-amber-400 transition-colors">{asset.name}</div>
                                        <div className="text-xs text-slate-500">{asset.date}</div>
                                    </div>
                                </div>
                            ))}
                            <div className="border border-dashed border-slate-800 rounded-xl flex items-center justify-center cursor-pointer hover:bg-slate-900 hover:border-slate-700 transition-all group">
                                <div className="flex flex-col items-center gap-2 text-slate-600 group-hover:text-slate-400">
                                    <Plus size={24} />
                                    <span className="text-xs font-bold uppercase">New Asset</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AI SUGGESTION FEED */}
                    <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6">
                        <h3 className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
                            <BotIcon /> Copilot Suggestions
                        </h3>
                        <div className="space-y-3">
                            <SuggestionItem text="Generate a 3D Logo for your 'Shadow Agent' brand." cost="5 Sparks" />
                            <SuggestionItem text="Draft a 'Waitlist Launch' email sequence." cost="Free" />
                            <SuggestionItem text="Create a 15-second teaser video for social media." cost="50 Sparks" />
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

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

const BotIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" /><path d="m8 6 4-4 4 4" /><path d="M12 14a6 6 0 0 0-6-6h12a6 6 0 0 0-6 6Z" /><path d="M12 14v10" /><path d="M9 17h6" /></svg>
);

export default SparkDashboard;
