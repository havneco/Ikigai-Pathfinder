import React from 'react';
import { Swords, AlertCircle, ExternalLink, ShieldCheck } from 'lucide-react';

interface CompetitorsProps {
    competitors: { name: string; weakness: string; price: string; url?: string }[] | undefined;
}

const CompetitorWidget: React.FC<CompetitorsProps> = ({ competitors }) => {
    if (!competitors || competitors.length === 0) return null;

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2 mb-4">
                <div className="bg-red-100 p-1.5 rounded-lg text-red-600">
                    <Swords size={18} />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">The Competition (And How You Win)</h4>
            </div>

            <div className="space-y-4">
                {competitors.map((comp, i) => (
                    <div key={i} className="flex gap-4 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 group">
                        {/* Icon / Avatar substitute */}
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 font-bold border border-slate-200 shadow-sm shrink-0">
                            {comp.name.charAt(0)}
                        </div>

                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h5 className="font-bold text-slate-900 text-sm">{comp.name}</h5>
                                <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-medium">{comp.price}</span>
                            </div>

                            {/* Weakness Highlight */}
                            <div className="mt-1.5 flex items-start gap-1.5">
                                <ShieldCheck size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-slate-600 leading-snug">
                                    <span className="font-semibold text-slate-700">Your Edge:</span> {comp.weakness}
                                </p>
                            </div>

                            {/* Link */}
                            {comp.url && (
                                <a href={comp.url} target="_blank" rel="noopener noreferrer" className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-indigo-500 flex items-center gap-1 mt-2 hover:underline">
                                    Visit Site <ExternalLink size={8} />
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CompetitorWidget;
