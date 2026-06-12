import React, { useEffect, useRef, useState } from 'react';
import { api } from '../services/api.js';
import {
  Bot, Send, Trash2, ShieldAlert, Sparkles, Dumbbell
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  message: string;
  createdAt: string;
}

export const AICoach: React.FC = () => {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadHistory = async () => {
    try {
      const res = await api.chat.getHistory();
      setHistory(res.data);
    } catch (err) {
      // Mock history if chatbot service isn't running
      setHistory([
        {
          role: 'assistant',
          message: "Welcome! I am your BodyGPT AI Fitness Coach. I have access to your fitness profile. You can ask me questions about posture (e.g. 'how do I squat correctly?'), diet suggestions, or recovery strategies. What's on your mind?",
          createdAt: new Date().toISOString()
        }
      ]);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setLoading(true);

    // Optimistically update UI
    const tempUserMsg: ChatMessage = {
      role: 'user',
      message: userMsg,
      createdAt: new Date().toISOString()
    };
    setHistory(prev => [...prev, tempUserMsg]);

    try {
      const res = await api.chat.askCoach(userMsg);
      setHistory(prev => [...prev, res.data]);
    } catch (err) {
      // Fallback local response generator
      let reply = "I'm having trouble connecting to Azure AI Foundry models right now. But here is standard advice: ensure you are drinking 3-4 liters of water daily, sleeping at least 7-8 hours, and consuming enough protein (1.6-2.2g per kg) to preserve muscle structure.";
      
      const lowerMsg = userMsg.toLowerCase();
      if (lowerMsg.includes('squat')) {
        reply = "Squats: Keep your feet shoulder-width apart, track your knees over your toes, and lower your hips to parallel or below. Keep your chest elevated.";
      } else if (lowerMsg.includes('deadlift')) {
        reply = "Deadlift: Keep the barbell in contact with your shins. Drive through your heels while maintaining a neutral lumbar spine. Avoid rounded backs.";
      }

      const tempAssistantMsg: ChatMessage = {
        role: 'assistant',
        message: reply,
        createdAt: new Date().toISOString()
      };
      setHistory(prev => [...prev, tempAssistantMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (window.confirm('Clear all chat logs?')) {
      try {
        await api.chat.clearHistory();
        setHistory([]);
      } catch (err) {
        setHistory([]);
      }
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      {/* Top Bar */}
      <div className="glass-panel p-4 flex justify-between items-center mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 border border-primary/20 text-primary rounded-xl">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">BodyGPT AI Fitness Coach</h3>
            <p className="text-xs text-slate-400">Powered by Azure AI Foundry RAG Index</p>
          </div>
        </div>

        <button
          onClick={handleClear}
          className="p-2.5 rounded-xl border border-white/5 bg-white/5 text-slate-400 hover:text-accent-rose hover:bg-accent-rose/10 transition-colors"
          title="Clear Conversation"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto glass-panel p-5 space-y-4 mb-4">
        {history.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 max-w-[80%] ${
              msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            <div
              className={`p-2.5 rounded-xl shrink-0 h-10 w-10 flex items-center justify-center border ${
                msg.role === 'user'
                  ? 'bg-secondary/10 border-secondary/20 text-secondary'
                  : 'bg-primary/10 border-primary/20 text-primary'
              }`}
            >
              {msg.role === 'user' ? 'ME' : <Bot className="h-4 w-4" />}
            </div>

            <div
              className={`p-4 rounded-2xl border text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-slate-900/60 border-white/10 text-white'
                  : 'bg-card/90 border-white/5 text-slate-200'
              }`}
            >
              {msg.message}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 mr-auto items-center">
            <div className="p-2.5 rounded-xl shrink-0 h-10 w-10 flex items-center justify-center border bg-primary/10 border-primary/20 text-primary animate-pulse">
              <Bot className="h-4 w-4" />
            </div>
            <span className="text-xs text-slate-500 animate-pulse">BodyGPT is thinking...</span>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Inputs block */}
      <form onSubmit={handleSend} className="flex gap-2 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about exercises, form correction, meal replacements..."
          className="flex-1 bg-slate-900/50 border border-white/10 rounded-2xl px-5 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-primary transition-all text-sm"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-4 rounded-2xl bg-primary hover:bg-primary-hover active:scale-95 text-white transition-all disabled:opacity-50 shadow-md shadow-primary/20"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};
