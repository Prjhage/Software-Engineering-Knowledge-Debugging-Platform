import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { sendChat } from '../services/api';

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => uuidv4());
  const [error, setError] = useState(null);
  const [activeSources, setActiveSources] = useState([]);

  const addMessage = useCallback((msg) => {
    const message = { ...msg, id: uuidv4(), timestamp: new Date() };
    setMessages(prev => [...prev, message]);
    return message;
  }, []);

  const sendMessage = useCallback(async (content, mode = 'chat') => {
    if (!content.trim() || isLoading) return;
    setError(null);

    addMessage({ role: 'user', content, mode });
    setIsLoading(true);

    try {
      const response = await sendChat({ message: content, session_id: sessionId, mode });

      if (response.session_id && response.session_id !== sessionId) {
        setSessionId(response.session_id);
      }

      addMessage({
        role: 'assistant',
        content: response.answer,
        sources: response.sources || [],
        confidence: response.confidence,
        inference: response.inference,
        mode,
      });

      if (response.sources?.length > 0) {
        setActiveSources(response.sources);
      }
    } catch (err) {
      const msg = err?.response?.data?.detail || err.message || 'Failed to reach the backend.';
      setError(msg);
      addMessage({ role: 'assistant', content: `⚠️ Error: ${msg}`, mode });
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, sessionId, addMessage]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setSessionId(uuidv4());
    setActiveSources([]);
    setError(null);
  }, []);

  return { messages, isLoading, sessionId, error, activeSources, setActiveSources, sendMessage, clearChat };
}
