import React from 'react';
import { MarketOpportunity } from '../types';
import { TrendingUp, Users, DollarSign, ArrowRight } from 'lucide-react';

interface MarketCardProps {
    idea: MarketOpportunity;
    onClick: () => void;
}

const MarketCard: React.FC<MarketCardProps> = ({ idea, onClick }) => {
    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
        if (score >= 80) return 'text-indigo-600 bg-indigo-50 border-indigo-100';
        return 'text-amber-600 bg-amber-50 border-amber-100';
    };

    return (
        <div
            onClick={onClick}
            className="group relative bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-100 hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer h-full flex flex-col"
        >
            {/* Header / Score Badge */}
            <div className="p-5 flex justify-between items-start">
                <div className="flex-1">
                    <h3 className="font-serif font-bold text-xl text-slate-900 leading-tight group-hover:text-indigo-700 transition-colors">
                        {idea.title}
                    </h3>
                </div>
                <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl border ${getScoreColor(idea.score.total)}`}>
                    <span className="text-xl font-bold leading-none">{idea.score.total}</span>
                    <span className="text-[9px] font-bold uppercase tracking-wide opacity-80">Match</span>
                </div>
            </div>

            {/* Description */}
            <div className="px-5 pb-4 flex-1">
                <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
                    {idea.description}
                </p>
            </div>

            {/* Metrics Grid */}
            <div className="px-5 py-4 border-t border-slate-50 bg-slate-50/50 grid grid-cols-2 gap-4">
                <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">
                        <DollarSign size={12} /> Revenue
                    </div>
                    <p className="text-sm font-semibold text-slate-900 truncate">
                        {idea.validation.revenuePotential || 'N/A'}
                    </p>
                </div>
                <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">
                        <TrendingUp size={12} /> Why Now
                    </div>
                    <p className="text-sm font-semibold text-slate-900 truncate" title={idea.validation.whyNow}>
                        {idea.validation.whyNow.split(' ').slice(0, 3).join(' ')}...
                    </p>
                </div>
            </div>

            {/* Footer Action */}
            <div className="p-4 bg-white border-t border-slate-100 flex justify-between items-center group-hover:bg-slate-50 transition-colors">
                <div className="flex -space-x-2 overflow-hidden">
                    {/* Fake Avatars for "Community" vibe if real data missing, or use signal counts */}
                    {idea.validation.community?.length > 0 ? (
                        <div className="text-xs font-medium text-slate-500 flex items-center gap-1">
                            <Users size={14} className="text-indigo-500" />
                            {idea.validation.community[0].count}
                        </div>
                    ) : (
                        <span className="text-xs text-slate-400 italic">Emerging Market</span>
                    )}
                </div>
                <span className="text-xs font-bold text-indigo-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                    View Blueprint <ArrowRight size={14} />
                </span>
            </div>
        </div>
    );
};

export default MarketCard;
