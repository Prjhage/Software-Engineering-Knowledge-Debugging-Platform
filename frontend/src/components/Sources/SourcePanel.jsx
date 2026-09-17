import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileCode2, BookOpen, Bug, GitPullRequest, GitCommit, Settings2, Copy, Check, Search, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

const TYPE_CONFIG = {
  code:             { icon: FileCode2,     label: 'Code',   cls: 'badge-code' },
  documentation:    { icon: BookOpen,      label: 'Docs',   cls: 'badge-doc' },
  github_issue:     { icon: Bug,           label: 'Issue',  cls: 'badge-issue' },
  pull_request:     { icon: GitPullRequest, label: 'PR',    cls: 'badge-pr' },
  commit:           { icon: GitCommit,     label: 'Commit', cls: 'badge-commit' },
  configuration:    { icon: Settings2,     label: 'Config', cls: 'badge-config' },
  project_metadata: { icon: Settings2,     label: 'Meta',   cls: 'badge-config' },
};

const SourceCard = ({ source, index }) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(index < 2);

  const cfg = TYPE_CONFIG[source.source_type] || TYPE_CONFIG.configuration;
  const Icon = cfg.icon;
  const fileName = source.file?.split('/').pop() || source.file || 'Unknown file';
  const filePath = source.file || '';

  const copyPath = () => {
    navigator.clipboard.writeText(filePath);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  // Normalize cross-encoder or similarity score to 0-100%
  const scorePct = source.score !== undefined && source.score !== null
    ? Math.max(10, Math.min(100, Math.round((source.score + 5) * 8)))
    : 85;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-indigo-500/30 transition-all space-y-2.5"
    >
      {/* Card Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-md bg-white/[0.05] flex items-center justify-center flex-shrink-0">
            <Icon size={13} className="text-slate-400" />
          </div>
          <span className="font-mono text-xs font-semibold text-slate-200 truncate" title={filePath}>
            {fileName}
          </span>
        </div>
        <span className={cfg.cls}>{cfg.label}</span>
      </div>

      {/* File Path & Copy */}
      <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-slate-400 bg-black/30 px-2 py-1 rounded border border-white/5">
        <span className="truncate">{filePath}</span>
        <button
          onClick={copyPath}
          className="text-slate-500 hover:text-white transition-colors flex-shrink-0"
          title="Copy file path"
        >
          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
        </button>
      </div>

      {/* Symbol / AST tags */}
      {(source.section || source.module) && (
        <div className="flex flex-wrap gap-1.5 text-[10px]">
          {source.section && (
            <span className="px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 font-mono">
              § {source.section}
            </span>
          )}
          {source.module && source.module !== 'general' && (
            <span className="px-2 py-0.5 rounded bg-white/5 text-slate-400 font-mono">
              mod: {source.module}
            </span>
          )}
        </div>
      )}

      {/* Relevance Score Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
          <span>Relevance Score</span>
          <span className="text-indigo-400 font-mono">{scorePct}%</span>
        </div>
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${scorePct}%` }}
          />
        </div>
      </div>

      {/* Snippet preview */}
      {source.snippet && (
        <div className="pt-1">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between text-[11px] text-slate-400 hover:text-slate-200 py-1 transition-colors"
          >
            <span>{expanded ? 'Hide Snippet' : 'Preview Snippet'}</span>
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          {expanded && (
            <div className="mt-1 p-2.5 rounded-lg bg-[#060913] border border-white/5 font-mono text-[11px] text-slate-300 leading-relaxed overflow-x-auto max-h-48 scroll-area whitespace-pre-wrap">
              {source.snippet}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default function SourcePanel({ sources = [], onClose }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredSources = useMemo(() => {
    return sources.filter((s) => {
      const matchType =
        filter === 'all' ? true :
        filter === 'code' ? s.source_type === 'code' :
        filter === 'docs' ? s.source_type === 'documentation' :
        ['github_issue', 'pull_request', 'commit'].includes(s.source_type);

      const matchSearch = search.trim()
        ? (s.file?.toLowerCase().includes(search.toLowerCase()) ||
           s.snippet?.toLowerCase().includes(search.toLowerCase()) ||
           s.section?.toLowerCase().includes(search.toLowerCase()))
        : true;

      return matchType && matchSearch;
    });
  }, [sources, filter, search]);

  return (
    <aside className="w-80 xl:w-96 flex-shrink-0 flex flex-col border-l border-white/5 bg-[#080d19] z-10">
      {/* Drawer Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white tracking-tight">Evidence & Sources</h2>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300">
              {sources.length}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Retrieved context from Grandel</p>
        </div>
        <button onClick={onClose} className="btn-icon" title="Close drawer">
          <X size={15} />
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="p-3 border-b border-white/5 space-y-2">
        {/* Search */}
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-2.5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter sources by keyword or path…"
            className="w-full bg-[#060913] border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
          {[
            { id: 'all', label: 'All' },
            { id: 'code', label: 'Code' },
            { id: 'docs', label: 'Docs' },
            { id: 'issues', label: 'Issues/PR' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                filter === tab.id
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sources List */}
      <div className="flex-1 scroll-area p-3 space-y-3">
        {filteredSources.length === 0 ? (
          <div className="text-center py-12 px-4 text-slate-500 text-xs">
            {sources.length === 0 ? (
              <>
                <p className="font-medium text-slate-400 mb-1">No Sources Yet</p>
                <p>Send a question to retrieve repository evidence.</p>
              </>
            ) : (
              <>
                <p className="font-medium text-slate-400 mb-1">No Matching Sources</p>
                <p>Try clearing your search query or filter.</p>
              </>
            )}
          </div>
        ) : (
          filteredSources.map((source, idx) => (
            <SourceCard key={idx} source={source} index={idx} />
          ))
        )}
      </div>
    </aside>
  );
}
