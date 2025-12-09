import React, { useState } from 'react';
import { IkigaiState } from '../types';
import { Heart, Star, Globe, Wallet, RefreshCw, Save, Plus, X } from 'lucide-react';

interface QuadInputWidgetProps {
  data: IkigaiState;
  onUpdate: (newData: IkigaiState) => void;
  onRegenerate: () => void;
  isAnalysing: boolean;
}

const QuadInputWidget: React.FC<QuadInputWidgetProps> = ({ data, onUpdate, onRegenerate, isAnalysing }) => {
  const [activeTab, setActiveTab] = useState<'love' | 'goodAt' | 'worldNeeds' | 'paidFor'>('love');
  const [inputValue, setInputValue] = useState('');

  // Local state is synced with props, but we edit directly on data for immediate feel or button press
  // Actually, let's edit props directly via onUpdate for instant feedback, or keep local?
  // User asked for "dashboard... fill out the same way". 
  // Wizard uses set state. Here we have a Save button principle, but wizard is instant.
  // Let's make it instant to match Wizard feel, but keep explicit Re-Analyze.

  const currentItems = data[activeTab] || [];

  const addItem = (val: string) => {
    if (val.trim() && !currentItems.includes(val.trim())) {
      const newItems = [...currentItems, val.trim()];
      onUpdate({ ...data, [activeTab]: newItems });
    }
    setInputValue('');
  };

  const removeItem = (val: string) => {
    const newItems = currentItems.filter(i => i !== val);
    onUpdate({ ...data, [activeTab]: newItems });
  };

  const tabs = [
    { id: 'love', label: 'Love', icon: Heart, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
    { id: 'goodAt', label: 'Good At', icon: Star, color: 'text-teal-500', bg: 'bg-teal-50', border: 'border-teal-200' },
    { id: 'worldNeeds', label: 'Needs', icon: Globe, color: 'text-sky-500', bg: 'bg-sky-50', border: 'border-sky-200' },
    { id: 'paidFor', label: 'Paid', icon: Wallet, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' },
  ];

  const activeTabObj = tabs.find(t => t.id === activeTab)!;

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Header Tabs */}
      <div className="flex border-b border-slate-100 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[80px] py-3 flex flex-col items-center gap-1 transition-colors border-b-2 ${isActive ? `border-${tab.color.split('-')[1]}-500 ${tab.bg}` : 'border-transparent hover:bg-slate-50'
                }`}
            >
              <Icon size={16} className={isActive ? tab.color : 'text-slate-400'} />
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Editor Area */}
      <div className={`flex-1 p-4 flex flex-col gap-4 overflow-y-auto ${activeTabObj.bg} bg-opacity-30`}>

        {/* Input Bar */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addItem(inputValue)}
            placeholder={`Add to ${activeTabObj.label}...`}
            className="flex-1 p-3 rounded-xl border border-white/50 focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-slate-400 bg-white shadow-sm text-sm"
          />
          <button
            onClick={() => addItem(inputValue)}
            className="p-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors shadow-md"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Tags Grid */}
        <div className="flex flex-wrap gap-2 content-start">
          {currentItems.map((item, idx) => (
            <span key={idx} className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-white text-slate-800 shadow-sm border border-slate-100 animate-in zoom-in duration-200">
              {item}
              <button onClick={() => removeItem(item)} className="ml-2 text-slate-400 hover:text-red-500 transition-colors">
                <X size={14} />
              </button>
            </span>
          ))}
          {currentItems.length === 0 && (
            <div className="w-full text-center py-8 opacity-40 italic text-sm">
              No items yet. Add some!
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-3 border-t border-slate-100 bg-white flex justify-between items-center z-10">
        <span className="text-[10px] text-slate-400 font-medium">
          {currentItems.length} items
        </span>
        <button
          onClick={onRegenerate}
          disabled={isAnalysing}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${isAnalysing
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200'
            }`}
        >
          <RefreshCw size={14} className={isAnalysing ? 'animate-spin' : ''} />
          {isAnalysing ? 'Analysing...' : 'Re-Analyze'}
        </button>
      </div>
    </div>
  );
};

export default QuadInputWidget;