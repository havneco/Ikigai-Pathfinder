import React, { useState } from 'react';
import { IkigaiState } from '../types';
import { Heart, Star, Globe, Wallet, RefreshCw, Save } from 'lucide-react';

interface QuadInputWidgetProps {
  data: IkigaiState;
  onUpdate: (newData: IkigaiState) => void;
  onRegenerate: () => void;
  isAnalysing: boolean;
}

const QuadInputWidget: React.FC<QuadInputWidgetProps> = ({ data, onUpdate, onRegenerate, isAnalysing }) => {
  const [activeTab, setActiveTab] = useState<'love' | 'goodAt' | 'worldNeeds' | 'paidFor'>('love');
  const [localData, setLocalData] = useState<IkigaiState>(data);
  const [hasChanges, setHasChanges] = useState(false);

  const handleTextChange = (text: string) => {
    // Convert text area (newlines) to array
    const items = text.split('\n').filter(line => line.trim() !== '');
    const newData = { ...localData, [activeTab]: items };
    setLocalData(newData);
    setHasChanges(true);
  };

  const saveChanges = () => {
    onUpdate(localData);
    setHasChanges(false);
  };

  const tabs = [
    { id: 'love', label: 'Love', icon: Heart, color: 'text-red-500', bg: 'bg-red-50' },
    { id: 'goodAt', label: 'Good At', icon: Star, color: 'text-teal-500', bg: 'bg-teal-50' },
    { id: 'worldNeeds', label: 'Needs', icon: Globe, color: 'text-sky-500', bg: 'bg-sky-50' },
    { id: 'paidFor', label: 'Paid', icon: Wallet, color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  const currentItems = localData[activeTab as keyof IkigaiState] || [];
  const textValue = currentItems.join('\n');

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
              className={`flex-1 min-w-[80px] py-3 flex flex-col items-center gap-1 transition-colors border-b-2 ${
                isActive ? `border-${tab.color.split('-')[1]}-500 ${tab.bg}` : 'border-transparent hover:bg-slate-50'
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
      <div className="flex-1 p-4 bg-slate-50 relative">
        <textarea
          value={textValue}
          onChange={(e) => handleTextChange(e.target.value)}
          className="w-full h-full p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm leading-relaxed text-slate-700 bg-white shadow-sm"
          placeholder={`List what you ${activeTab === 'love' ? 'love' : activeTab}... (One per line)`}
        />
        
        {hasChanges && (
          <div className="absolute bottom-6 right-6 animate-in fade-in slide-in-from-bottom-2">
            <button 
              onClick={saveChanges}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg shadow-lg text-xs font-bold hover:bg-slate-800"
            >
              <Save size={14} /> Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-3 border-t border-slate-100 bg-white flex justify-between items-center">
        <span className="text-[10px] text-slate-400 font-medium">
          {currentItems.length} items listed
        </span>
        <button
          onClick={onRegenerate}
          disabled={isAnalysing || hasChanges}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            isAnalysing || hasChanges
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