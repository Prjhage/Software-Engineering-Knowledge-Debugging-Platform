import { useChatContext } from '../context/ChatContext';
import ChatWindow from '../components/Chat/ChatWindow';
import InputBar from '../components/Chat/InputBar';

export default function ChatPage() {
  const {
    messages,
    isLoading,
    sendMessage,
    clearChat,
    error,
  } = useChatContext();

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden relative">
      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 min-h-0 min-w-0">
        {/* Error Banner if any */}
        {error && (
          <div className="px-4 py-2 bg-rose-500/10 border-b border-rose-500/20 text-rose-300 text-xs flex items-center justify-between flex-shrink-0">
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* Chat Messages Stream */}
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          onPromptClick={(prompt) => sendMessage(prompt, 'chat')}
        />

        {/* Floating Input Dock */}
        <div className="p-4 border-t border-white/5 bg-[#080d19]/60 backdrop-blur-sm flex-shrink-0">
          <InputBar
            onSend={sendMessage}
            isLoading={isLoading}
            onClear={clearChat}
            messageCount={messages.length}
          />
        </div>
      </div>
    </div>
  );
}
