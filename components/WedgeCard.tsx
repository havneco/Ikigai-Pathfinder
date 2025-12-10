import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface WedgeCardProps {
    wedge: string;
}

export const WedgeCard: React.FC<WedgeCardProps> = ({ wedge }) => {
    return (
        <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/30 dark:to-gray-900 border border-indigo-200 dark:border-indigo-800 rounded-xl p-5 shadow-sm relative overflow-hidden group">

            {/* Decorative Blur */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-500"></div>

            <div className="flex items-start justify-between mb-3 relative z-10">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                        <Sparkles size={16} />
                    </div>
                    <h4 className="font-semibold text-indigo-950 dark:text-indigo-100 text-sm tracking-wide uppercase">
                        The Wedge (Your Entry Point)
                    </h4>
                </div>
            </div>

            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed font-medium relative z-10">
                "{wedge}"
            </p>

            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 opacity-80 group-hover:opacity-100 transition-opacity cursor-pointer">
                <span>Start This Weekend</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
        </div>
    );
};
