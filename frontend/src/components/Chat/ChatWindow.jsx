import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Brain, Sparkles, Code2, Database, Bug, ArrowRight, Layers, Compass } from 'lucide-react';
import { UserMessage, AssistantMessage, TypingIndicator } from './MessageBubble';

const CAPABILITIES = [
  {
    icon: Compass,
    color: 'from-blue-500/20 to-indigo-500/20 text-blue-400',
    title: 'Code Architecture',
    desc: 'Locate controllers, routes, and middleware in the Grandel repository.',
    sample: 'How does the route handling and API structure work in Grandel?',
  },
  {
    icon: Database,
    color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400',
    title: 'Data & Schemas',
    desc: 'Inspect MongoDB collections, Mongoose models, and relationship fields.',
    sample: 'Explain the MongoDB schemas and data models used in Grandel.',
  },
  {
    icon: Bug,
    color: 'from-amber-500/20 to-orange-500/20 text-amber-400',
    title: 'Error Diagnostics',
    desc: 'Analyze stack traces, API error responses, and bug reports with file evidence.',
    sample: 'What are common failure points in the room reservation flow?',
  },
  {
    icon: Code2,
    color: 'from-purple-500/20 to-pink-500/20 text-purple-400',
    title: 'Function Breakdown',
    desc: 'Deconstruct complex business logic, pricing formulas, and validations.',
    sample: 'How does room availability and pricing calculation work in Grandel?',
  },
];

const SUGGESTED_QUERIES = [
  'Where is the user authentication logic defined?',
  'How are bookings validated before saving to MongoDB?',
  'Show the Stripe payment integration flow in Grandel',
  'What environment variables does the backend require?',
];

const WelcomeScreen = ({ onPromptClick }) => (
  <div className="flex flex-col items-center justify-center min-h-full text-center px-4 py-8 max-w-3xl mx-auto">
    {/* Ambient Glow */}
    <div className="relative mb-6">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-400 flex items-center justify-center shadow-xl shadow-indigo-500/30">
        <Brain size={40} className="text-white" />
      </div>
      <div className="absolute -top-1.5 -right-1.5 px-2 py-0.5 bg-emerald-500 text-white rounded-full flex items-center gap-1 text-[10px] font-bold shadow-md">
        <Sparkles size={10} /> RAG v1
      </div>
    </div>

    <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-2">
      Grandel Codebase Intelligence
    </h1>
    <p className="text-slate-400 text-sm md:text-base max-w-xl leading-relaxed mb-8">
      Ask technical questions about the <span className="text-indigo-400 font-semibold">Grandel Hotel Booking Platform</span>.
      Responses are grounded with vector search, Tree-sitter AST symbol parsing, and repository files.
    </p>

    {/* 4 Interactive Feature Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full text-left mb-6">
      {CAPABILITIES.map((c, idx) => {
        const Icon = c.icon;
        return (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06 }}
            onClick={() => onPromptClick && onPromptClick(c.sample)}
            className="p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-indigo-500/30 transition-all cursor-pointer group relative overflow-hidden"
          >
            <div className="flex items-start justify-between mb-2">
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${c.color} flex items-center justify-center border border-white/5`}>
                <Icon size={18} />
              </div>
              <ArrowRight size={14} className="text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
            </div>
            <h3 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors mb-1">
              {c.title}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-2">
              {c.desc}
            </p>
            <div className="text-[11px] font-mono text-indigo-400/80 truncate bg-black/30 px-2 py-1 rounded border border-white/5">
              "{c.sample}"
            </div>
          </motion.div>
        );
      })}
    </div>

    {/* Quick Query Pills */}
    <div className="w-full">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
        Popular Queries
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {SUGGESTED_QUERIES.map((q, i) => (
          <button
            key={i}
            onClick={() => onPromptClick && onPromptClick(q)}
            className="px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-indigo-500/30 text-xs text-slate-300 hover:text-white transition-all text-left"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  </div>
);

export default function ChatWindow({ messages, isLoading, onSourceClick, onPromptClick }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 scroll-area px-4 py-6">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        {messages.length === 0 ? (
          <WelcomeScreen onPromptClick={onPromptClick} />
        ) : (
          <>
            <AnimatePresence initial={false}>
              {messages.map((msg) =>
                msg.role === 'user' ? (
                  <UserMessage key={msg.id} message={msg} />
                ) : (
                  <AssistantMessage key={msg.id} message={msg} onSourceClick={onSourceClick} />
                )
              )}
            </AnimatePresence>
            {isLoading && <TypingIndicator />}
          </>
        )}
        <div ref={bottomRef} className="h-4" />
      </div>
    </div>
  );
}
