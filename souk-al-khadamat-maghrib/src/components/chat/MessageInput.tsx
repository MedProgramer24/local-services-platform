import React, { useState } from 'react';
import { useConversations } from '@/contexts/ConversationContext';
import { useAuth } from '@/contexts/AuthContext';
import { Send, Paperclip, Smile, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const MessageInput: React.FC = () => {
  const { sendMessage, currentConversation, loading, createConversation, selectedProviderId } = useConversations();
  const { user } = useAuth();
  const [value, setValue] = useState('');
  const [sending, setSending] = useState(false);

  // Debug logging
  console.log('=== MESSAGE INPUT DEBUG ===');
  console.log('currentConversation:', currentConversation?._id);
  console.log('selectedProviderId:', selectedProviderId);
  console.log('loading:', loading);
  console.log('should show input:', !!(currentConversation || selectedProviderId));

  const handleSend = async () => {
    if (!value.trim()) return;
    
    setSending(true);
    try {
      if (currentConversation) {
        // Send message to existing conversation
        await sendMessage(currentConversation._id, value.trim());
      } else if (selectedProviderId) {
        // Create new conversation and send first message
        const newConversation = await createConversation(selectedProviderId);
        await sendMessage(newConversation._id, value.trim());
      }
      setValue('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // If no current conversation, don't show the input
  if (!currentConversation && !selectedProviderId) {
    return null;
  }

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      <div className="flex items-end space-x-3 space-x-reverse">
        {/* Attachment Button */}
        <Button
          variant="ghost"
          size="sm"
          className="h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all duration-300 hover:scale-110"
          aria-label="إرفاق ملف"
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        {/* Emoji Button */}
        <Button
          variant="ghost"
          size="sm"
          className="h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all duration-300 hover:scale-110"
          aria-label="إضافة رمز تعبيري"
        >
          <Smile className="h-5 w-5" />
        </Button>

        {/* Message Input */}
        <div className="flex-1 relative">
          <Input
            type="text"
            className="w-full pr-12 pl-4 py-3 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 rounded-2xl text-sm placeholder-gray-500 focus-ring"
            placeholder={currentConversation ? "اكتب رسالة..." : "اكتب رسالة لبدء محادثة جديدة..."}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading || sending}
            dir="auto"
          />
          
          {/* Voice Message Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-2 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all duration-300 hover:scale-110"
            aria-label="رسالة صوتية"
          >
            <Mic className="h-4 w-4" />
          </Button>
        </div>

        {/* Send Button */}
        <Button
          size="sm"
          onClick={handleSend}
          disabled={loading || sending || !value.trim()}
          className={`
            h-12 w-12 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg hover:shadow-xl
            ${value.trim() 
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
          aria-label="إرسال"
        >
          {sending ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
      
      {/* Character Count */}
      {value.length > 0 && (
        <div className="flex justify-between items-center mt-2 px-2">
          <span className="text-xs text-gray-500">
            {value.length} حرف
          </span>
          <span className="text-xs text-gray-400">
            اضغط Enter للإرسال
          </span>
        </div>
      )}
    </div>
  );
};

export default MessageInput; 