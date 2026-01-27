

import React, { useRef, useEffect, useState } from 'react';
import { Send, Loader2, Bot, User, Mic, Zap, ExternalLink } from 'lucide-react';
import { ChatMessage } from '../types';
import ReactMarkdown from 'react-markdown';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
  };

  // Helper pour formater la date qu'elle vienne de Firestore (Timestamp) ou de JS (Date)
  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    try {
      // Si c'est un Timestamp Firebase, on utilise .toDate(), sinon on crée une Date
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-fadeIn`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${msg.role === 'user' ? 'bg-slate-900 border-white/10' : 'bg-apex-400 border-apex-500 shadow-lg shadow-apex-500/20'}`}>
              {msg.role === 'user' ? <User className="w-6 h-6 text-slate-400" /> : <Zap className="w-6 h-6 text-abyss fill-current" />}
            </div>

            <div className={`flex flex-col max-w-2xl ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`px-8 py-6 rounded-[2rem] text-sm sm:text-base leading-relaxed ${msg.role === 'user' ? 'bg-slate-900 text-slate-200 rounded-tr-none' : 'glass-apex text-slate-100 rounded-tl-none'}`}>
                 {msg.role === 'model' ? (
                     <div className="prose prose-invert prose-amber max-w-none prose-p:leading-relaxed">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                        {/* Always display grounding URLs extracted from the Google Search tool as required by guidelines */}
                        {msg.groundingUrls && msg.groundingUrls.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                            <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest flex items-center gap-1">
                              <ExternalLink className="w-3 h-3" /> Sources consultées :
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {msg.groundingUrls.map((url, idx) => (
                                <a 
                                  key={idx} 
                                  href={url.uri} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-[10px] px-2 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-sky-400 transition-colors border border-white/5 truncate max-w-[200px]"
                                  title={url.title}
                                >
                                  {url.title || 'Source'}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                     </div>
                 ) : msg.text}
              </div>
              <span className="text-[10px] font-bold text-slate-600 mt-3 uppercase tracking-widest">
                {formatTime(msg.timestamp)}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-6 animate-pulse">
            <div className="w-12 h-12 rounded-2xl bg-apex-400/20 border border-apex-400/30 flex items-center justify-center">
              <Zap className="w-6 h-6 text-apex-400" />
            </div>
            <div className="glass-apex px-8 py-6 rounded-[2rem] rounded-tl-none">
              <div className="flex gap-2">
                 {[0, 1, 2].map(i => <div key={i} className="w-2 h-2 bg-apex-400 rounded-full animate-bounce" style={{animationDelay: `${i*150}ms`}}></div>)}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-8 glass-apex border-t border-white/5">
        <div className="max-w-4xl mx-auto relative">
          <div className="relative flex items-end gap-4 bg-abyss/50 border border-white/5 rounded-3xl p-4 focus-within:border-apex-400/50 transition-all shadow-2xl">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSubmit())}
              placeholder="Exposez votre vision ou demandez une analyse de palier..."
              className="flex-1 bg-transparent text-slate-100 placeholder-slate-600 text-lg p-3 focus:outline-none resize-none max-h-32 min-h-[50px] custom-scrollbar"
              rows={1}
            />
            <button onClick={handleSubmit} disabled={!input.trim() || isLoading} className="p-4 bg-apex-400 text-abyss rounded-2xl hover:bg-apex-500 transition-all disabled:opacity-30">
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;