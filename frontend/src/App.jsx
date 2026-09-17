import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ChatProvider, useChatContext } from './context/ChatContext';
import Sidebar from './components/Layout/Sidebar';
import Navbar from './components/Layout/Navbar';
import ChatPage from './pages/ChatPage';
import DebugPage from './pages/DebugPage';
import RepositoryPage from './pages/RepositoryPage';

function AppLayout() {
  const {
    messages,
    clearChat,
    sendMessage,
  } = useChatContext();

  return (
    <div
      className="flex w-full overflow-hidden"
      style={{ height: '100vh', height: '100dvh', backgroundColor: '#060913', color: '#f1f5f9' }}
    >
      {/* Sleek Fixed Sidebar */}
      <Sidebar onSelectPrompt={(prompt) => sendMessage(prompt, 'chat')} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden relative">
        {/* Top Navbar */}
        <Navbar
          onClearChat={clearChat}
          messageCount={messages.length}
        />

        {/* Page Content Viewport */}
        <main className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden">
          <Routes>
            <Route path="/" element={<ChatPage />} />
            <Route path="/debug" element={<DebugPage />} />
            <Route path="/repository" element={<RepositoryPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ChatProvider>
        <AppLayout />
      </ChatProvider>
    </BrowserRouter>
  );
}
