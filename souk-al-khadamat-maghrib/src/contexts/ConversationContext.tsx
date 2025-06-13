import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';

// Types
export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

export interface Conversation {
  _id: string;
  participants: Array<{
    id?: string;
    _id?: string;
    name: string;
    email: string;
    type: 'customer' | 'provider';
  }>;
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface ConversationContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
  socket: Socket | null;
  isConnected: boolean;
  selectedProviderId: string | null;
  createConversation: (participantId: string) => Promise<Conversation>;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
  selectConversation: (conversation: Conversation) => void;
  deleteConversation: (conversationId: string) => Promise<void>;
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  setCurrentConversation: (conversation: Conversation | null) => void;
  setMessages: (messages: Message[]) => void;
  clearConversation: (providerId?: string) => void;
  setSelectedProviderId: (providerId: string | null) => void;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export const useConversations = () => {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error('useConversations must be used within a ConversationProvider');
  }
  return context;
};

interface ConversationProviderProps {
  children: React.ReactNode;
}

export const ConversationProvider: React.FC<ConversationProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  
  const socketRef = useRef<Socket | null>(null);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (isAuthenticated && user) {
      const newSocket = io('http://localhost:5000', {
        query: {
          userId: user.id
        },
        auth: {
          token: localStorage.getItem('token')
        }
      });

      newSocket.on('connect', () => {
        console.log('=== SOCKET CONNECTED ===');
        console.log('Socket ID:', newSocket.id);
        console.log('User ID:', user?.id);
        console.log('User type:', user?.type);
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('=== SOCKET DISCONNECTED ===');
        console.log('Socket ID:', newSocket.id);
        console.log('User ID:', user?.id);
        setIsConnected(false);
      });

      newSocket.on('newMessage', (message: any) => {
        console.log('=== SOCKET NEW MESSAGE RECEIVED ===');
        console.log('Raw message from socket:', message);
        console.log('Current user ID:', user?.id);
        console.log('Current conversation ID:', currentConversation?._id);
        console.log('Message conversation ID:', message.conversationId);
        console.log('Message sender ID:', message.sender?._id || message.sender);
        
        // Transform incoming message to match frontend interface
        const transformedMessage = {
          _id: message._id,
          conversationId: message.conversationId,
          senderId: message.sender._id || message.sender,
          content: message.content,
          timestamp: message.createdAt || message.timestamp,
          isRead: message.isRead
        };
        
        console.log('Transformed message:', transformedMessage);
        console.log('Is message for current conversation?', currentConversation?._id === message.conversationId);
        console.log('Is message from current user?', transformedMessage.senderId === user?.id);
        
        // Always add the message to the messages state if it doesn't exist
        // Don't filter by current conversation - let the UI handle that
        setMessages(prev => {
          const messageExists = prev.some(msg => msg._id === transformedMessage._id);
          if (messageExists) {
            console.log('Message already exists, skipping:', transformedMessage._id);
            return prev;
          }
          console.log('Adding new message from socket:', transformedMessage._id);
          console.log('Previous messages count:', prev.length);
          console.log('New messages count:', prev.length + 1);
          return [...prev, transformedMessage];
        });
        
        // Update conversation's last message regardless of current conversation
        setConversations(prev => 
          prev.map(conv => 
            conv._id === message.conversationId 
              ? { ...conv, lastMessage: transformedMessage, unreadCount: conv.unreadCount + 1 }
              : conv
          )
        );
        
        console.log('=== SOCKET MESSAGE PROCESSING COMPLETE ===');
      });

      newSocket.on('messageRead', (data: { conversationId: string }) => {
        setMessages(prev => 
          prev.map(msg => 
            msg.conversationId === data.conversationId 
              ? { ...msg, isRead: true }
              : msg
          )
        );
        setConversations(prev => 
          prev.map(conv => 
            conv._id === data.conversationId 
              ? { ...conv, unreadCount: 0 }
              : conv
          )
        );
      });

      socketRef.current = newSocket;

      return () => {
        newSocket.close();
      };
    }
  }, [isAuthenticated, user]);

  // Load conversations
  const loadConversations = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/conversations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to load conversations');
      
      const data = await response.json();
      console.log('=== LOADED CONVERSATIONS FROM BACKEND ===');
      console.log('Raw conversations data:', data.conversations);
      console.log('Current user:', user);
      
      // Log each conversation's participants
      data.conversations.forEach((conv: any, index: number) => {
        console.log(`Conversation ${index + 1}:`, {
          id: conv._id,
          participants: conv.participants.map((p: any) => ({
            id: p.id || p._id,
            name: p.name,
            email: p.email,
            type: p.type,
            idType: typeof (p.id || p._id)
          })),
          lastMessage: conv.lastMessage,
          unreadCount: conv.unreadCount
        });
      });
      
      setConversations(data.conversations);
      console.log('=== CONVERSATIONS SET IN STATE ===');
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  // Load messages for a conversation
  const loadMessages = async (conversationId: string) => {
    if (!isAuthenticated) return;
    
    console.log('=== LOADING MESSAGES ===');
    console.log('Loading messages for conversation:', conversationId);
    
    try {
      const response = await fetch(`http://localhost:5000/api/conversations/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to load messages');
      
      const data = await response.json();
      console.log('Raw messages from API:', data.messages);
      
      // Transform messages to match frontend interface
      const transformedMessages = (data.messages || []).map((msg: any) => ({
        _id: msg._id,
        conversationId: msg.conversationId,
        senderId: msg.sender._id || msg.sender, // Handle both populated and unpopulated sender
        content: msg.content,
        timestamp: msg.createdAt || msg.timestamp,
        isRead: msg.isRead
      }));
      
      // Remove duplicates based on _id
      const uniqueMessages = transformedMessages.filter((msg, index, self) => 
        index === self.findIndex(m => m._id === msg._id)
      );
      
      console.log('Transformed messages for conversation', conversationId, ':', uniqueMessages);
      setMessages(uniqueMessages);
      console.log('=== MESSAGES LOADED ===');
    } catch (err) {
      console.error('Error loading messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    }
  };

  // Create a new conversation
  const createConversation = async (participantId: string): Promise<Conversation> => {
    if (!isAuthenticated) throw new Error('User not authenticated');
    
    const response = await fetch('http://localhost:5000/api/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ participantId })
    });
    
    if (!response.ok) throw new Error('Failed to create conversation');
    
    const data = await response.json();
    const conversation = data.conversation;
    
    // Add the new conversation to the list
    setConversations(prev => [conversation, ...prev]);
    
    // Automatically select the new conversation
    selectConversation(conversation);
    
    return conversation;
  };

  // Send a message
  const sendMessage = async (conversationId: string, content: string) => {
    if (!isAuthenticated || !socketRef.current) throw new Error('Not connected');
    
    const response = await fetch(`http://localhost:5000/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ content })
    });
    
    if (!response.ok) throw new Error('Failed to send message');
    
    const data = await response.json();
    console.log('Message sent successfully:', data.message._id);
    
    // Don't add message to state here - let the socket event handle it
    // This prevents duplicates when the socket event fires
    
    // Emit socket event for real-time delivery to conversation room
    socketRef.current.emit('sendMessage', { conversationId, message: data.message });
  };

  // Mark conversation as read
  const markAsRead = async (conversationId: string) => {
    if (!isAuthenticated) return;
    
    try {
      await fetch(`http://localhost:5000/api/conversations/${conversationId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setMessages(prev => 
        prev.map(msg => 
          msg.conversationId === conversationId 
            ? { ...msg, isRead: true }
            : msg
        )
      );
      
      setConversations(prev => 
        prev.map(conv => 
          conv._id === conversationId 
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
      
      if (socketRef.current) {
        socketRef.current.emit('markAsRead', { conversationId });
      }
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  // Select a conversation
  const selectConversation = (conversation: Conversation) => {
    console.log('=== SELECTING CONVERSATION ===');
    console.log('New conversation to select:', conversation._id);
    console.log('Current conversation:', currentConversation?._id);
    console.log('Conversation participants:', conversation.participants);
    console.log('Current user:', user?.id);
    console.log('Socket connected:', !!socketRef.current);
    console.log('Socket ID:', socketRef.current?.id);
    
    // Leave previous conversation room if exists
    if (socketRef.current && currentConversation) {
      console.log('Leaving conversation room:', currentConversation._id);
      socketRef.current.emit('leaveConversation', currentConversation._id);
    }
    
    setCurrentConversation(conversation);
    setSelectedProviderId(null); // Clear selected provider when selecting existing conversation
    loadMessages(conversation._id);
    markAsRead(conversation._id);
    
    // Join conversation room for real-time messaging
    if (socketRef.current) {
      console.log('Joining conversation room:', conversation._id);
      socketRef.current.emit('joinConversation', conversation._id);
      console.log('Join conversation event emitted');
    } else {
      console.error('Socket not connected, cannot join conversation room');
    }
    
    console.log('=== CONVERSATION SELECTED ===');
  };

  // Delete a conversation
  const deleteConversation = async (conversationId: string) => {
    if (!isAuthenticated) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to delete conversation');
      
      setConversations(prev => prev.filter(conv => conv._id !== conversationId));
      if (currentConversation?._id === conversationId) {
        setCurrentConversation(null);
        setMessages([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete conversation');
    }
  };

  // Load conversations on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadConversations();
    }
  }, [isAuthenticated]);

  // Clear current conversation (for new conversations)
  const clearConversation = (providerId?: string) => {
    console.log('=== CLEARING CONVERSATION ===');
    console.log('Provider ID passed to clearConversation:', providerId);
    
    // Leave previous conversation room if exists
    if (socketRef.current && currentConversation) {
      console.log('Leaving conversation room:', currentConversation._id);
      socketRef.current.emit('leaveConversation', currentConversation._id);
    }
    
    setCurrentConversation(null);
    
    // Only clear messages if we're not starting a new conversation
    // If providerId is provided, we're starting a new conversation, so keep messages visible
    if (!providerId) {
      console.log('Clearing messages (no new conversation)');
      setMessages([]);
    } else {
      console.log('Keeping messages visible for new conversation');
    }
    
    // Set the selected provider ID for new conversations
    if (providerId) {
      console.log('Setting selectedProviderId to:', providerId);
      setSelectedProviderId(providerId);
      console.log('Selected provider for new conversation:', providerId);
    } else {
      console.log('Clearing selectedProviderId');
      setSelectedProviderId(null);
    }
    
    console.log('=== CONVERSATION CLEARED ===');
  };

  const value: ConversationContextType = {
    conversations,
    currentConversation,
    messages,
    loading,
    error,
    socket: socketRef.current,
    isConnected,
    selectedProviderId,
    createConversation,
    sendMessage,
    markAsRead,
    selectConversation,
    deleteConversation,
    loadConversations,
    loadMessages,
    setCurrentConversation,
    setMessages,
    clearConversation,
    setSelectedProviderId
  };

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
}; 