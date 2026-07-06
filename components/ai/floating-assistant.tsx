'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, X, Send, Minimize2, Maximize2, Mic, Volume2, Loader2, RotateCcw } from 'lucide-react';
import { useAppStore } from '@/store/use-app-store';
import { cn, generateId, sanitizeInput } from '@/lib/utils';
import type { ChatMessage } from '@/types';
import ReactMarkdown from 'react-markdown';

// We'll inline a simple markdown renderer to avoid extra deps
function SimpleMarkdown({ content }: { content: string }) {
  // Convert basic markdown to HTML-safe JSX
  const lines = content.split('\n');
  return (
    <div className="prose prose-invert prose-sm max-w-none text-sm leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={i} className="font-bold text-foreground">{line.slice(2, -2)}</p>;
        }
        if (line.startsWith('# ')) return <h3 key={i} className="font-bold text-base mt-2">{line.slice(2)}</h3>;
        if (line.startsWith('## ')) return <h4 key={i} className="font-semibold mt-2">{line.slice(3)}</h4>;
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return <li key={i} className="ml-4 list-disc">{line.slice(2)}</li>;
        }
        if (/^\d+\. /.test(line)) {
          return <li key={i} className="ml-4 list-decimal">{line.replace(/^\d+\. /, '')}</li>;
        }
        if (line === '') return <br key={i} />;
        // Inline bold **text**
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <p key={i} className="leading-relaxed">
            {parts.map((part, j) =>
              j % 2 === 1 ? <strong key={j} className="text-foreground">{part}</strong> : part
            )}
          </p>
        );
      })}
    </div>
  );
}

const QUICK_PROMPTS = [
  'Where is my seat?',
  'Nearest restroom?',
  'Shortest queue gate?',
  'Wheelchair route?',
  'Parking availability?',
  'Emergency exit?',
];

const TYPING_DOTS = ['', '.', '..', '...'];

function TypingIndicator() {
  const [dot, setDot] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setDot(d => (d + 1) % 4), 400);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex items-center gap-2 px-4 py-3 glass rounded-2xl rounded-bl-sm w-fit">
      <Brain size={14} className="text-primary animate-pulse" />
      <span className="text-muted-foreground text-sm font-mono w-6">{TYPING_DOTS[dot]}</span>
    </div>
  );
}

