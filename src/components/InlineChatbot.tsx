import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Bot, Sparkles, Send } from 'lucide-react';
import { cn } from '../lib/utils';
import { ai } from '../services/geminiService';

const InlineChatbot = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([
    { role: 'bot', text: "Welcome to Survvi Opulence Insights. What questions do you have about industrial foresight, global markets, or strategic insights?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userMsg,
        config: {
          systemInstruction: "You are a world-class industrial management consultant and AI strategist at Survvi Opulence Insights. Provide concise, high-level strategic advice on building materials, energy, and global supply chains. Use a professional, authoritative, and forward-thinking tone.",
        },
      });
      setMessages(prev => [...prev, { role: 'bot', text: response.text || "I apologize, I am unable to process that request at the moment." }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: "Error connecting to strategic engine. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-[600px] bg-brand border border-text/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden relative">
      <div className="p-6 border-b border-text/10 flex items-center justify-between bg-surface relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
            <Bot className="w-6 h-6 text-brand" />
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-text">Survvi AI Assistant</h4>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-[10px] text-text/40 uppercase font-bold tracking-widest">Ready to Answer</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto p-6 space-y-6 scrollbar-hide relative z-10 bg-brand/50">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              "flex flex-col max-w-[85%]",
              msg.role === 'user' ? "ml-auto items-end" : "items-start"
            )}
          >
            <div className={cn(
              "px-4 py-3 rounded-2xl text-sm leading-relaxed",
              msg.role === 'user' ? "bg-accent text-brand font-bold" : "bg-surface border border-text/10 text-text/90"
            )}>
              {msg.text}
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-text/40">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Synthesizing Signal...</span>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-text/10 bg-surface relative z-10">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a question..."
            className="w-full bg-brand border border-text/10 rounded-2xl px-6 py-4 text-sm text-text placeholder:text-text/20 focus:outline-none focus:border-accent/50 pr-16"
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-brand hover:scale-105 transition-transform disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InlineChatbot;
