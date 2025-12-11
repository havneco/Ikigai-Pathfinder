import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, MessageCircle, ExternalLink, Sparkles } from 'lucide-react';
import { IkigaiResult, User, IkigaiState } from '../types';
import { chatWithCopilot } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface FloatingChatProps {
    result: IkigaiResult;
    isPro: boolean;
    user: User | null;
    ikigaiData: IkigaiState;
    externalContext: string | null;
    onClearContext: () => void;
}

const FloatingChat: React.FC<FloatingChatProps> = ({ result, isPro, user, ikigaiData, externalContext, onClearContext }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
    const [isChatting, setIsChatting] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Auto-open when context is sent from Market Cards
    useEffect(() => {
        if (externalContext) {
            setIsOpen(true);
            handleChat(externalContext);
            onClearContext();
        }
    }, [externalContext]);

    // Scroll to bottom
    useEffect(() => {
        if (isOpen) {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatHistory, isOpen]);

    const handleChat = async (overrideInput?: string) => {
        const textToSend = overrideInput || chatInput;
        if (!textToSend.trim()) return;

        if (!overrideInput) setChatInput(''); // manual input clear

        // UI Message
        const displayMsg = overrideInput?.includes("INITIALIZING LAUNCHPAD")
            ? "🚀 Initializing Launchpad Strategy..."
            : textToSend;

        setChatHistory(prev => [...prev, { role: 'user', text: displayMsg }]);
        setIsChatting(true);

        try {
            const historyForApi = chatHistory.map(h => ({ role: h.role, parts: [{ text: h.text }] }));
            const response = await chatWithCopilot(historyForApi, textToSend, result, ikigaiData, user?.name);
            setChatHistory(prev => [...prev, { role: 'model', text: response }]);
        } catch (e) {
            setChatHistory(prev => [...prev, { role: 'model', text: "Connection error. Please try again." }]);
        } finally {
            setIsChatting(false);
        }
    };

    return (
        <>
            {/* FLOATING BUTTON (When Closed) */}
            <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}>
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110"
                >
                    <Bot size={28} />
                </button>
            </div>

            {/* CHAT WINDOW (When Open) */}
            <div className={`fixed bottom-6 right-6 z-50 w-full max-w-[400px] h-[600px] max-h-[80vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 transition-all duration-500 origin-bottom-right ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-10 pointer-events-none'}`}>

                {/* Header */}
                <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-indigo-500 rounded-lg"><Sparkles size={16} fill="white" /></div>
                        <div>
                            <h3 className="font-bold text-sm">Founder Copilot</h3>
                            <p className="text-[10px] text-slate-400">Strategic Advisor Active</p>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                    {chatHistory.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-60">
                            <Bot size={48} className="text-slate-300 mb-4" />
                            <p className="text-sm font-medium text-slate-600">How can I help you execute your Ikigai?</p>
                            <button onClick={() => setChatInput("What is my first step?")} className="mt-4 px-4 py-2 bg-white border border-slate-200 rounded-full text-xs hover:bg-indigo-50 hover:border-indigo-200 transition-colors">
                                "What is my first step?"
                            </button>
                        </div>
                    )}

                    {chatHistory.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none'}`}>
                                <ReactMarkdown components={{
                                    p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                    ul: ({ node, ...props }) => <ul className="list-disc ml-4 mb-2" {...props} />,
                                    bold: ({ node, ...props }) => <span className="font-bold" {...props} />
                                }}>{msg.text}</ReactMarkdown>
                            </div>
                        </div>
                    ))}

                    {isChatting && (
                        <div className="flex justify-start">
                            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none p-3 shadow-sm">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-3 bg-white border-t border-slate-100">
                    <div className="flex gap-2 items-end">
                        <textarea
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleChat();
                                }
                            }}
                            placeholder="Ask Copilot..."
                            rows={1}
                            className="flex-1 resize-none bg-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 max-h-24"
                        />
                        <button
                            onClick={() => handleChat()}
                            disabled={!chatInput.trim() || isChatting}
                            className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm disabled:opacity-50 transition-colors"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>

            </div>
        </>
    );
};

export default FloatingChat;
