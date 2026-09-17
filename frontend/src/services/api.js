import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// ── API Functions ──────────────────────────────────────────────────────────────

export const sendChat = (data) =>
  api.post('/chat', data).then(r => r.data);

export const getSessionHistory = (sessionId) =>
  api.get(`/chat/sessions/${sessionId}`).then(r => r.data);

export const clearSessionApi = (sessionId) =>
  api.delete(`/chat/sessions/${sessionId}`).then(r => r.data);

export const sendDebug = (data) =>
  api.post('/debug', data).then(r => r.data);

export const searchKnowledgeBase = (query, sourceTypes, topK = 5) =>
  api.post('/search', { query, source_types: sourceTypes, top_k: topK }).then(r => r.data);

export const getRepositoryStatus = () =>
  api.get('/repository/status').then(r => r.data);

export const triggerIngestion = (useCache = true, reset = false) =>
  api.post('/repository/ingest', null, { params: { use_cache: useCache, reset } }).then(r => r.data);
