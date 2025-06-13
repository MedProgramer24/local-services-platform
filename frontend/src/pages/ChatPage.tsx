import React from 'react';
import { useConversations } from '@/contexts/ConversationContext';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ConversationList from '@/components/chat/ConversationList';
import ChatWindow from '@/components/chat/ChatWindow';
import MessageInput from '@/components/chat/MessageInput';
import { ConversationProvider } from '@/contexts/ConversationContext';
import { Button } from '@/components/ui/button';
import { MessageSquare, Users, Wifi, WifiOff } from 'lucide-react';

const ChatMainContent: React.FC = () => {
  const { currentConversation, selectedProviderId, isConnected } = useConversations();
  const { user } = useAuth();

  // Debug logging
  console.log('=== CHAT MAIN CONTENT DEBUG ===');
  console.log('currentConversation:', currentConversation?._id);
  console.log('selectedProviderId:', selectedProviderId);
  console.log('should render chat:', !!(currentConversation || selectedProviderId));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col">
      <Header />
      
      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        {/* Conversation List Sidebar */}
        <div className="w-96 flex-shrink-0">
          <ConversationList />
        </div>
        
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white rounded-l-2xl shadow-2xl overflow-hidden">
          {(currentConversation || selectedProviderId) ? (
            <>
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="font-bold text-lg">
                        {currentConversation 
                          ? currentConversation.participants.find(p => p.id !== user?.id)?.name
                          : 'محادثة جديدة'
                        }
                      </h2>
                      <p className="text-blue-100 text-sm">
                        {currentConversation 
                          ? (currentConversation.participants.find(p => p.id !== user?.id)?.type === 'provider' 
                              ? 'مزود خدمة' 
                              : 'عميل')
                          : 'مزود خدمة'
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 space-x-reverse bg-white/10 backdrop-blur-sm rounded-full px-3 py-1">
                    {isConnected ? (
                      <Wifi className="h-4 w-4 text-green-300" />
                    ) : (
                      <WifiOff className="h-4 w-4 text-red-300" />
                    )}
                    <span className="text-sm font-medium">
                      {isConnected ? 'متصل' : 'غير متصل'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Chat Messages */}
              <div className="flex-1 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
                <ChatWindow />
              </div>
              
              {/* Message Input */}
              <div className="bg-white border-t border-gray-200 p-4">
                <MessageInput />
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
              <div className="text-center max-w-md mx-auto p-8">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <MessageSquare className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  اختر محادثة للبدء
                </h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  اختر محادثة من القائمة أو ابدأ محادثة جديدة مع مزودي الخدمات
                </p>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <MessageSquare className="ml-2 h-5 w-5" />
                  بدء محادثة جديدة
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default function ChatPage() {
  return (
    <ConversationProvider>
      <ChatMainContent />
    </ConversationProvider>
  );
} 