import React from 'react';
import { useConversations } from '@/contexts/ConversationContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { chatDebugger } from '@/utils/chatDebugger';

const ChatDebugPanel: React.FC = () => {
  const { socket, currentConversation, messages, isConnected, conversations, selectConversation } = useConversations();
  const { user } = useAuth();

  const runDebugTests = () => {
    console.log('=== RUNNING CHAT DEBUG TESTS ===');
    
    // Test socket connection
    chatDebugger.testSocketConnection(socket);
    
    // Test conversation data
    if (currentConversation) {
      chatDebugger.validateConversationData(currentConversation, user);
    }
    
    // Log all conversations
    console.log('=== ALL CONVERSATIONS ===');
    conversations.forEach((conv, index) => {
      console.log(`Conversation ${index + 1}:`, {
        id: conv._id,
        participants: conv.participants.map((p: any) => ({
          id: p.id || p._id,
          name: p.name,
          type: p.type
        })),
        lastMessage: conv.lastMessage,
        unreadCount: conv.unreadCount
      });
    });
    
    // Log all messages
    console.log('=== ALL MESSAGES ===');
    messages.forEach((msg, index) => {
      console.log(`Message ${index + 1}:`, {
        id: msg._id,
        conversationId: msg.conversationId,
        senderId: msg.senderId,
        content: msg.content.substring(0, 50),
        timestamp: msg.timestamp,
        isRead: msg.isRead
      });
    });
  };

  const testSocketEmit = () => {
    if (socket && currentConversation) {
      console.log('=== TESTING SOCKET EMIT ===');
      socket.emit('test', {
        conversationId: currentConversation._id,
        message: 'Test message from debug panel'
      });
      console.log('Test message emitted to conversation:', currentConversation._id);
    } else {
      console.error('Socket or conversation not available for test');
    }
  };

  const testConversationSelection = () => {
    console.log('=== TESTING CONVERSATION SELECTION ===');
    console.log('Current conversations:', conversations);
    console.log('Current user:', user);
    
    if (conversations.length > 0) {
      const firstConversation = conversations[0];
      console.log('Selecting first conversation:', firstConversation);
      selectConversation(firstConversation);
    } else {
      console.log('No conversations available to test');
    }
  };

  const testCustomerProviderMapping = () => {
    console.log('=== TESTING CUSTOMER-PROVIDER MAPPING ===');
    console.log('Conversations:', conversations);
    console.log('User type:', user?.type);
    console.log('User ID:', user?.id);
    
    // Test conversation mapping
    conversations.forEach((conv, index) => {
      console.log(`\nConversation ${index + 1}:`, {
        id: conv._id,
        participants: conv.participants.map((p: any) => ({
          id: p.id || p._id,
          name: p.name,
          type: p.type
        }))
      });
    });
  };

  const testCustomerConversationMapping = () => {
    console.log('=== TESTING CUSTOMER CONVERSATION MAPPING ===');
    console.log('User type:', user?.type);
    console.log('User ID:', user?.id);
    console.log('Conversations:', conversations);
    
    if (user?.type === 'customer') {
      // Test the conversation mapping logic
      const conversationMap = new Map();
      
      conversations.forEach((conv, index) => {
        console.log(`\nConversation ${index + 1}:`, {
          id: conv._id,
          participants: conv.participants.map((p: any) => ({
            id: p.id || p._id,
            name: p.name,
            type: p.type
          }))
        });
        
        const other = conv.participants.find((p: any) => (p.id || p._id) !== user?.id);
        if (other) {
          conversationMap.set(other.id || other._id, conv);
          console.log(`Mapped provider ${other.id || other._id} to conversation ${conv._id}`);
        }
      });
      
      console.log('\nConversation map:', Array.from(conversationMap.entries()));
    } else {
      console.log('User is not a customer, this test is for customers only');
    }
  };

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <Card className="mb-4 border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="text-orange-800">Chat Debug Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <strong>Socket Connected:</strong> {isConnected ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Socket ID:</strong> {socket?.id || 'N/A'}
          </div>
          <div>
            <strong>User ID:</strong> {user?.id || 'N/A'}
          </div>
          <div>
            <strong>User Type:</strong> {user?.type || 'N/A'}
          </div>
          <div>
            <strong>Current Conversation:</strong> {currentConversation?._id || 'None'}
          </div>
          <div>
            <strong>Messages Count:</strong> {messages.length}
          </div>
          <div>
            <strong>Conversations Count:</strong> {conversations.length}
          </div>
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={runDebugTests}
            variant="outline"
            size="sm"
            className="text-orange-700 border-orange-300"
          >
            Run Debug Tests
          </Button>
          <Button 
            onClick={testSocketEmit}
            variant="outline"
            size="sm"
            className="text-orange-700 border-orange-300"
          >
            Test Socket Emit
          </Button>
          <Button 
            onClick={testConversationSelection}
            variant="outline"
            size="sm"
            className="text-orange-700 border-orange-300"
          >
            Test Conversation Selection
          </Button>
          <Button 
            onClick={testCustomerProviderMapping}
            variant="outline"
            size="sm"
            className="text-orange-700 border-orange-300"
          >
            Test Customer-Provider Mapping
          </Button>
          <Button 
            onClick={testCustomerConversationMapping}
            variant="outline"
            size="sm"
            className="text-orange-700 border-orange-300"
          >
            Test Customer Conversation Mapping
          </Button>
        </div>
        
        <div className="text-xs text-orange-600 mt-2">
          Check browser console for detailed debug information
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatDebugPanel; 