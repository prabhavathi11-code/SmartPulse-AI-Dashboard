import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User, 
  HelpCircle, 
  TrendingUp, 
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { api } from '../services/api';

const DEFAULT_SUGGESTIONS = [
  "What is today's revenue?",
  "Which product generated the highest revenue?",
  "How many orders were received this month?",
  "Which products are low in stock?",
  "Predict next month's sales",
  "Why did sales decrease?"
];

export default function AIAssistantModal({ isOpen, onClose }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: "👋 Hello! I am **SmartPulse AI**, your business intelligence assistant. I analyze your real-time sales transactions, customer patterns, and inventory levels.\n\nAsk me any question about your revenue, top products, or future sales forecasts!",
      suggestions: DEFAULT_SUGGESTIONS
    }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (messageToSend = input) => {
    const query = messageToSend.trim();
    if (!query || loading) return;

    // Add user message
    const newMessages = [...messages, { sender: 'user', text: query }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await api.askAssistant(query);
      setMessages([...newMessages, {
        sender: 'assistant',
        text: res.reply,
        suggestions: res.suggestions && res.suggestions.length > 0 ? res.suggestions : DEFAULT_SUGGESTIONS
      }]);
    } catch (err) {
      setMessages([...newMessages, {
        sender: 'assistant',
        text: "⚠️ Sorry, I encountered an issue querying the database. Please verify backend connectivity.",
        suggestions: DEFAULT_SUGGESTIONS
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Basic formatting helper for bold and line breaks
  const renderMessageContent = (content) => {
    const lines = content.split('\n');
    return lines.map((line, i) => {
      // Bold replacement
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={i} className="min-h-[1.2rem]">
          {parts.map((p, j) => {
            if (p.startsWith('**') && p.endsWith('**')) {
              return <strong key={j} className="text-white font-semibold">{p.slice(2, -2)}</strong>;
            }
            if (p.startsWith('`') && p.endsWith('`')) {
              return <code key={j} className="rounded bg-slate-800 px-1 py-0.5 font-mono text-indigo-300">{p.slice(1, -1)}</code>;
            }
            return p;
          })}
        </p>
      );
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="h-full w-full sm:w-[480px] flex flex-col border-l border-slate-800 bg-slate-950 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white">SmartPulse AI Assistant</h3>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Live Business Intelligence Model
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 rounded-tr-none'
                  : 'border border-slate-800/80 bg-slate-900/80 text-slate-300 rounded-tl-none'
              }`}>
                {renderMessageContent(msg.text)}

                {/* Suggestion Pills */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="mt-3.5 pt-3 border-t border-slate-800/80 space-y-1.5">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Suggested Queries:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {msg.suggestions.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => handleSend(sug)}
                          className="rounded-full border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-[11px] text-indigo-300 hover:bg-indigo-600 hover:text-white hover:border-indigo-500 transition text-left"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-300">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl rounded-tl-none border border-slate-800 bg-slate-900/80 p-3.5 text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce" />
                  <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-1 text-[11px]">Analyzing database records...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="border-t border-slate-800 bg-slate-900/80 p-3.5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about sales, revenue, products..."
              className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30 transition hover:bg-indigo-500 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

