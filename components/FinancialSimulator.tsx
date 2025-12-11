import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Users, Target } from 'lucide-react';

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

    return (
        <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
                <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                    <DollarSign size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800">The Path to $10k/mo</h3>
                    <p className="text-xs text-slate-500 font-medium">Adjust levers to see your roadmap</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* LEVERS */}
                <div className="space-y-6 md:col-span-2">

                    {/* Price Lever */}
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Price Point</label>
                            <span className="text-sm font-bold text-slate-900">{formatCurrency(price)}</span>
                        </div>
                        <input
                            type="range" min={5} max={1000} step={5}
                            value={price} onChange={(e) => setPrice(Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                        />
                        <div className="flex justify-between mt-1 text-[10px] text-slate-400">
                            <span>$5</span>
                            <span>$1,000</span>
                        </div>
                    </div>

                    {/* Traffic Lever */}
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monthly Visitors</label>
                            <span className="text-sm font-bold text-slate-900">{traffic.toLocaleString()}</span>
                        </div>
                        <input
                            type="range" min={100} max={50000} step={100}
                            value={traffic} onChange={(e) => setTraffic(Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                        />
                        <div className="flex justify-between mt-1 text-[10px] text-slate-400">
                            <span>100</span>
                            <span>50k</span>
                        </div>
                    </div>

                    {/* Conversion Lever */}
                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Conversion Rate</label>
                            <span className="text-sm font-bold text-slate-900">{conversion.toFixed(1)}%</span>
                        </div>
                        <input
                            type="range" min={0.1} max={10} step={0.1}
                            value={conversion} onChange={(e) => setConversion(Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                        />
                        <div className="flex justify-between mt-1 text-[10px] text-slate-400">
                            <span>0.1%</span>
                            <span>10%</span>
                        </div>
                    </div>
                </div>

                {/* RESULTS */}
                <div className="flex flex-col justify-center items-center bg-white rounded-2xl border border-slate-100 p-6 shadow-sm text-center">
                    <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Estimated Revenue</div>
                    <div className="text-4xl font-black text-emerald-600 tracking-tight mb-1">
                        {formatCurrency(revenue)}<span className="text-lg text-emerald-400 font-bold">/mo</span>
                    </div>

                    <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden mb-2">
                        <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>
                    <p className="text-xs text-slate-400">
                        {progress >= 100 ? "Use this budget to scale!" : `${(100 - progress).toFixed(0)}% to $10k Freedom Goal`}
                    </p>

                    <div className="mt-6 pt-6 border-t border-slate-100 w-full">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">Sales Needed:</span>
                            <span className="font-bold text-slate-800">{customers} /mo</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default FinancialSimulator;
