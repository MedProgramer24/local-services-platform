import React, { useEffect, useRef, useState } from 'react';
import { useConversations } from '@/contexts/ConversationContext';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Check, CheckCheck } from 'lucide-react';
import axios from 'axios';

const ChatWindow: React.FC = () => {
  const { messages, currentConversation, loading, selectedProviderId } = useConversations();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [provider, setProvider] = useState<any>(null);
  const [customer, setCustomer] = useState<any>(null);

  // Filter messages for the current conversation
  const currentMessages = currentConversation 
    ? messages.filter(msg => msg.conversationId === currentConversation._id)
    : [];

  // Debug logging
  console.log('=== CHAT WINDOW DEBUG ===');
  console.log('currentConversation:', currentConversation?._id);
  console.log('selectedProviderId:', selectedProviderId);
  console.log('loading:', loading);
  console.log('provider state:', provider);
  console.log('customer state:', customer);
  console.log('user type:', user?.type);
  console.log('should show new conversation state:', !currentConversation && selectedProviderId);
  console.log('All messages count:', messages.length);
  console.log('Current conversation messages count:', currentMessages.length);

  // Fetch provider/customer info if selectedProviderId is set and no currentConversation
  useEffect(() => {
    console.log('=== CHAT WINDOW USE EFFECT ===');
    console.log('Effect triggered with:', { currentConversation: currentConversation?._id, selectedProviderId, userType: user?.type });
    
    if (!currentConversation && selectedProviderId && user?.type === 'customer') {
      console.log('Fetching provider data for:', selectedProviderId);
      axios.get('http://localhost:5000/api/service-providers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
        .then(res => {
          const providersData = res.data.providers || res.data;
          const found = providersData.find((p: any) => (p.id || p._id) === selectedProviderId);
          console.log('Provider found:', found);
          setProvider(found || null);
        })
        .catch((error) => {
          console.error('Error fetching provider:', error);
          setProvider(null);
        });
    } else if (!currentConversation && selectedProviderId && user?.type === 'provider') {
      console.log('Fetching customer data for:', selectedProviderId);
      axios.get('http://localhost:5000/api/auth/customers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
        .then(res => {
          const customersData = res.data.customers || res.data;
          const found = customersData.find((c: any) => (c.id || c._id) === selectedProviderId);
          console.log('Customer found:', found);
          setCustomer(found || null);
        })
        .catch((error) => {
          console.error('Error fetching customer:', error);
          setCustomer(null);
        });
    } else {
      console.log('Clearing provider/customer state');
      setProvider(null);
      setCustomer(null);
    }
  }, [currentConversation, selectedProviderId, user]);

  useEffect(() => {
    // Scroll to bottom on new message
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Show loading spinner if loading
  if (loading) {
    console.log('=== RENDERING: LOADING STATE ===');
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">جاري تحميل المحادثة...</p>
        </div>
      </div>
    );
  }

  // If new conversation (no currentConversation, but selectedProviderId is set)
  if (!currentConversation && selectedProviderId) {
    let name = '';
    if (user?.type === 'customer') {
      name = provider?.businessName || provider?.name || 'مزود الخدمة';
    } else if (user?.type === 'provider') {
      name = customer?.name || 'العميل';
    }
    console.log('=== RENDERING: NEW CONVERSATION STATE ===');
    console.log('Provider name:', name);
    console.log('Provider object:', provider);
    console.log('Customer object:', customer);
    return (
      <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 via-blue-50/30 to-white">
        <div className="flex-1 flex flex-col items-center justify-center h-full text-center px-4">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">ابدأ المحادثة</h3>
          <p className="text-gray-600 max-w-md leading-relaxed">
            هذه بداية محادثة جديدة مع {name}. اكتب رسالة للبدء!
          </p>
        </div>
      </div>
    );
  }

  // Get the other participant for existing conversation
  const otherParticipant = currentConversation?.participants.find(p => p.id !== user?.id);
  console.log('=== RENDERING: EXISTING CONVERSATION ===');
  console.log('Other participant:', otherParticipant);

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 via-blue-50/30 to-white">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 chat-scrollbar">
        {currentMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">ابدأ المحادثة</h3>
            <p className="text-gray-600 max-w-md leading-relaxed">
              هذه بداية محادثة جديدة مع {otherParticipant?.name}. اكتب رسالة للبدء!
            </p>
          </div>
        ) : (
          currentMessages.map((msg, index) => {
            const isMe = msg.senderId === user?.id;
            const isLastMessage = index === currentMessages.length - 1;
            const showAvatar = !isMe && (index === 0 || currentMessages[index - 1]?.senderId !== msg.senderId);
            // Create a unique key combining multiple identifiers
            const uniqueKey = `${msg._id || 'temp'}-${msg.timestamp}-${index}-${msg.senderId}`;
            return (
              <div
                key={uniqueKey}
                className={cn(
                  'flex items-end space-x-3 space-x-reverse group',
                  isMe ? 'flex-row-reverse space-x-reverse' : 'flex-row space-x-3'
                )}
              >
                {/* Avatar */}
                {showAvatar && !isMe && (
                  <Avatar className="h-8 w-8 flex-shrink-0 border-2 border-white shadow-md hover-lift">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-semibold">
                      {otherParticipant?.name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                )}
                {!showAvatar && !isMe && (
                  <div className="w-8 flex-shrink-0" />
                )}
                {/* Message Bubble */}
                <div
                  className={cn(
                    'relative max-w-[70%] rounded-2xl px-4 py-3 shadow-sm transition-all duration-300 transform hover:scale-[1.02] message-bubble',
                    isMe
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-br-md hover-lift'
                      : 'bg-white text-gray-900 rounded-bl-md border border-gray-200 shadow-md hover:shadow-lg hover-lift'
                  )}
                >
                  {/* Message Content */}
                  <div className="break-words leading-relaxed text-sm">
                    {msg.content}
                  </div>
                  {/* Message Footer */}
                  <div className={cn(
                    'flex items-center justify-between mt-2 text-xs',
                    isMe ? 'text-blue-100' : 'text-gray-500'
                  )}>
                    <div className="flex items-center space-x-1 space-x-reverse">
                      <span className="font-medium">
                        {new Date(msg.timestamp).toLocaleTimeString('ar-SA', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                      {isMe && (
                        <span className={cn(
                          'flex items-center message-status',
                          msg.isRead ? 'read' : 'sent'
                        )}>
                          {msg.isRead ? (
                            <CheckCheck className="h-3 w-3" />
                          ) : (
                            <Check className="h-3 w-3" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Message Tail */}
                  <div className={cn(
                    'absolute bottom-0 w-3 h-3',
                    isMe 
                      ? 'right-0 transform translate-x-1/2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-bl-full' 
                      : 'left-0 transform -translate-x-1/2 bg-white border-l border-b border-gray-200 rounded-br-full'
                  )} />
                </div>
                {/* My Avatar */}
                {isMe && (
                  <Avatar className="h-8 w-8 flex-shrink-0 border-2 border-white shadow-md hover-lift">
                    <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white text-xs font-semibold">
                      {user?.name?.[0] || 'M'}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatWindow; 