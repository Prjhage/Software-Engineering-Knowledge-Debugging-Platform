import { useLocation } from 'react-router-dom';
import { Sparkles, Database, GitBranch, ExternalLink, RefreshCw } from 'lucide-react';

export default function Navbar({ onClearChat, messageCount }) {
  const location = useLocation();

  const getPageInfo = () => {
    switch (location.pathname) {
      case '/debug':
        return {
          title: 'Root Cause Investigator',
          subtitle: 'Automated AI error diagnostics and repository evidence search',
          badge: 'Debugger',
        };
      case '/repository':
        return {
          title: 'Repository Knowledge Engine',
          subtitle: 'Tree-sitter AST, Gemini Embeddings, and ChromaDB pipeline',
          badge: 'Pipeline',
        };
      default:
        return {
          title: 'Engineering Knowledge Assistant',
          subtitle: 'Grounded RAG across Grandel codebase, models, and history',
          badge: 'RAG Assistant',
        };
    }
  };

  const info = getPageInfo();

  return (
    <header className="h-16 border-b border-white/5 bg-[#080d19]/80 backdrop-blur-md px-6 flex items-center justify-between flex-shrink-0 z-10">
      {/* Left: Breadcrumbs / Title */}
      <div className="flex items-center gap-3 min-w-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold text-white tracking-tight">{info.title}</h1>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
              {info.badge}
            </span>
          </div>
          <p className="text-xs text-slate-400 truncate hidden md:block mt-0.5">{info.subtitle}</p>
        </div>
      </div>

      {/* Center / Right: Engine Badges & Controls */}
      <div className="flex items-center gap-3">
        {/* Target Repository Pill */}
        <a
          href="https://github.com/Prjhage/Grandel"
          target="_blank"
          rel="noopener noreferrer"
          title="Open repository on GitHub"
          className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-slate-300 hover:text-white transition-all group no-underline"
        >
          <GitBranch size={13} className="text-indigo-400 group-hover:text-indigo-300" />
          <span className="font-mono font-medium">Prjhage/Grandel</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">main</span>
          <ExternalLink size={11} className="text-slate-500 group-hover:text-slate-300 ml-0.5" />
        </a>


        {/* New Session Button */}
        {location.pathname === '/' && messageCount > 0 && (
          <button
            onClick={onClearChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.04] hover:bg-rose-500/15 text-slate-400 hover:text-rose-300 border border-white/10 hover:border-rose-500/30 transition-all"
            title="Reset conversation"
          >
            <RefreshCw size={13} />
            <span className="hidden md:inline">Reset</span>
          </button>
        )}


      </div>
    </header>
  );
}
