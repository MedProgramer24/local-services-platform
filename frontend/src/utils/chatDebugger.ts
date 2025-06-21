// Chat Debug Utility
export const chatDebugger = {
  logSocketStatus: (socket: any, user: any) => {
    console.log('=== CHAT DEBUG: SOCKET STATUS ===');
    console.log('Socket connected:', !!socket);
    console.log('Socket ID:', socket?.id);
    console.log('User ID:', user?.id);
    console.log('User type:', user?.type);
    console.log('Socket ready state:', socket?.readyState);
  },

  logConversationStatus: (conversation: any, messages: any[], user: any) => {
    console.log('=== CHAT DEBUG: CONVERSATION STATUS ===');
    console.log('Conversation ID:', conversation?._id);
    console.log('Conversation participants:', conversation?.participants);
    console.log('Current user in participants:', conversation?.participants?.some((p: any) => (p.id || p._id) === user?.id));
    console.log('Messages count:', messages?.length);
    console.log('Messages:', messages?.map(m => ({ 
      id: m._id, 
      sender: m.senderId, 
      content: m.content ? m.content.substring(0, 50) : 'No content' 
    })));
  },

  logMessageFlow: (message: any, conversationId: string, user: any) => {
    console.log('=== CHAT DEBUG: MESSAGE FLOW ===');
    console.log('Message ID:', message._id);
    console.log('Conversation ID:', message.conversationId);
    console.log('Expected conversation ID:', conversationId);
    console.log('Sender ID:', message.senderId);
    console.log('Current user ID:', user?.id);
    console.log('Is from current user:', message.senderId === user?.id);
    console.log('Message content:', message.content);
    console.log('Timestamp:', message.timestamp);
  },

  testSocketConnection: (socket: any) => {
    if (!socket) {
      console.error('=== CHAT DEBUG: SOCKET NOT AVAILABLE ===');
      return false;
    }

    console.log('=== CHAT DEBUG: TESTING SOCKET CONNECTION ===');
    console.log('Socket ready state:', socket.readyState);
    console.log('Socket connected:', socket.connected);
    console.log('Socket ID:', socket.id);

    // Test emit
    socket.emit('test', { message: 'Test message from debugger' });
    console.log('Test message emitted');

    return socket.connected;
  },

  validateConversationData: (conversation: any, user: any) => {
    console.log('=== CHAT DEBUG: VALIDATING CONVERSATION DATA ===');
    
    if (!conversation) {
      console.error('Conversation is null or undefined');
      return false;
    }

    if (!conversation._id) {
      console.error('Conversation missing _id');
      return false;
    }

    if (!conversation.participants || !Array.isArray(conversation.participants)) {
      console.error('Conversation missing or invalid participants array');
      return false;
    }

    const userInParticipants = conversation.participants.some((p: any) => 
      (p.id || p._id) === user?.id
    );

    if (!userInParticipants) {
      console.error('Current user not found in conversation participants');
      return false;
    }

    console.log('Conversation data is valid');
    return true;
  }
}; 