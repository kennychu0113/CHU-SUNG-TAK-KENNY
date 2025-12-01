import React, { useState, useRef, useEffect } from 'react';
import { FinanceRecord } from '../types';
import { GoogleGenAI } from '@google/genai';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';

interface AIAdvisorProps {
  data: FinanceRecord[];
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

const AIAdvisor: React.FC<AIAdvisorProps> = ({ data }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hello! I analyzed your financial records. Ask me anything about your spending, savings growth, or investment allocation.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !process.env.API_KEY) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Prepare context safely
      const contextData = JSON.stringify(data.slice(-6)); // Send last 6 months to avoid token limits if list grows huge
      const prompt = `
        You are a helpful financial assistant. Here is the user's financial data for the last few months (JSON format):
        ${contextData}
        
        Answer the user's question based on this data. Be concise, encouraging, and analytical.
        Format currency nicely.
        User Question: ${userMsg}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      setMessages(prev => [...prev, { role: 'model', text: response.text || "I couldn't generate a response." }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I encountered an error connecting to the AI service.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!process.env.API_KEY) {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 p-8 text-center bg-white rounded-xl border border-slate-100 shadow-sm">
            <Sparkles size={48} className="mb-4 text-slate-200" />
            <h3 className="text-lg font-semibold text-slate-600">AI Features Unavailable</h3>
            <p className="max-w-md mt-2 text-sm">To use the AI Advisor, you must run this application in an environment where the Gemini API Key is configured.</p>
        </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 flex items-center gap-3">
        <div className="p-2 bg-white/20 rounded-full text-white">
            <Bot size={24} />
        </div>
        <div>
            <h3 className="text-white font-bold">Wealth Assistant</h3>
            <p className="text-emerald-50 text-xs">Powered by Gemini 2.5 Flash</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-slate-800 text-white' : 'bg-emerald-100 text-emerald-700'}`}>
                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-slate-800 text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'}`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="flex gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                    <Bot size={14} />
                </div>
                <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-2 text-slate-500">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-xs">Analyzing finances...</span>
                </div>
             </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex gap-2 relative">
          <input
            type="text"
            className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 pr-12 text-sm"
            placeholder="Ask about your wealth..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={loading}
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="absolute right-2 top-1.5 p-1.5 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 disabled:opacity-50 disabled:hover:bg-emerald-600 transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAdvisor;
