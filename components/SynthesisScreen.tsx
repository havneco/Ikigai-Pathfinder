
import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Cpu, Search, Brain, Loader2, ArrowRight } from 'lucide-react';

const TIPS = [
  "Ikigai isn't just a destination; it's a lifestyle of balance.",
  "Market validation helps ensure your passion can actually pay the bills.",
  "The most successful founders often pivot 2-3 times before finding product-market fit.",
  "Your 'World Needs' quadrant helps define the mission statement of your career.",
  "Combining two unrelated skills often creates the most valuable niche."
];

const LOGS = [
  "Initializing neural network...",
  "Parsing user profile data...",
  "Mapping 'Love' vectors to industry verticals...",
  "Cross-referencing 'Skills' with global demand...",
  "Connecting to Google Search...",
  "Querying live market trends (this takes a moment)...",
  "Reading search results...",
  "Analyzing salary bands for identified roles...",
  "Filtering for high-growth opportunities...",
  "Validating feasibility scores...",
  "Generating strategic execution blueprint...",
  "Finalizing Ikigai alignment matrix..."
];

const EXTRA_LOGS = [
  "Deep research in progress (quality takes time)...",
  "Checking secondary market signals...",
  "Structuring data for your dashboard...",
  "Almost there..."
];

interface SynthesisScreenProps {
  onSkip?: () => void;
}

const SynthesisScreen: React.FC<SynthesisScreenProps> = ({ onSkip }) => {
  const [currentTip, setCurrentTip] = useState(0);
  const [logIndex, setLogIndex] = useState(0);
  const [displayLogs, setDisplayLogs] = useState(LOGS);
  const [showSkip, setShowSkip] = useState(false);
  const [steps, setSteps] = useState([
    { label: "Mapping Profile", status: "in_progress", icon: Brain },
    { label: "Scanning Market", status: "pending", icon: Search },
    { label: "Validating Trends", status: "pending", icon: Cpu },
  ]);

  // Rotate Tips
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % TIPS.length);
    }, 6000); 
    return () => clearInterval(interval);
  }, []);

  // Show Skip Button after 15 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSkip(true);
    }, 15000);
    return () => clearTimeout(timer);
  }, []);

  // Simulate System Logs
  useEffect(() => {
    if (logIndex < displayLogs.length - 1) {
      const timeout = setTimeout(() => {
        setLogIndex(prev => prev + 1);
      }, 3500); 
      return () => clearTimeout(timeout);
    }
  }, [logIndex, displayLogs]);

  // Long Wait Handling
  useEffect(() => {
    const timer = setTimeout(() => {
       setDisplayLogs(prev => [...prev, ...EXTRA_LOGS]);
    }, 45000); 
    return () => clearTimeout(timer);
  }, []);

  // Simulate Step Progress Visuals
  useEffect(() => {
    const timer1 = setTimeout(() => {
      setSteps(prev => [
        { ...prev[0], status: "done" },
        { ...prev[1], status: "in_progress" },
        { ...prev[2] }
      ]);
    }, 8000);

    const timer2 = setTimeout(() => {
      setSteps(prev => [
        { ...prev[0] },
        { ...prev[1], status: "done" },
        { ...prev[2], status: "in_progress" }
      ]);
    }, 25000);

    return () => { clearTimeout(timer1); clearTimeout(timer2); };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="bg-slate-900 p-6 text-center">
          <Loader2 className="animate-spin text-indigo-400 w-10 h-10 mx-auto mb-4" />
          <h2 className="text-2xl font-serif font-bold text-white mb-1">Synthesizing...</h2>
          <p className="text-slate-400 text-sm">Building your Productivity OS</p>
        </div>

        {/* Progress Steps */}
        <div className="p-6 space-y-4 border-b border-slate-100">
          {steps.map((step, idx) => {
             const Icon = step.icon;
             const isDone = step.status === 'done';
             const isProgress = step.status === 'in_progress';
             
             return (
               <div key={idx} className={`flex items-center gap-4 transition-all duration-500 ${step.status === 'pending' ? 'opacity-40' : 'opacity-100'}`}>
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-colors ${
                    isDone ? 'bg-green-500 border-green-500 text-white' : 
                    isProgress ? 'border-indigo-500 text-indigo-500' : 'border-slate-300'
                 }`}>
                    {isDone ? <CheckCircle2 size={16} /> : <Icon size={16} className={isProgress ? 'animate-pulse' : ''} />}
                 </div>
                 <span className={`font-medium ${isProgress ? 'text-indigo-600' : 'text-slate-700'}`}>
                   {step.label}
                 </span>
               </div>
             );
          })}
        </div>

        {/* Terminal / Logs */}
        <div className="bg-slate-950 p-4 font-mono text-xs h-32 overflow-hidden flex flex-col justify-end">
           {displayLogs.slice(0, logIndex + 1).slice(-4).map((log, i) => (
             <div key={i} className="text-green-400 mb-1 flex gap-2">
               <span className="opacity-50">{">"}</span>
               <span className="animate-in fade-in slide-in-from-left-2">{log}</span>
             </div>
           ))}
           <div className="w-2 h-4 bg-green-500 animate-pulse mt-1"></div>
        </div>

        {/* Tips Footer */}
        <div className="p-4 bg-indigo-50 text-center relative">
           <p className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-2">Did You Know?</p>
           <p className="text-sm text-indigo-700 italic min-h-[40px] animate-in fade-in duration-500 key={currentTip}">
             "{TIPS[currentTip]}"
           </p>

           {/* Skip Button Overlay */}
           {showSkip && onSkip && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center animate-in fade-in">
                 <button 
                   onClick={onSkip}
                   className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors shadow-lg"
                 >
                    Taking too long? Skip <ArrowRight size={14} />
                 </button>
              </div>
           )}
        </div>

      </div>
    </div>
  );
};

export default SynthesisScreen;
