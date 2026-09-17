import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';
import { Bot, User, Copy, Check, Sparkles, ShieldCheck, AlertCircle, FileCode } from 'lucide-react';

const ConfidenceBadge = ({ confidence }) => {
  const map = {
    high: { cls: 'badge-high', label: 'High Confidence' },
    medium: { cls: 'badge-medium', label: 'Medium Confidence' },
    low: { cls: 'badge-low', label: 'Low Confidence' },
  };
  const conf = map[confidence] || { cls: 'badge-config', label: confidence || 'Verified' };
  return (
    <span className={`badge ${conf.cls}`}>
      <ShieldCheck size={11} /> {conf.label}
    </span>
  );
};

// Cross-browser safe clipboard copy with fallback
const safeCopyText = async (text) => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) {
    // Fallback below
  }
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    return false;
  }
};

// Code block with Copy button
const CodeBlock = ({ children, className, ...props }) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : 'code';
  const codeString = String(children).replace(/\n$/, '');

  const handleCopy = async () => {
    await safeCopyText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-white/10 bg-[#070b14] shadow-lg">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-white/[0.04] border-b border-white/5 text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-1.5">
          <FileCode size={13} className="text-indigo-400" />
          <span>{language}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-all"
          title="Copy code"
        >
          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <div className="p-3.5 overflow-x-auto text-[13px] font-mono leading-relaxed text-slate-200">
        <pre className="m-0 p-0 font-mono bg-transparent border-0">
          <code>{codeString}</code>
        </pre>
      </div>
    </div>
  );
};

export const UserMessage = ({ message }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex gap-3 justify-end items-start"
  >
    <div className="max-w-[85%] md:max-w-[75%] flex flex-col items-end gap-1.5">
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-4 py-3 rounded-2xl rounded-tr-sm shadow-md shadow-indigo-500/20">
        <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{message.content}</p>
      </div>
      <span className="text-[10px] text-slate-500 font-mono pr-1">
        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
    <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-600/30">
      <User size={15} className="text-white" />
    </div>
  </motion.div>
);

export const AssistantMessage = ({ message, onSourceClick }) => {
  const [copiedAll, setCopiedAll] = useState(false);

  const handleCopyAll = async () => {
    await safeCopyText(message.content);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 items-start"
    >
      {/* Bot Avatar */}
      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-400 flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-500/25 mt-0.5">
        <Bot size={16} className="text-white" />
      </div>

      <div className="max-w-[90%] md:max-w-[85%] flex-1 flex flex-col gap-2">
        {/* Message Container */}
        <div className="glass-panel p-5 rounded-2xl rounded-tl-sm border border-white/10 bg-[#0e1628]/80">
          <div className="prose-dark">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                pre({ children }) {
                  return <>{children}</>;
                },
                code({ node, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const codeString = String(children).replace(/\n$/, '');
                  const isMultiLine = codeString.includes('\n');

                  if (!match && !isMultiLine) {
                    return (
                      <code
                        className="px-1.5 py-0.5 mx-0.5 rounded-md bg-indigo-950/60 border border-indigo-500/20 text-indigo-300 font-mono text-[12.5px] select-text font-medium"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  }
                  return (
                    <CodeBlock className={className} {...props}>
                      {children}
                    </CodeBlock>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>

          {/* Bottom Action / Meta Strip */}
          <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {message.inference && (
                <span className="badge bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[11px]">
                  <AlertCircle size={11} /> Synthesized logic
                </span>
              )}
            </div>

            {/* Copy Response Action */}
            <button
              onClick={handleCopyAll}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              title="Copy entire response text"
            >
              {copiedAll ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              <span>{copiedAll ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex gap-3 items-center"
  >
    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-400 flex items-center justify-center shadow-md shadow-indigo-500/25">
      <Bot size={16} className="text-white" />
    </div>
    <div className="glass-panel px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-2 border border-white/5 bg-[#0e1628]/80">
      <Sparkles size={14} className="text-indigo-400 animate-spin" />
      <span className="text-xs text-slate-400 font-medium">
        Searching repository and synthesizing response…
      </span>
      <div className="flex items-center gap-1 ml-1">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse [animation-delay:0.2s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse [animation-delay:0.4s]" />
      </div>
    </div>
  </motion.div>
);
