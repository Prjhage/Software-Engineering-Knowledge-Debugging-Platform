import { NavLink, useNavigate } from 'react-router-dom';
import { Brain, MessageSquare, Zap, Database, GitFork, ArrowUpRight, Cpu, Sparkles, Terminal } from 'lucide-react';

const NAV = [
  { to: '/',      icon: MessageSquare, label: 'Chat Assistant', badge: 'RAG' },
  { to: '/debug', icon: Zap,           label: 'Deep Debugger',  badge: 'Root Cause' },
];

const QUICK_PROMPTS = [
  { label: 'Auth & JWT Flow', prompt: 'Explain how user authentication and JWT verification works in Grandel.' },
  { label: 'Booking Controller', prompt: 'Where is the booking controller and how does the reservation logic work?' },
  { label: 'MongoDB Schemas', prompt: 'What MongoDB collections and Mongoose models are defined in Grandel?' },
  { label: 'Payment & Stripe', prompt: 'How does payment processing and Stripe webhook integration function in Grandel?' },
];

export default function Sidebar({ onSelectPrompt }) {
  const navigate = useNavigate();

  const handlePromptClick = (prompt) => {
    navigate('/');
    if (onSelectPrompt) {
      onSelectPrompt(prompt);
    } else {
      window.dispatchEvent(new CustomEvent('grandel-quick-prompt', { detail: { prompt } }));
    }
  };

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col border-r border-white/5 bg-[#080d19] z-20 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-white/5 flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Brain size={20} className="text-white" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#080d19]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-white tracking-tight">Grandel AI</span>
            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">v1.0</span>
          </div>
          <p className="text-xs text-slate-400 truncate">Knowledge & Debugging</p>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="px-3 py-4">
        <p className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Platform</p>
        <nav className="space-y-1">
          {NAV.map(({ to, icon: Icon, label, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all no-underline ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/25 to-purple-600/10 text-white border border-indigo-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <Icon size={16} />
                <span>{label}</span>
              </div>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-white/[0.05] text-slate-400">
                {badge}
              </span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Quick Prompts */}
      <div className="px-3 py-2 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between px-3 mb-2">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Quick Inquiries</p>
          <Sparkles size={11} className="text-indigo-400" />
        </div>
        <div className="space-y-1">
          {QUICK_PROMPTS.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handlePromptClick(item.prompt)}
              className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all flex items-center justify-between group border border-transparent hover:border-white/5"
            >
              <span className="truncate">{item.label}</span>
              <ArrowUpRight size={12} className="text-slate-600 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </button>
          ))}
        </div>

        {/* Repository Context Card */}
        <div className="mt-4 mx-1 p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <GitFork size={13} className="text-indigo-400" />
            <span>Target Repository</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400 bg-[#060913] px-2 py-1.5 rounded border border-white/5 truncate">
            Prjhage/Grandel
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-white/5">
            <span>Stack: MERN Hotel App</span>
            <span className="text-emerald-400 font-medium">Synced</span>
          </div>
        </div>
      </div>

      {/* System Status Footer */}
      <div className="p-3 border-t border-white/5 bg-[#070b16]">
        <div className="px-2 py-1.5 rounded-lg bg-white/[0.02] border border-white/5 space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Engine Online
            </span>
            <span className="font-mono text-slate-500 text-[10px]">Port 8000</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500">
            <span>Vector Index: ChromaDB</span>
            <span>Rerank: BM25</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
