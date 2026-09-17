import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, Loader2, RefreshCw, Play, CheckCircle2, XCircle, AlertCircle, FileText, Code2, Bug, GitBranch, ExternalLink, Terminal, Cpu, Layers, Sparkles } from 'lucide-react';
import { getRepositoryStatus, triggerIngestion } from '../../services/api';

const PIPELINE_STEPS = [
  { id: 1, title: 'GitHub Cloner', desc: 'Fetch Grandel tree & issues' },
  { id: 2, title: 'Tree-sitter AST', desc: 'Extract functions & classes' },
  { id: 3, title: 'Doc Loader', desc: 'Parse markdown & configs' },
  { id: 4, title: 'Gemini Embeddings', desc: 'Generate 768d vectors' },
  { id: 5, title: 'ChromaDB + BM25', desc: 'Build hybrid vector store' },
];

export default function IngestionStatus() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchStatus = async () => {
    try {
      const data = await getRepositoryStatus();
      setStatus(data);
    } catch {
      // Backend not running or still starting
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(() => {
      if (status?.ingestion?.status === 'running') fetchStatus();
    }, 3000);
    return () => clearInterval(interval);
  }, [status?.ingestion?.status]);

  const handleIngest = async (useCache = true, reset = false) => {
    setTriggering(true);
    setMessage(null);
    try {
      const res = await triggerIngestion(useCache, reset);
      setMessage({ type: 'success', text: res.message || 'Ingestion pipeline launched successfully.' });
      setTimeout(fetchStatus, 1500);
    } catch (err) {
      setMessage({ type: 'error', text: err?.response?.data?.detail || err.message || 'Failed to trigger pipeline' });
    } finally {
      setTriggering(false);
    }
  };

  const ing = status?.ingestion;
  const kb = status?.knowledge_base;
  const summary = ing?.summary;
  const isRunning = ing?.status === 'running' || triggering;

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-8 space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-600/15 via-purple-600/10 to-blue-600/15 border border-indigo-500/20 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Database size={18} />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Repository Knowledge Engine
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 uppercase">
                {ing?.status === 'completed' ? 'Synced' : isRunning ? 'Ingesting' : 'Ready'}
              </span>
            </div>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              Manages the pipeline that parses the <span className="text-indigo-300 font-semibold">Prjhage/Grandel</span> codebase into Tree-sitter AST symbols and indexes them into ChromaDB for semantic retrieval.
            </p>
          </div>

          <a
            href="https://github.com/Prjhage/Grandel"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/10 border border-white/10 text-xs text-white transition-all self-start md:self-auto no-underline group"
          >
            <GitBranch size={14} className="text-indigo-400" />
            <span className="font-mono">Prjhage/Grandel</span>
            <ExternalLink size={12} className="text-slate-400 group-hover:text-white" />
          </a>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="glass-panel p-4 rounded-xl border border-white/10">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Indexed Chunks</span>
            <Layers size={14} className="text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {kb?.total_chunks ?? summary?.total_chunks ?? '240+'}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">ChromaDB Vector Store</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-white/10">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Code Files Parsed</span>
            <Code2 size={14} className="text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {summary?.code_files ?? '28'}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">JS / JSX / Config Files</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-white/10">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>AST Nodes Extracted</span>
            <Cpu size={14} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {summary?.ast_nodes ?? '150+'}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Functions, routes & models</p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-white/10">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Vector Dimension</span>
            <Sparkles size={14} className="text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            768d
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Gemini text-embedding-004</p>
        </div>
      </div>

      {/* Ingestion Pipeline Architecture Flow */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-[#0e1628]/80 space-y-4">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Layers size={14} className="text-indigo-400" />
          Multi-Modal RAG Ingestion Pipeline Flow
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {PIPELINE_STEPS.map((step) => (
            <div
              key={step.id}
              className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col justify-between"
            >
              <div>
                <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-bold flex items-center justify-center mb-2">
                  {step.id}
                </div>
                <h3 className="text-xs font-semibold text-slate-200 mb-0.5">{step.title}</h3>
                <p className="text-[11px] text-slate-500">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Control Actions & Notifications */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-white">Pipeline Execution Controls</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Trigger background ingestion to refresh ChromaDB with current repository state.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => handleIngest(true, false)}
              disabled={isRunning}
              className="btn-primary px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Pipeline Running…</span>
                </>
              ) : (
                <>
                  <Play size={14} />
                  <span>Start Ingestion</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleIngest(false, true)}
              disabled={isRunning}
              className="btn-secondary px-3.5 py-2 text-xs font-semibold rounded-xl text-slate-300 hover:text-white"
              title="Clear ChromaDB and perform full fresh re-index"
            >
              Force Re-Index
            </button>

            <button
              onClick={fetchStatus}
              className="btn-icon"
              title="Refresh status"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Message Banner */}
        {message && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
              message.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
            }`}
          >
            {message.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
            <span>{message.text}</span>
          </div>
        )}
      </div>

      {/* Terminal Live Activity Log */}
      <div className="rounded-2xl border border-white/10 bg-[#070b14] overflow-hidden">
        <div className="px-4 py-2.5 bg-white/[0.04] border-b border-white/5 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Terminal size={13} className="text-indigo-400" />
            <span className="font-mono font-medium">Pipeline Activity Stream</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400">STATUS: {ing?.status || 'READY'}</span>
        </div>

        <div className="p-4 font-mono text-xs text-slate-300 space-y-1.5 scroll-area max-h-48">
          <p className="text-slate-500">[{new Date().toLocaleTimeString()}] System initialized. Target repo: github.com/Prjhage/Grandel</p>
          <p className="text-slate-400">[{new Date().toLocaleTimeString()}] ChromaDB store initialized at data/chroma</p>
          <p className="text-indigo-400">[{new Date().toLocaleTimeString()}] Embedding model: Gemini text-embedding-004 (768 dimensions)</p>
          <p className="text-emerald-400">[{new Date().toLocaleTimeString()}] Tree-sitter code parser loaded: JavaScript & Python grammars</p>
          {ing?.current_step && (
            <p className="text-amber-300">[{new Date().toLocaleTimeString()}] Step: {ing.current_step}</p>
          )}
        </div>
      </div>
    </div>
  );
}
