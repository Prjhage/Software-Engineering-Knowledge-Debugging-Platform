import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MessageSquare, Code2, Zap, ArrowUp } from 'lucide-react';
import { motion } from 'framer-motion';

const MODES = [
  { id: 'chat',    icon: MessageSquare, label: 'Architecture', color: 'text-indigo-400', desc: 'General Q&A and system structure' },
  { id: 'explain', icon: Code2,         label: 'Code Deep Dive', color: 'text-emerald-400', desc: 'Function analysis and AST breakdown' },
  { id: 'debug',   icon: Zap,           label: 'Bug Diagnostics', color: 'text-amber-400', desc: 'Error analysis and edge cases' },
];

export default function InputBar({ onSend, isLoading, onClear, messageCount }) {
  const [text, setText] = useState('');
  const [mode, setMode] = useState('chat');
  const textareaRef = useRef(null);

  // Auto-resize textarea smoothly
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 180) + 'px';
    }
  }, [text]);

  // Listen for global quick prompt events from sidebar or welcome screen
  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.prompt) {
        setText(e.detail.prompt);
        textareaRef.current?.focus();
      }
    };
    window.addEventListener('grandel-quick-prompt', handler);
    return () => window.removeEventListener('grandel-quick-prompt', handler);
  }, []);

  const handleSend = () => {
    const msg = text.trim();
    if (!msg || isLoading) return;
    onSend(msg, mode);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getPlaceholder = () => {
    switch (mode) {
      case 'explain':
        return 'Ask to break down a file, function, or AST node (e.g. "Explain the bookingController.js createBooking method")…';
      case 'debug':
        return 'Describe a bug or paste an error stack trace from Grandel to investigate…';
      default:
        return 'Ask any question about Grandel routes, schemas, models, or logic (e.g. "Where is room availability calculated?")…';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="glass-panel p-2.5 rounded-2xl border border-white/10 bg-[#0d1527]/90 shadow-2xl shadow-black/50 transition-all focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/20">
        {/* Mode selector pills */}
        <div className="flex items-center gap-1 px-1.5 pb-2 border-b border-white/5">
          {MODES.map((m) => {
            const Icon = m.icon;
            const active = mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                title={m.desc}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  active
                    ? 'bg-white/10 text-white shadow-sm border border-white/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                <Icon size={13} className={active ? m.color : 'text-slate-500'} />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Text Input Row */}
        <div className="flex items-end gap-2 pt-2 px-1">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={getPlaceholder()}
            rows={1}
            disabled={isLoading}
            className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 text-sm resize-none focus:outline-none py-1.5 px-2 leading-relaxed min-h-[38px] max-h-[160px] font-sans"
          />

          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={handleSend}
            disabled={!text.trim() || isLoading}
            className="btn-primary flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl flex-shrink-0 mb-0.5"
          >
            {isLoading ? (
              <>
                <Sparkles size={14} className="animate-spin" />
                <span>Thinking…</span>
              </>
            ) : (
              <>
                <span>Send</span>
                <ArrowUp size={14} className="stroke-[2.5]" />
              </>
            )}
          </motion.button>
        </div>

        {/* Footer Hint */}
        <div className="flex items-center justify-between px-2 pt-2 border-t border-white/[0.04] text-[11px] text-slate-500">
          <span>
            Target: <code className="text-slate-400 font-mono text-[10px]">Prjhage/Grandel</code>
          </span>
          <span>
            Press <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-400 border border-white/5 font-mono">Enter</kbd> to send · <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-400 border border-white/5 font-mono">Shift+Enter</kbd> for newline
          </span>
        </div>
      </div>
    </div>
  );
}
