import React from 'react';
import { TrendingUp, AlertCircle, Search } from 'lucide-react';
import { MarketSignal } from '../types';

interface SignalTerminalProps {
    signals: MarketSignal[];
}

export const SignalTerminal: React.FC<SignalTerminalProps> = ({ signals }) => {
    if (!signals || signals.length === 0) return null;

    const getIcon = (source: string) => {
        const s = source.toLowerCase();
        if (s.includes('reddit')) return <AlertCircle size={14} />;
        if (s.includes('market') || s.includes('trend')) return <TrendingUp size={14} />;
        return <Search size={14} />;
    };

    const getColor = (sentiment: string) => {
        switch (sentiment) {
            case 'Positive': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            case 'Negative': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
            default: return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
        }
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-800 font-mono text-sm">
            <h5 className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider mb-3 font-semibold flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                Live Signals
            </h5>

            <div className="space-y-2">
                {signals.map((sig, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-2 bg-white dark:bg-gray-800 rounded border border-gray-100 dark:border-gray-700 shadow-sm">
                        <div className={`mt-0.5 p-1 rounded-full ${getColor(sig.sentiment)}`}>
                            {getIcon(sig.source)}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                                <span className="font-bold text-gray-800 dark:text-gray-200 truncate">{sig.source}</span>
                                <span className="text-[10px] text-gray-400 uppercase">{sig.context}</span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 leading-snug">{sig.signal}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
