import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ConversationList from '@/components/chat/ConversationList';
import ChatWindow from '@/components/chat/ChatWindow';
import MessageInput from '@/components/chat/MessageInput';
import ChatDebugPanel from '@/components/chat/ChatDebugPanel';
import { ConversationProvider, useConversations } from '@/contexts/ConversationContext';

const ChatMainArea: React.FC = () => {
  const { currentConversation, selectedProviderId } = useConversations();
  
  // Debug logging
  console.log('=== CHAT MAIN AREA DEBUG ===');
  console.log('currentConversation:', currentConversation?._id);
  console.log('selectedProviderId:', selectedProviderId);
  console.log('should render chat:', !!(currentConversation || selectedProviderId));
  
  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Debug Panel - only in development */}
      {process.env.NODE_ENV === 'development' && <ChatDebugPanel />}
      
      {(currentConversation || selectedProviderId) ? (
        <>
          <ChatWindow />
          <MessageInput />
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-lg">
          اختر محادثة لبدء الدردشة
        </div>
      )}
    </div>
  );
};

const ChatPage: React.FC = () => {
  return (
    <ConversationProvider>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="flex-1 flex h-[calc(100vh-64px-64px)]">
          {/* Sidebar */}
          <div className="w-full max-w-xs border-l bg-white h-full">
            <ConversationList />
          </div>
          {/* Main Chat Area */}
          <ChatMainArea />
        </main>
        <Footer />
      </div>
    </ConversationProvider>
  );
};

export default ChatPage; 