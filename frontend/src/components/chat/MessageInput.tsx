import React, { useState, useRef, useEffect } from 'react';
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
  console.log('attachments details:', attachments.map(f => ({ name: f.name, type: f.type, size: f.size })));

  // Monitor attachments state changes
  useEffect(() => {
    console.log('Attachments state changed:', attachments.length, 'files');
    attachments.forEach((file, index) => {
      console.log(`Attachment ${index}:`, file.name, file.type, file.size);
    });
  }, [attachments]);

  const handleSend = async () => {
    if ((!value.trim() && attachments.length === 0)) return;
    
    console.log('=== SENDING MESSAGE ===');
    console.log('Content:', value.trim());
    console.log('Attachments count:', attachments.length);
    console.log('Attachments:', attachments.map(f => ({ name: f.name, type: f.type, size: f.size })));
    
    setSending(true);
    try {
      let formData: FormData | undefined;

      // Only create FormData if there are attachments
      if (attachments.length > 0) {
        // Filter out invalid files - be more flexible with file validation
        const validAttachments = attachments.filter(file => {
          // Check if it has the required properties for upload (works for both File objects and our custom File-like objects)
          if (file && typeof file === 'object' && 'name' in file && 'size' in file && 'type' in file) {
            console.log('Valid file object:', file.name, file.type, file.size);
            return true;
          }
          
          console.warn('Invalid file object:', file);
          return false;
        });
        
        if (validAttachments.length === 0) {
          console.error('No valid files found, cannot send message');
          alert('لا توجد ملفات صالحة لإرسالها');
          setSending(false);
          return;
        }
        
        formData = new FormData();
        
        // Only append content if it's not empty
        if (value.trim()) {
          formData.append('content', value.trim());
        }
        
        // Add attachments
        validAttachments.forEach((file, index) => {
          console.log(`Adding attachment ${index}:`, file.name, file.type, file.size);
          console.log('File object:', file);
          console.log('File type:', typeof file);
          
          // Check if it's a regular File object (without using instanceof)
          const isRegularFile = file && typeof file === 'object' && 'name' in file && 'size' in file && 'type' in file && !('_blob' in file);
          
          if (isRegularFile) {
            console.log('Using regular File object');
            formData!.append('attachments', file);
          } else {
            // For our custom File-like objects, use the stored Blob data
            console.log('Using custom File-like object');
            const blob = (file as any)._blob || file;
            console.log('Blob extracted:', blob);
            console.log('Blob type:', typeof blob);
            console.log('Blob instanceof Blob:', blob instanceof Blob);
            console.log('Blob size:', blob.size);
            console.log('Blob type:', blob.type);
            
            try {
              const fileWithName = new File([blob], file.name, { type: file.type });
              console.log('File created from blob:', fileWithName);
              console.log('New file size:', fileWithName.size);
              console.log('New file type:', fileWithName.type);
              formData!.append('attachments', fileWithName);
              console.log('File appended to FormData successfully');
            } catch (error) {
              console.error('Error creating File from blob:', error);
              // Fallback: try to append the blob directly
              try {
                formData!.append('attachments', blob, file.name);
                console.log('Blob appended directly to FormData');
              } catch (fallbackError) {
                console.error('Fallback also failed:', fallbackError);
                throw new Error('Failed to create uploadable file');
              }
            }
          }
        });
        
        // Debug FormData contents
        console.log('FormData created with attachments');
        for (let [key, value] of formData.entries()) {
          console.log(`FormData entry: ${key} =`, value);
        }
      } else {
        console.log('No attachments, will send as JSON');
      }

      // Final check: ensure we have either content or valid attachments
      if (!value.trim() && (!formData || !formData.has('attachments'))) {
        console.error('No content and no valid attachments, cannot send message');
        alert('يرجى إدخال نص أو إرفاق ملف');
        setSending(false);
        return;
      }

      if (currentConversation) {
        // Send message to existing conversation
        console.log('Sending to existing conversation:', currentConversation._id);
        await sendMessage(currentConversation._id, value.trim(), formData);
      } else if (selectedProviderId) {
        // Create new conversation and send first message
        console.log('Creating new conversation with provider:', selectedProviderId);
        const newConversation = await createConversation(selectedProviderId);
        console.log('New conversation created:', newConversation._id);
        await sendMessage(newConversation._id, value.trim(), formData);
      }
      
      setValue('');
      setAttachments([]);
      console.log('Message sent successfully');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('فشل في إرسال الرسالة. يرجى المحاولة مرة أخرى.');
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
    console.log('=== STARTING AUDIO RECORDING ===');
    try {
      // First, check if MediaRecorder is supported
      if (!window.MediaRecorder) {
        alert('متصفحك لا يدعم تسجيل الصوت. يرجى استخدام متصفح حديث.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        } 
      });
      
      console.log('Audio stream obtained successfully');
      
      // Try different MIME types in order of preference
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/wav'
      ];
      
      let mimeType = null;
      for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          break;
        }
      }
      
      if (!mimeType) {
        alert('متصفحك لا يدعم تنسيقات الصوت المتاحة.');
        return;
      }
      
      console.log('Using MIME type:', mimeType);
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        console.log('Data available:', event.data.size, 'bytes');
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        console.log('Recording stopped, processing audio file...');
        console.log('Total chunks collected:', chunks.length);
        
        if (chunks.length === 0) {
          console.error('No audio data collected!');
          alert('لم يتم تسجيل أي صوت. يرجى المحاولة مرة أخرى.');
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        
        const audioBlob = new Blob(chunks, { type: mimeType });
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const extension = mimeType.includes('webm') ? 'webm' : mimeType.includes('mp4') ? 'm4a' : 'wav';
        
        // Create a File-like object that works in all environments
        const audioFile: File = {
          // Include the actual Blob data
          _blob: audioBlob,
          
          // Inherit all Blob properties
          size: audioBlob.size,
          type: audioBlob.type,
          arrayBuffer: audioBlob.arrayBuffer.bind(audioBlob),
          slice: audioBlob.slice.bind(audioBlob),
          stream: audioBlob.stream.bind(audioBlob),
          text: audioBlob.text.bind(audioBlob),
          
          // Add File-specific properties
          name: `voice-message-${timestamp}.${extension}`,
          lastModified: Date.now()
        } as File;
        
        console.log('Audio file created successfully:', audioFile.name, audioFile.size, 'bytes');
        console.log('File type:', typeof audioFile);
        console.log('Has name property:', 'name' in audioFile);
        console.log('Has size property:', 'size' in audioFile);
        
        // Check if the file has actual data
        if (audioFile.size === 0) {
          console.error('Audio file has no data!');
          alert('لم يتم تسجيل أي صوت. يرجى المحاولة مرة أخرى.');
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        
        // Check file size (max 10MB)
        if (audioFile.size > 10 * 1024 * 1024) {
          alert('الرسالة الصوتية كبيرة جداً. الحد الأقصى 10 ميجابايت.');
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        
        console.log('Adding audio file to attachments...');
        setAttachments(prev => {
          const newAttachments = [...prev, audioFile];
          console.log('New attachments array:', newAttachments.length, 'files');
          return newAttachments;
        });
        console.log('Audio file added to attachments');
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        alert('حدث خطأ أثناء التسجيل الصوتي');
        stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
      };

      mediaRecorder.onstart = () => {
        console.log('MediaRecorder started successfully');
      };

      mediaRecorderRef.current = mediaRecorder;
      
      // Start recording with smaller time slices for more frequent data collection
      mediaRecorder.start(100); // Collect data every 100ms instead of 1000ms
      console.log('MediaRecorder started');
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          alert('يرجى السماح بالوصول إلى الميكروفون');
        } else if (error.name === 'NotFoundError') {
          alert('لم يتم العثور على ميكروفون');
        } else {
          alert('حدث خطأ في الوصول إلى الميكروفون');
        }
      } else {
        alert('حدث خطأ غير متوقع');
      }
    }
  };

  const stopRecording = () => {
    console.log('=== STOPPING AUDIO RECORDING ===');
    if (mediaRecorderRef.current && isRecording) {
      try {
        console.log('Stopping MediaRecorder...');
        
        // Stop the timer first
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
          recordingIntervalRef.current = null;
        }
        
        // Stop the media recorder
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        console.log('Recording stopped successfully');
        
        // Add a fallback timeout to ensure the onstop callback is triggered
        setTimeout(() => {
          console.log('Fallback: Checking if audio file was created...');
          if (attachments.length === 0) {
            console.log('No audio file created, this might indicate an issue with the recording process');
          }
        }, 3000); // Increased timeout to 3 seconds
        
      } catch (error) {
        console.error('Error stopping recording:', error);
        setIsRecording(false);
        alert('حدث خطأ أثناء إيقاف التسجيل');
      }
    } else {
      console.log('No active recording to stop');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getFileIcon = (file: File) => {
    // Safely check file type
    const fileType = file.type || '';
    const fileName = file.name || '';
    
    // Try to determine type from file extension if MIME type is not available
    if (!fileType && fileName) {
      const extension = fileName.split('.').pop()?.toLowerCase();
      if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
        return <Image className="h-4 w-4" />;
      }
      if (['mp3', 'wav', 'ogg', 'webm', 'm4a'].includes(extension || '')) {
        return <FileAudio className="h-4 w-4" />;
      }
    }
    
    if (fileType.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (fileType.startsWith('audio/')) return <FileAudio className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  // If no current conversation, don't show the input
  if (!currentConversation && !selectedProviderId) {
    return null;
  }

  return (
    <div className="border-t border-gray-200 bg-white p-3">
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <div key={index} className="flex items-center gap-2 bg-gray-100 rounded-lg px-2 py-1">
              {getFileIcon(file)}
              <span className="text-xs text-gray-700 truncate max-w-24">
                {file.name || 'Unknown file'}
              </span>
              <span className="text-xs text-gray-500">
                {file.size ? formatFileSize(file.size) : 'Unknown size'}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeAttachment(index)}
                className="h-5 w-5 p-0 hover:bg-gray-200"
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
          className="h-9 w-9 p-0 hover:bg-gray-100"
          disabled={sending}
        >
          <Paperclip className="h-4 w-4" />
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
          className={`h-9 w-9 p-0 ${
            isRecording 
              ? 'bg-red-100 hover:bg-red-200 text-red-600 recording-indicator' 
              : 'hover:bg-gray-100'
          }`}
          disabled={sending}
        >
          {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>

        {/* Recording Timer */}
        {isRecording && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full recording-indicator"></div>
            <span className="text-xs text-red-600 font-mono">
              {formatTime(recordingTime)}
            </span>
          </div>
        )}

        {/* Message Input */}
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="اكتب رسالة..."
          className="flex-1 h-9 text-sm"
          disabled={sending}
        />

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={sending || (!value.trim() && attachments.length === 0)}
          className={`h-9 w-9 p-0 ${
            sending || (!value.trim() && attachments.length === 0)
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {sending ? (
            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
        
        {/* Debug info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-500 ml-2">
            Debug: {attachments.length} attachments, sending: {sending.toString()}, canSend: {(!value.trim() && attachments.length === 0) ? 'false' : 'true'}
          </div>
        )}
        
        {/* Manual send button for testing */}
        {process.env.NODE_ENV === 'development' && attachments.length > 0 && (
          <Button
            onClick={handleSend}
            className="h-9 px-3 bg-green-600 hover:bg-green-700 text-white text-xs"
          >
            Send Audio ({attachments.length})
          </Button>
        )}
        
        {/* Test audio file creation */}
        {process.env.NODE_ENV === 'development' && (
          <Button
            onClick={() => {
              console.log('Creating test audio file...');
              try {
                // Create a simple audio blob
                const testBlob = new Blob(['test audio data'], { type: 'audio/webm' });
                
                // Use a different approach to create a file-like object
                const testFile = {
                  name: `test-audio-${Date.now()}.webm`,
                  type: 'audio/webm',
                  size: testBlob.size,
                  lastModified: Date.now(),
                  slice: testBlob.slice.bind(testBlob),
                  stream: testBlob.stream.bind(testBlob),
                  text: testBlob.text.bind(testBlob),
                  arrayBuffer: testBlob.arrayBuffer.bind(testBlob)
                } as File;
                
                setAttachments(prev => [...prev, testFile]);
                console.log('Test audio file created');
              } catch (error) {
                console.error('Error creating test file:', error);
                alert('Error creating test file: ' + error.message);
              }
            }}
            className="h-9 px-3 bg-yellow-600 hover:bg-yellow-700 text-white text-xs"
          >
            Create Test Audio
          </Button>
        )}
        
        {/* Browser compatibility check */}
        {process.env.NODE_ENV === 'development' && (
          <Button
            onClick={() => {
              console.log('=== BROWSER COMPATIBILITY CHECK ===');
              console.log('MediaRecorder supported:', !!window.MediaRecorder);
              console.log('navigator.mediaDevices supported:', !!navigator.mediaDevices);
              console.log('getUserMedia supported:', !!navigator.mediaDevices?.getUserMedia);
              
              const mimeTypes = [
                'audio/webm;codecs=opus',
                'audio/webm',
                'audio/mp4',
                'audio/wav'
              ];
              
              mimeTypes.forEach(type => {
                console.log(`${type} supported:`, MediaRecorder.isTypeSupported(type));
              });
              
              alert(`MediaRecorder: ${!!window.MediaRecorder}\nMIME Types: ${mimeTypes.filter(type => MediaRecorder.isTypeSupported(type)).join(', ')}`);
            }}
            className="h-9 px-3 bg-purple-600 hover:bg-purple-700 text-white text-xs"
          >
            Check Browser
          </Button>
        )}
      </div>
    </div>
  );
};

export default MessageInput; 