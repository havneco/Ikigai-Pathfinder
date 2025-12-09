import React, { useState } from 'react';
import { Plus, X, Sparkles, Loader2 } from 'lucide-react';
import { getSuggestions } from '../services/geminiService';
import { IkigaiState } from '../types';

interface WizardStepProps {
  title: string;
  description: string;
  category: "love" | "goodAt" | "worldNeeds" | "paidFor";
  items: string[];
  setItems: (items: string[]) => void;
  onNext: () => void;
  onBack?: () => void;
  context: IkigaiState;
  colorClass: string;
}

const WizardStep: React.FC<WizardStepProps> = ({ 
  title, description, category, items, setItems, onNext, onBack, context, colorClass 
}) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const addItem = (val: string) => {
    if (val.trim() && !items.includes(val.trim())) {
      setItems([...items, val.trim()]);
    }
    setInputValue('');
  };

  const removeItem = (val: string) => {
    setItems(items.filter(i => i !== val));
  };

  const fetchSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const newSuggestions = await getSuggestions(category, items, context);
      setSuggestions(newSuggestions);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className={`p-6 rounded-t-2xl ${colorClass} text-white shadow-lg`}>
        <h2 className="text-3xl font-serif font-bold mb-2">{title}</h2>
        <p className="opacity-90">{description}</p>
      </div>

      <div className="flex-1 p-6 bg-white/80 backdrop-blur-md rounded-b-2xl shadow-xl border border-white/50 flex flex-col gap-6">
        
        {/* Input Area */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add at least 3 items
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addItem(inputValue)}
              placeholder="Type here..."
              className="flex-1 p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-indigo-500 bg-white shadow-sm"
            />
            <button
              onClick={() => addItem(inputValue)}
              className="p-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* Selected Items Tags */}
        <div className="flex flex-wrap gap-2 min-h-[60px]">
          {items.map((item, idx) => (
            <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 shadow-sm border border-gray-200">
              {item}
              <button onClick={() => removeItem(item)} className="ml-2 hover:text-red-500">
                <X size={14} />
              </button>
            </span>
          ))}
          {items.length === 0 && (
            <span className="text-gray-400 italic text-sm py-1">Your list is empty. Start typing or ask AI.</span>
          )}
        </div>

        {/* AI Suggestions */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-indigo-900 flex items-center gap-2">
              <Sparkles size={16} className="text-indigo-500" />
              AI Suggestions
            </h3>
            <button 
              onClick={fetchSuggestions}
              disabled={loadingSuggestions}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium underline disabled:opacity-50"
            >
              {loadingSuggestions ? 'Thinking...' : 'Inspire Me'}
            </button>
          </div>
          
          {loadingSuggestions ? (
             <div className="flex justify-center py-4 text-indigo-400">
                <Loader2 className="animate-spin" />
             </div>
          ) : suggestions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => addItem(s)}
                  className="px-3 py-1 bg-white text-indigo-700 text-xs rounded-full border border-indigo-200 hover:bg-indigo-100 transition-colors shadow-sm"
                >
                  + {s}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-indigo-400 italic">
              Tap "Inspire Me" to get ideas based on your previous answers and trends.
            </p>
          )}
        </div>

        <div className="mt-auto flex justify-between pt-4">
          {onBack ? (
            <button onClick={onBack} className="text-gray-500 hover:text-gray-800 font-medium px-4 py-2">
              Back
            </button>
          ) : (
            <div></div>
          )}
          <button
            onClick={onNext}
            disabled={items.length < 1}
            className={`px-8 py-3 rounded-xl font-semibold shadow-lg transition-all transform hover:scale-105 ${
              items.length < 1 
                ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
                : `${colorClass} text-white`
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default WizardStep;