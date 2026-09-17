import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Loader2, ChevronDown, ChevronRight, AlertCircle, CheckCircle2, ShieldCheck, FileCode, Wrench, Bug, Sparkles, RefreshCw } from 'lucide-react';
import { sendDebug } from '../../services/api';

const PRESETS = [
  {
    title: 'Room Overbooking Race Condition',
    method: 'POST',
    endpoint: '/api/bookings',
    error_message: 'MongoServerError: E11000 duplicate key error collection: grandel.bookings index: roomId_date_1 dup key: { roomId: "64fa81...", date: "2026-10-01" }',
    expected_behavior: 'Atomic reservation check prevents double bookings for the same room and date range.',
    actual_behavior: 'Concurrent requests both read room as available and both attempt insertion, crashing with 500 duplicate key error.',
  },
  {
    title: 'Stripe Webhook Signature Failed',
    method: 'POST',
    endpoint: '/api/payments/webhook',
    error_message: 'Error: No signatures found matching the expected signature for payload. Are you passing the raw request body you received from Stripe?',
    expected_behavior: 'Stripe event signature is verified using raw buffer before triggering booking confirmation.',
    actual_behavior: 'express.json() parses payload into object before webhook handler receives it, corrupting raw signature verification.',
  },
  {
    title: 'JWT Token Expiration on Protected Route',
    method: 'GET',
    endpoint: '/api/users/profile',
    error_message: 'JsonWebTokenError: jwt expired at verify (node_modules/jsonwebtoken/index.js:155:12)',
    expected_behavior: 'Auth middleware intercepts expired token, triggers refresh token rotation or returns structured 401 Unauthorized.',
    actual_behavior: 'Unhandled exception causes unhandled promise rejection and server returns generic 500 HTML response.',
  },
  {
    title: 'MongoDB CastError on Booking ObjectId',
    method: 'GET',
    endpoint: '/api/bookings/:id',
    error_message: 'CastError: Cast to ObjectId failed for value "undefined" (type string) at path "_id" for model "Booking"',
    expected_behavior: 'Validate req.params.id with mongoose.Types.ObjectId.isValid() before querying database.',
    actual_behavior: 'Route executes findById(req.params.id) directly when client passes malformed param, crashing with 500.',
  },
];

export default function DebugForm() {
  const [form, setForm] = useState({
    method: 'POST',
    endpoint: '/api/bookings',
    error_message: '',
    expected_behavior: '',
    actual_behavior: '',
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const applyPreset = (preset) => {
    setForm({
      method: preset.method,
      endpoint: preset.endpoint,
      error_message: preset.error_message,
      expected_behavior: preset.expected_behavior,
      actual_behavior: preset.actual_behavior,
    });
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.error_message.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const payload = {
        error_message: form.error_message,
        endpoint: `${form.method} ${form.endpoint}`.trim(),
        expected_behavior: form.expected_behavior,
        actual_behavior: form.actual_behavior,
      };
      const res = await sendDebug(payload);
      setResult(res);
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Investigation request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-8 space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/5 to-indigo-500/10 border border-amber-500/20 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Zap size={18} />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Root Cause Investigator
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 uppercase">
              Automated AI Diagnostics
            </span>
          </div>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Provide an error trace or endpoint failure. The engine performs hybrid semantic search over Grandel’s codebase, controllers, schemas, and GitHub issues to diagnose the root cause and generate a fix.
          </p>
        </div>
      </div>

      {/* Quick Test Presets */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles size={12} className="text-amber-400" />
            Try Pre-Configured Bug Scenarios (1-Click Test)
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(p)}
              className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-amber-500/30 text-left transition-all group"
            >
              <div className="text-[11px] font-mono text-amber-400 mb-1 flex items-center justify-between">
                <span>{p.method} {p.endpoint}</span>
              </div>
              <p className="text-xs font-semibold text-slate-200 group-hover:text-white line-clamp-1">
                {p.title}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Investigation Form */}
      <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl border border-white/10 space-y-5 bg-[#0e1628]/80">
        {/* Endpoint & Method */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-1">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              HTTP Method
            </label>
            <select
              value={form.method}
              onChange={(e) => setForm({ ...form, method: e.target.value })}
              className="w-full bg-[#070b14] border border-white/10 rounded-xl px-3 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="POST">POST</option>
              <option value="GET">GET</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Endpoint / Route
            </label>
            <input
              type="text"
              value={form.endpoint}
              onChange={(e) => setForm({ ...form, endpoint: e.target.value })}
              placeholder="e.g. /api/bookings or /api/auth/login"
              className="w-full bg-[#070b14] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Error Message / Trace */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            Error Message / Stack Trace <span className="text-rose-400">*</span>
          </label>
          <textarea
            required
            rows={4}
            value={form.error_message}
            onChange={(e) => setForm({ ...form, error_message: e.target.value })}
            placeholder="Paste the error trace, console output, or status 500 error here…"
            className="w-full bg-[#070b14] border border-white/10 rounded-xl p-3 text-xs font-mono text-amber-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 leading-relaxed scroll-area"
          />
        </div>

        {/* Expected vs Actual Behavior */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Expected Behavior
            </label>
            <textarea
              rows={2}
              value={form.expected_behavior}
              onChange={(e) => setForm({ ...form, expected_behavior: e.target.value })}
              placeholder="What should the application do?"
              className="w-full bg-[#070b14] border border-white/10 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
              Actual Behavior
            </label>
            <textarea
              rows={2}
              value={form.actual_behavior}
              onChange={(e) => setForm({ ...form, actual_behavior: e.target.value })}
              placeholder="What happens instead?"
              className="w-full bg-[#070b14] border border-white/10 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Error Alert if request failed */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-end pt-2">
          <button
            type="submit"
            disabled={loading || !form.error_message.trim()}
            className="btn-primary px-6 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 shadow-lg shadow-amber-500/20"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Searching Codebase & Investigating…</span>
              </>
            ) : (
              <>
                <Zap size={15} />
                <span>Investigate Root Cause</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Investigation Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Top Summary Card */}
            <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 bg-[#0e1628]/90 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-400" />
                  <h2 className="text-base font-bold text-white">Investigation Findings</h2>
                </div>
                <span className="badge badge-high text-xs">
                  AI Grounded Diagnostics
                </span>
              </div>

              {/* Root Cause Analysis Text */}
              <div className="prose-dark">
                <p className="text-sm leading-relaxed text-slate-200 whitespace-pre-wrap">
                  {result.analysis || result.diagnosis || result.root_cause || JSON.stringify(result, null, 2)}
                </p>
              </div>
            </div>

            {/* Suspected Causes / Files list */}
            {result.causes?.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.causes.map((cause, idx) => (
                  <div key={idx} className="glass-panel p-4 rounded-xl border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Bug size={14} className="text-amber-400" />
                        Cause #{idx + 1}
                      </span>
                      <span className="badge badge-medium text-[10px]">
                        {cause.confidence || 'Suspected'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">
                      {cause.cause || cause.description}
                    </p>
                    {cause.evidence?.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {cause.evidence.map((ev, i) => (
                          <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 text-indigo-300 border border-white/5">
                            {ev}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Proposed Fix / Remediation */}
            {(result.fix || result.recommended_action || result.remediation) && (
              <div className="glass-panel p-5 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.03] space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
                  <Wrench size={14} /> Recommended Code Remediation
                </div>
                <div className="text-xs font-mono text-slate-200 bg-[#060913] p-3.5 rounded-lg border border-white/5 whitespace-pre-wrap leading-relaxed">
                  {result.fix || result.recommended_action || result.remediation}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
