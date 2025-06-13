import React, { useState, useRef } from 'react';
import { useConversations } from '@/contexts/ConversationContext';
import { useAuth } from '@/contexts/AuthContext';
import { Send, Paperclip, Smile, Mic, MicOff, X, File, Image, FileAudio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatFileSize } from '@/utils/fileUtils';

const MessageInput: React.FC = () => {
  const { sendMessage, currentConversation, loading, createConversation, selectedProviderId } = useConversations();
  const { user } = useAuth();
  const [value, setValue] = useState('');
  const [sending, setSending] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Debug logging
  console.log('=== MESSAGE INPUT DEBUG ===');
  console.log('currentConversation:', currentConversation?._id);
  console.log('selectedProviderId:', selectedProviderId);
  console.log('loading:', loading);
  console.log('should show input:', !!(currentConversation || selectedProviderId));
  console.log('attachments:', attachments.length);

  const handleSend = async () => {
    if ((!value.trim() && attachments.length === 0)) return;
    
    setSending(true);
    try {
      const formData = new FormData();
      formData.append('content', value.trim());
      
      // Add attachments
      attachments.forEach((file, index) => {
        formData.append('attachments', file);
      });

      if (currentConversation) {
        // Send message to existing conversation
        await sendMessage(currentConversation._id, value.trim(), formData);
      } else if (selectedProviderId) {
        // Create new conversation and send first message
        const newConversation = await createConversation(selectedProviderId);
        await sendMessage(newConversation._id, value.trim(), formData);
      }
      
      setValue('');
      setAttachments([]);
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });

    setAttachments(prev => [...prev, ...validFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        const audioFile = new File([audioBlob], `voice-message-${Date.now()}.wav`, { type: 'audio/wav' });
        setAttachments(prev => [...prev, audioFile]);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (file.type.startsWith('audio/')) return <FileAudio className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  // If no current conversation, don't show the input
  if (!currentConversation && !selectedProviderId) {
    return null;
  }

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <div key={index} className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
              {getFileIcon(file)}
              <span className="text-sm text-gray-700 truncate max-w-32">{file.name}</span>
              <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeAttachment(index)}
                className="h-6 w-6 p-0 hover:bg-gray-200"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        {/* File Upload Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="h-10 w-10 p-0 hover:bg-gray-100"
          disabled={sending}
        >
          <Paperclip className="h-5 w-5" />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,audio/*,.pdf,.doc,.docx,.txt,.csv,.xls,.xlsx,.ppt,.pptx,.zip,.rar"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Voice Recording Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={isRecording ? stopRecording : startRecording}
          className={`h-10 w-10 p-0 ${
            isRecording 
              ? 'bg-red-100 hover:bg-red-200 text-red-600' 
              : 'hover:bg-gray-100'
          }`}
          disabled={sending}
        >
          {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>

        {/* Recording Timer */}
        {isRecording && (
          <span className="text-sm text-red-600 font-mono">
            {formatTime(recordingTime)}
          </span>
        )}

        {/* Message Input */}
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="اكتب رسالة..."
          className="flex-1"
          disabled={sending}
        />

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={sending || (!value.trim() && attachments.length === 0)}
          className="h-10 w-10 p-0 bg-blue-600 hover:bg-blue-700"
        >
          {sending ? (
            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default MessageInput; 