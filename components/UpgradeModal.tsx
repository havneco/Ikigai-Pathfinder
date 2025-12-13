import React from 'react';
import { Sparkles, Check, X, Shield, Zap } from 'lucide-react';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentCredits: number;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, currentCredits }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors z-10">
                    <X size={20} className="text-slate-500" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2">
                    {/* LEFT: Value Prop */}
                    <div className="bg-slate-900 p-10 text-white relative overflow-hidden flex flex-col justify-between">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[80px] opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>

                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-500/50 rounded-full text-indigo-300 text-xs font-bold uppercase tracking-wider mb-6">
                                <Sparkles size={12} /> PRO Access
                            </div>
                            <h2 className="text-4xl font-serif font-bold mb-4">Unleash Your Full Potential.</h2>
                            <p className="text-slate-400 text-lg leading-relaxed">
                                Get unlimited AI analysis, deep market data, and the full execution blueprint to launch your dream.
                            </p>
                        </div>

                        <div className="space-y-4 mt-8 relative z-10">
                            <FeatureItem text="Unlimited Market Analyses" />
                            <FeatureItem text="Deep Competitor Intelligence" />
                            <FeatureItem text="AI-Powered Execution Roadmaps" />
                            <FeatureItem text="Export Plans to PDF" />
                        </div>
                    </div>

                    {/* RIGHT: Pricing */}
                    <div className="p-10 flex flex-col justify-center bg-slate-50">
                        <div className="text-center mb-8">
                            <h3 className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-2">Limited Time Founder Offer</h3>
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-5xl font-black text-slate-900">$29</span>
                                <span className="text-slate-400 font-medium self-end mb-2">/month</span>
                            </div>
                            <p className="text-slate-400 text-sm mt-2">Cancel anytime. 7-day money-back guarantee.</p>
                        </div>

                        <a
                            href="https://buy.stripe.com/test_eVaeV0gZ9..." // REPLACE WITH REAL STRIPE LINK
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 mb-6"
                        >
                            <Zap fill="currentColor" size={20} /> Upgrade Now
                        </a>

                        <div className="text-center">
                            <p className="text-xs text-slate-400 font-medium mb-2">Trusted by 500+ Founders</p>
                            <div className="flex justify-center gap-1">
                                <Shield size={14} className="text-emerald-500" />
                                <span className="text-[10px] text-slate-500 font-bold uppercase">Secure Payment via Stripe</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FeatureItem = ({ text }: { text: string }) => (
    <div className="flex items-center gap-3">
        <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
            <Check size={12} className="text-emerald-400" strokeWidth={3} />
        </div>
        <span className="text-slate-200 font-medium">{text}</span>
    </div>
);
