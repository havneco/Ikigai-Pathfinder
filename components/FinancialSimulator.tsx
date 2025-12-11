import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Users, Target, Zap, Rocket } from 'lucide-react';

interface FinancialSimulatorProps {
    initialPrice: number;
    initialConversion: number; // 0.0 to 1.0 (e.g. 0.02)
    model: string;
}

const FinancialSimulator: React.FC<FinancialSimulatorProps> = ({ initialPrice, initialConversion, model }) => {
    const [price, setPrice] = useState(initialPrice);
    const [traffic, setTraffic] = useState(1000); // Visitors per month
    const [conversion, setConversion] = useState(initialConversion * 100); // Display as %

    // Calculation
    const customers = Math.round(traffic * (conversion / 100));
    const revenue = Math.round(customers * price);
    const goal = 10000; // $10k/mo
    const progress = Math.min((revenue / goal) * 100, 100);

    // Update internal state if props change (e.g. new idea selected)
    useEffect(() => {
        setPrice(initialPrice);
        setConversion(initialConversion * 100);
    }, [initialPrice, initialConversion]);

    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

    const applyPreset = (type: string) => {
        if (type === 'SaaS') { setPrice(29); setConversion(2.5); setTraffic(5000); }
        if (type === 'Course') { setPrice(197); setConversion(1.5); setTraffic(1000); }
        if (type === 'High Ticket') { setPrice(2500); setConversion(10.0); setTraffic(200); } // High ticket implies calls
    };

    const getInsight = () => {
        if (revenue > 12000) return { text: "Use surplus to hire & scale!", color: "text-emerald-600" };
        if (traffic > 30000) return { text: "Traffic is high. Optimize conversion.", color: "text-orange-600" };
        if (conversion < 0.5) return { text: "Conversion is critical bottleneck.", color: "text-red-500" };
        return { text: "Keep pushing traffic & trust.", color: "text-slate-500" };
    }
    const insight = getInsight();

    return (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none"></div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-600 shadow-sm">
                        <DollarSign size={22} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Path to $10k/mo Freedom</h3>
                        <p className="text-sm text-slate-500 font-medium">Interactive Revenue Simulator</p>
                    </div>
                </div>

                {/* Presets */}
                <div className="flex gap-2 mt-4 md:mt-0">
                    <button onClick={() => applyPreset('SaaS')} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg transition-colors">SaaS Mode</button>
                    <button onClick={() => applyPreset('Course')} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg transition-colors">Course Mode</button>
                    <button onClick={() => applyPreset('High Ticket')} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg transition-colors">Consulting</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* LEVERS (7 cols) */}
                <div className="lg:col-span-7 space-y-8">

                    {/* Price Lever */}
                    <div className="group">
                        <div className="flex justify-between mb-3 items-end">
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <span className="bg-blue-100 text-blue-600 p-1 rounded">1</span> Price Point
                            </label>
                            <span className="text-xl font-black text-slate-800 tabular-nums">{formatCurrency(price)}</span>
                        </div>
                        <input
                            type="range" min={5} max={3000} step={5}
                            value={price} onChange={(e) => setPrice(Number(e.target.value))}
                            className="w-full h-3 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:bg-slate-200 transition-colors"
                        />
                        <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-medium">
                            <span>Micro ($5)</span>
                            <span>High Ticket ($3k)</span>
                        </div>
                    </div>

                    {/* Traffic Lever */}
                    <div className="group">
                        <div className="flex justify-between mb-3 items-end">
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <span className="bg-purple-100 text-purple-600 p-1 rounded">2</span> Monthly Traffic
                            </label>
                            <span className="text-xl font-black text-slate-800 tabular-nums">{traffic.toLocaleString()}</span>
                        </div>
                        <input
                            type="range" min={100} max={50000} step={100}
                            value={traffic} onChange={(e) => setTraffic(Number(e.target.value))}
                            className="w-full h-3 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-purple-600 hover:bg-slate-200 transition-colors"
                        />
                        <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-medium">
                            <span>Organic (100)</span>
                            <span>Viral (50k)</span>
                        </div>
                    </div>

                    {/* Conversion Lever */}
                    <div className="group">
                        <div className="flex justify-between mb-3 items-end">
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <span className="bg-orange-100 text-orange-600 p-1 rounded">3</span> Conversion Rate
                            </label>
                            <span className="text-xl font-black text-slate-800 tabular-nums">{conversion.toFixed(1)}%</span>
                        </div>
                        <input
                            type="range" min={0.1} max={15} step={0.1}
                            value={conversion} onChange={(e) => setConversion(Number(e.target.value))}
                            className="w-full h-3 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-500 hover:bg-slate-200 transition-colors"
                        />
                        <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-medium">
                            <span>Cold (0.1%)</span>
                            <span>Warm Lead (15%)</span>
                        </div>
                    </div>
                </div>

                {/* RESULTS (5 cols) */}
                <div className="lg:col-span-5 flex flex-col justify-between">
                    <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden flex-1 flex flex-col justify-center text-center">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full blur-3xl opacity-20 transform translate-x-10 -translate-y-10"></div>

                        <div className="relative z-10">
                            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">Estimated Revenue</div>
                            <div className="text-5xl font-black text-white tracking-tighter mb-2">
                                {formatCurrency(revenue)}
                                <span className="text-lg text-emerald-400 font-bold ml-1">/mo</span>
                            </div>

                            {/* Progres Bar */}
                            <div className="w-full bg-slate-800 h-3 rounded-full mt-6 overflow-hidden mb-3 ring-1 ring-white/10">
                                <div
                                    className={`h-full transition-all duration-700 ease-out ${progress >= 100 ? 'bg-gradient-to-r from-emerald-400 to-emerald-300' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`}
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>

                            <p className={`text-xs font-medium ${insight.color} mt-2`}>
                                {insight.text}
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 bg-slate-50 rounded-xl p-4 border border-slate-100 flex justify-between items-center group hover:border-indigo-200 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-lg shadow-sm text-indigo-600">
                                <Users size={18} />
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 font-bold uppercase">Customer Goal</div>
                                <div className="text-sm font-medium text-slate-600">to hit $10k/mo</div>
                            </div>
                        </div>
                        <div className="text-2xl font-black text-slate-800">{customers}</div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default FinancialSimulator;
