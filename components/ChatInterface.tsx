import React, { useRef, useEffect, useState } from 'react';
import { Send, Loader2, Bot, User, Mic } from 'lucide-react';
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0f172a] relative overflow-hidden">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-4 max-w-3xl ${
              msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
                msg.role === 'user' 
                  ? 'bg-slate-800 border-slate-700' 
                  : 'bg-emerald-950/30 border-emerald-900/50'
              }`}
            >
              {msg.role === 'user' ? (
                <User className="w-5 h-5 text-slate-400" />
              ) : (
                <Bot className="w-5 h-5 text-emerald-500" />
              )}
            </div>

            <div
              className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`px-6 py-4 rounded-2xl text-sm sm:text-base leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-slate-800 text-slate-100 rounded-tr-none'
                    : 'bg-[#1e293b] text-slate-200 rounded-tl-none border border-slate-700/50'
                }`}
              >
                 {msg.role === 'model' ? (
                     <div className="markdown-body prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                     </div>
                 ) : (
                    msg.text
                 )}
              </div>
              <span className="text-xs text-slate-500 mt-2 px-1">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-4 mr-auto max-w-3xl animate-pulse">
            <div className="w-10 h-10 rounded-full bg-emerald-950/30 border border-emerald-900/50 flex items-center justify-center">
              <Bot className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="bg-[#1e293b] px-6 py-4 rounded-2xl rounded-tl-none border border-slate-700/50 flex items-center gap-2">
              <span className="text-sm text-slate-400">Analyse en cours...</span>
              <div className="flex gap-1">
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[#0f172a] border-t border-slate-800">
        <div className="max-w-3xl mx-auto relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
          <div className="relative flex items-end gap-2 bg-[#1e293b] border border-slate-700 rounded-xl p-2 shadow-xl focus-within:border-slate-500 transition-colors">
            <button className="p-3 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700/50">
                <Mic className="w-5 h-5" />
            </button>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
              }}
              onKeyDown={handleKeyDown}
              placeholder="Exposez votre situation ou posez une question stratégique..."
              className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 text-base p-3 focus:outline-none resize-none max-h-[150px] min-h-[50px] custom-scrollbar"
              rows={1}
            />
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading}
              className="p-3 bg-slate-100 text-slate-900 rounded-lg hover:bg-white hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
          <div className="text-center mt-2">
            <p className="text-[10px] text-slate-600 uppercase tracking-widest font-semibold">Business Mentor GPT &bull; Intelligence Stratégique</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
