import React from 'react';
import { ChevronRight, Rocket, Clock, Coins } from 'lucide-react';
import { MarketOpportunity } from '../types';
import { WedgeCard } from './WedgeCard';
import { SignalTerminal } from './SignalTerminal';

interface MarketCardProps {
    idea: MarketOpportunity;
    onOpenCopilot?: (context: string) => void;
    onClick: () => void;
}

export const MarketCard: React.FC<MarketCardProps> = ({ idea, onOpenCopilot, onClick }) => {
    const handleLaunchpad = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click
        if (onOpenCopilot) {
            onOpenCopilot(`INITIALIZING LAUNCHPAD FOR: ${idea.title}\n\nBLUEPRINT:\n${JSON.stringify(idea.blueprint, null, 2)}\n\nPlease guide me through the first step of the execution plan.`);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div onClick={onClick} className="cursor-pointer">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 transition-colors">{idea.title}</h3>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl">{idea.description}</p>
                    </div>
                    <div className="bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-800">
                        <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{idea.score.total}</span>
                    </div>
                </div>

                {/* The Wedge Injection (Safe Check) */}
                <div className="mb-6 cursor-pointer" onClick={onClick}>
                    {idea.blueprint?.theWedge ? (
                        <WedgeCard wedge={idea.blueprint.theWedge} />
                    ) : (
                        <div className="animate-pulse flex space-x-4 p-4 border border-dashed border-gray-200 rounded-lg bg-gray-50">
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Validation Signals (Safe Check) */}
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Validation</h4>
                        {idea.validation?.signals ? (
                            <SignalTerminal signals={idea.validation.signals} />
                        ) : (
                            <div className="space-y-2 animate-pulse">
                                <div className="h-8 bg-gray-100 rounded w-full"></div>
                                <div className="h-8 bg-gray-100 rounded w-full"></div>
                                <div className="text-xs text-indigo-400 font-medium mt-2">
                                    {/* If it takes too long (>30s), it might just be slow. But if data is null, we show loading. */}
                                    Running Deep Scan...
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Metrics (Safe Check) */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Metrics</h4>
                        {idea.validation ? (
                            <>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                                    <Coins className="text-emerald-500" size={18} />
                                    <div>
                                        <div className="text-xs text-gray-500">Revenue Potential</div>
                                        <div className="font-bold text-gray-900 dark:text-white">{idea.validation.revenuePotential}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                                    <Clock className="text-blue-500" size={18} />
                                    <div>
                                        <div className="text-xs text-gray-500">Why Now</div>
                                        <div className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1">{idea.validation.whyNow}</div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="space-y-2 animate-pulse">
                                <div className="h-10 bg-gray-100 rounded w-full"></div>
                                <div className="h-10 bg-gray-100 rounded w-full"></div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="border-t border-gray-100 dark:border-gray-700 pt-5 mt-5 flex justify-between items-center">
                    <button
                        onClick={onClick}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm font-medium flex items-center gap-1"
                    >
                        View Full Blueprint <ChevronRight size={16} />
                    </button>

                    <button
                        onClick={handleLaunchpad}
                        className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:opacity-90 hover:scale-105 transition-all shadow-md hover:shadow-lg"
                    >
                        <Rocket size={16} />
                        Initialize Launchpad
                    </button>
                </div>
            </div>
        </div>
    );
};
export default MarketCard;