export function FloatingAssistant() {
  const { isAssistantOpen, setAssistantOpen, language } = useAppStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `⚽ **Welcome to FIFA StadiumIQ 2026!**\n\nI'm your AI stadium assistant. Ask me anything:\n\n- 🗺️ Where is my seat / Gate?\n- 🚻 Nearest restrooms or food?\n- ♿ Wheelchair accessible routes?\n- 🚗 Parking availability?\n- 🚨 Emergency procedures?\n- 🌍 I support 10 languages!\n\nWhat can I help you with?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;
    const sanitized = sanitizeInput(text.trim());

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: sanitized,
      timestamp: new Date(),
      language,
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: sanitized,
          history: messages.slice(-8).map(m => ({ role: m.role, content: m.content })),
          language,
        }),
      });

      if (!response.ok) throw new Error('API error');
      const data = await response.json() as { reply: string };

      const assistantMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date(),
        language,
      };

      setMessages(prev => [...prev, assistantMsg]);

      // Text-to-speech
      if (isSpeaking && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(data.reply.replace(/[*#_]/g, ''));
        utterance.rate = 0.95;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      setMessages(prev => [...prev, {
        id: generateId(),
        role: 'assistant',
        content: '⚠️ I\'m having trouble connecting. Please try again in a moment.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages, language, isSpeaking]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(input);
    }
  };

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;
    const SR = (window as Window & { webkitSpeechRecognition?: typeof SpeechRecognition; SpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition ?? window.SpeechRecognition;
    if (!SR) return;
    const recognition = new SR();
    recognition.lang = language;
    recognition.onresult = (e) => {
      const transcript = e.results[0]?.[0]?.transcript ?? '';
      setInput(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
    setIsListening(true);
    recognitionRef.current = recognition;
  };

  const clearChat = () => {
    setMessages([{
      id: generateId(),
      role: 'assistant',
      content: '⚽ Chat cleared! How can I help you?',
      timestamp: new Date(),
    }]);
  };

  if (!isAssistantOpen) {
    return (
      <motion.button
        id="floating-ai-btn"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setAssistantOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-glow cursor-pointer"
        aria-label="Open AI Stadium Assistant"
      >
        <motion.span
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          className="text-2xl"
        >
          ⚽
        </motion.span>
        {/* Ping ring */}
        <span className="absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-30" />
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        id="ai-assistant-panel"
        role="dialog"
        aria-label="AI Stadium Assistant"
        aria-modal="false"
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={cn(
          'fixed bottom-6 right-6 z-50 glass border border-white/10 rounded-2xl shadow-premium flex flex-col overflow-hidden',
          isMinimized ? 'w-72 h-14' : 'w-80 sm:w-96 h-[600px] max-h-[85vh]'
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 shrink-0">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Brain size={15} className="text-primary" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-background" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm">Stadium<span className="text-amber-400">IQ</span> AI</div>
            <div className="text-xs text-green-400">Online · Gemini 1.5 Flash</div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsSpeaking(s => !s)}
              className={cn('p-1.5 rounded-lg transition-colors', isSpeaking ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground')}
              aria-label={isSpeaking ? 'Disable voice output' : 'Enable voice output'}
              title="Toggle voice output"
            >
              <Volume2 size={14} />
            </button>
            <button
              onClick={clearChat}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear conversation"
              title="Clear chat"
            >
              <RotateCcw size={14} />
            </button>
            <button
              onClick={() => setIsMinimized(m => !m)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              aria-label={isMinimized ? 'Maximize' : 'Minimize'}
            >
              {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
            </button>
            <button
              onClick={() => setAssistantOpen(false)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close assistant"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scroll" role="log" aria-live="polite" aria-label="Chat messages">
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl px-4 py-3 text-sm',
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'glass border border-white/10 rounded-bl-sm'
                    )}
                  >
                    {msg.role === 'assistant' ? (
                      <SimpleMarkdown content={msg.content} />
                    ) : (
                      <p>{msg.content}</p>
                    )}
                    <div className={cn('text-xs mt-1 opacity-50', msg.role === 'user' ? 'text-right' : '')}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <TypingIndicator />
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            <div className="px-4 py-2 flex gap-2 overflow-x-auto custom-scroll shrink-0">
              {QUICK_PROMPTS.map(prompt => (
                <button
                  key={prompt}
                  onClick={() => void sendMessage(prompt)}
                  className="shrink-0 text-xs glass border border-white/10 rounded-full px-3 py-1.5 text-muted-foreground hover:text-foreground hover:border-white/25 transition-all whitespace-nowrap"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Area */}
            <div className="px-4 pb-4 pt-2 shrink-0">
              <div className="flex gap-2 glass rounded-xl border border-white/10 p-2">
                <textarea
                  ref={inputRef}
                  id="ai-chat-input"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything about the stadium..."
                  aria-label="Type your message"
                  className="flex-1 bg-transparent text-sm resize-none outline-none placeholder:text-muted-foreground/60 min-h-[36px] max-h-28 py-1 px-1 custom-scroll"
                  rows={1}
                  maxLength={500}
                />
                <div className="flex flex-col gap-1">
                  <button
                    onClick={startVoiceInput}
                    className={cn(
                      'p-2 rounded-lg transition-colors',
                      isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                    )}
                    aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
                  >
                    <Mic size={14} />
                  </button>
                  <button
                    onClick={() => void sendMessage(input)}
                    disabled={!input.trim() || isLoading}
                    className="p-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-40 hover:opacity-90 transition-all"
                    aria-label="Send message"
                  >
                    {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  </button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground/50 text-center mt-1">
                Enter to send · Shift+Enter for new line
              </p>
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
