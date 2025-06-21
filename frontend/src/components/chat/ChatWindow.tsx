import React, { useEffect, useRef, useState } from 'react';
import { useConversations } from '@/contexts/ConversationContext';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Check, CheckCheck, Play, Pause, Download, File, Image as ImageIcon, FileAudio, X, ZoomIn, RotateCw } from 'lucide-react';
import axios from 'axios';
import { chatDebugger } from '@/utils/chatDebugger';
import { formatFileSize } from '@/utils/fileUtils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const ChatWindow: React.FC = () => {
  const { messages, currentConversation, loading, selectedProviderId, socket } = useConversations();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [provider, setProvider] = useState<any>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<{ url: string; filename: string } | null>(null);
  const [imageRotation, setImageRotation] = useState(0);

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

  // Use debug utility
  chatDebugger.logSocketStatus(socket, user);
  chatDebugger.logConversationStatus(currentConversation, currentMessages, user);

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
    // Scroll to bottom on new message with smooth behavior
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, [messages]);

  // Auto-scroll to bottom when conversation changes
  useEffect(() => {
    if (currentConversation && messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end'
        });
      }, 100);
    }
  }, [currentConversation?._id]);

  // Handle scroll restoration when switching conversations
  useEffect(() => {
    const messagesContainer = document.querySelector('.messages-container');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, [currentConversation?._id]);

  // Audio player component
  const AudioPlayer: React.FC<{ url: string; filename: string }> = ({ url, filename }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    // Extract filename from URL
    const getFilenameFromUrl = (url: string) => {
      const parts = url.split('/');
      return parts[parts.length - 1];
    };

    const audioFilename = getFilenameFromUrl(url);
    
    console.log('=== AUDIO PLAYER DEBUG ===');
    console.log('Original URL:', url);
    console.log('Extracted filename:', audioFilename);
    console.log('Audio source:', `http://localhost:5000${url}`);
    console.log('Full audio URL:', `http://localhost:5000${url}`);

    useEffect(() => {
      const audio = audioRef.current;
      if (!audio) return;

      // Test if the audio file can be loaded
      const testAudioLoad = async () => {
        try {
          const response = await fetch(`http://localhost:5000${url}`, { method: 'HEAD' });
          console.log('Audio file accessibility test:', response.status, response.statusText);
          if (!response.ok) {
            console.error('Audio file not accessible:', response.status);
            setError(true);
          }
        } catch (error) {
          console.error('Error testing audio file accessibility:', error);
        }
      };

      testAudioLoad();

      const handleLoadedMetadata = () => {
        setDuration(audio.duration);
        setIsLoading(false);
        setError(false);
        console.log('Audio metadata loaded successfully, duration:', audio.duration);
      };

      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
      };

      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        setPlayingAudio(null);
      };

      const handleError = () => {
        setError(true);
        setIsLoading(false);
        console.error('Audio playback error:', audio.error);
        console.error('Audio error details:', {
          error: audio.error,
          src: audio.src,
          networkState: audio.networkState,
          readyState: audio.readyState
        });
      };

      const handleCanPlay = () => {
        setIsLoading(false);
        setError(false);
      };

      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);
      audio.addEventListener('canplay', handleCanPlay);

      return () => {
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('canplay', handleCanPlay);
      };
    }, []);

    const togglePlay = () => {
      const audio = audioRef.current;
      if (!audio || error) return;

      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
        setPlayingAudio(null);
      } else {
        // Stop any other playing audio
        if (playingAudio && playingAudio !== url) {
          const otherAudio = document.querySelector(`audio[src="${playingAudio}"]`) as HTMLAudioElement;
          if (otherAudio) {
            otherAudio.pause();
            otherAudio.currentTime = 0;
          }
        }
        
        audio.play().catch(err => {
          console.error('Failed to play audio:', err);
          setError(true);
        });
        setIsPlaying(true);
        setPlayingAudio(url);
      }
    };

    const formatTime = (time: number) => {
      const mins = Math.floor(time / 60);
      const secs = Math.floor(time % 60);
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
      const audio = audioRef.current;
      if (!audio || error) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      const newTime = percentage * audio.duration;
      
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    };

    if (error) {
      return (
        <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
          <div className="p-2 bg-red-100 rounded-lg">
            <FileAudio className="h-5 w-5 text-red-600" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-red-900">{filename}</div>
            <div className="text-xs text-red-600">فشل في تحميل الملف الصوتي</div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
        <Button
          variant="ghost"
          size="sm"
          onClick={togglePlay}
          disabled={isLoading || error}
          className="h-10 w-10 p-0 bg-blue-100 hover:bg-blue-200 disabled:opacity-50"
        >
          {isLoading ? (
            <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700 truncate">{filename}</span>
            <span className="text-xs text-gray-500 flex-shrink-0">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          
          <div 
            className="w-full bg-gray-200 rounded-full h-2 cursor-pointer relative"
            onClick={handleSeek}
          >
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-100 relative"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            >
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-600 rounded-full shadow-sm opacity-0 hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>
        
        <audio 
          ref={audioRef} 
          src={`http://localhost:5000${url}`} 
          preload="metadata"
          crossOrigin="anonymous"
        />
      </div>
    );
  };

  // Attachment component
  const AttachmentDisplay: React.FC<{ attachment: any }> = ({ attachment }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    // Extract filename from the URL path
    const getFilenameFromUrl = (url: string) => {
      const pathParts = url.split('/');
      return pathParts[pathParts.length - 1];
    };

    const handleDownload = () => {
      const link = document.createElement('a');
      link.href = `http://localhost:5000${attachment.url}`;
      link.download = attachment.originalName;
      link.click();
    };

    const handleImageClick = () => {
      const filename = getFilenameFromUrl(attachment.url);
      setSelectedImage({
        url: `http://localhost:5000/api/conversations/images/${filename}`,
        filename: attachment.originalName
      });
      setImageRotation(0);
    };

    const handleImageLoad = () => {
      setImageLoaded(true);
    };

    const handleImageError = () => {
      setImageError(true);
      console.warn('Failed to load image:', attachment.url);
    };

    switch (attachment.type) {
      case 'image':
        const filename = getFilenameFromUrl(attachment.url);
        return (
          <div className="mt-2">
            <div className="relative group cursor-pointer inline-block image-container" onClick={handleImageClick}>
              <div className="relative overflow-hidden rounded-lg bg-gray-100 inline-block image-wrapper">
                {!imageLoaded && !imageError && (
                  <div className="flex items-center justify-center h-12 w-20 bg-gray-100 animate-pulse">
                    <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                  </div>
                )}
                {imageError ? (
                  <div className="flex items-center justify-center h-12 w-20 bg-gray-100 text-gray-500">
                    <div className="text-center">
                      <ImageIcon className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                      <p className="text-xs">فشل في تحميل الصورة</p>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setImageError(false);
                          setImageLoaded(false);
                          // Retry loading the image
                          const img = new Image();
                          img.onload = handleImageLoad;
                          img.onerror = handleImageError;
                          img.src = `http://localhost:5000/api/conversations/images/${filename}`;
                        }}
                        className="text-xs text-blue-500 hover:text-blue-700 mt-1"
                      >
                        إعادة المحاولة
                      </button>
                    </div>
                  </div>
                ) : (
                  <img
                    src={`http://localhost:5000/api/conversations/images/${filename}`}
                    alt={attachment.originalName}
                    className={cn(
                      "max-w-32 max-h-32 object-cover rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-105 transform-gpu",
                      imageLoaded ? "opacity-100" : "opacity-0"
                    )}
                    loading="lazy"
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    style={{ 
                      opacity: imageLoaded ? 1 : 0,
                      transform: imageLoaded ? 'scale(1)' : 'scale(0.95)',
                      transition: 'opacity 0.3s ease, transform 0.3s ease',
                      display: 'block'
                    }}
                  />
                )}
                {imageLoaded && !imageError && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-lg flex items-center justify-center">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
                        <ZoomIn className="h-5 w-5 text-gray-700" />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <ImageIcon className="h-3 w-3" />
                {attachment.originalName} • {formatFileSize(attachment.size)}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="h-6 w-6 p-0 hover:bg-gray-200 hover:scale-110 transition-transform duration-200"
              >
                <Download className="h-3 w-3" />
              </Button>
            </div>
          </div>
        );

      case 'audio':
        return (
          <div className="mt-2">
            <AudioPlayer url={attachment.url} filename={attachment.originalName} />
          </div>
        );

      case 'document':
      case 'file':
        return (
          <div className="mt-2 p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors duration-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <File className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm text-gray-900">{attachment.originalName}</div>
                <div className="text-xs text-gray-500">{formatFileSize(attachment.size)}</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="h-8 w-8 p-0 hover:bg-gray-200"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Image Modal Component
  const ImageModal: React.FC = () => {
    const handleRotate = () => {
      setImageRotation(prev => (prev + 90) % 360);
    };

    const handleDownload = () => {
      if (!selectedImage) return;
      const link = document.createElement('a');
      link.href = selectedImage.url;
      link.download = selectedImage.filename;
      link.click();
    };

    const handleClose = () => {
      setSelectedImage(null);
      setImageRotation(0);
    };

    // Handle keyboard events
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (selectedImage) {
          if (e.key === 'Escape') {
            handleClose();
          } else if (e.key === 'r' || e.key === 'R') {
            handleRotate();
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [selectedImage]);

    if (!selectedImage) return null;

    return (
      <Dialog open={!!selectedImage} onOpenChange={handleClose}>
        <DialogContent 
          className="max-w-4xl max-h-[70vh] p-0 bg-black"
          aria-describedby="image-modal-description"
        >
          <DialogHeader className="p-4 bg-black text-white">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-white">{selectedImage.filename}</DialogTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRotate}
                  className="h-8 w-8 p-0 hover:bg-gray-800 text-white"
                  title="Rotate (R)"
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownload}
                  className="h-8 w-8 p-0 hover:bg-gray-800 text-white"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="h-8 w-8 p-0 hover:bg-gray-800 text-white"
                  title="Close (Esc)"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>
          
          <div className="flex items-center justify-center p-4 bg-black">
            <img
              src={selectedImage.url}
              alt={selectedImage.filename}
              className="max-w-full max-h-[50vh] object-contain rounded-lg shadow-2xl"
              style={{ transform: `rotate(${imageRotation}deg)` }}
            />
          </div>
          
          {/* Hidden description for accessibility */}
          <div id="image-modal-description" className="sr-only">
            Image preview modal for {selectedImage.filename}. Use R key to rotate, Escape to close.
          </div>
        </DialogContent>
      </Dialog>
    );
  };

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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-white flex-shrink-0">
        <Avatar className="h-10 w-10">
          <AvatarImage src={provider?.profileImage || customer?.profileImage} />
          <AvatarFallback>
            {provider?.name?.charAt(0) || customer?.name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">
            {provider?.name || customer?.name || 'Chat'}
          </h3>
          <p className="text-sm text-gray-500">
            {provider?.service?.name || 'Conversation'}
          </p>
        </div>
      </div>

      {/* Messages - Fixed height with scroll */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 messages-container scroll-smooth" style={{ height: 'calc(100vh - 280px)' }}>
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
          <div className="space-y-4">
            {currentMessages.map((msg, index) => {
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
                    
                    {/* Attachments */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {msg.attachments.map((attachment, attachmentIndex) => (
                          <AttachmentDisplay key={attachmentIndex} attachment={attachment} />
                        ))}
                      </div>
                    )}
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
            })}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Image Modal */}
      <ImageModal />

      {/* Debug Panel */}
      {process.env.NODE_ENV === 'development' && (
        <div className="border-t p-2 bg-gray-50 flex-shrink-0">
          <details className="text-xs">
            <summary className="cursor-pointer font-medium">Debug Info</summary>
            <div className="mt-2 space-y-1">
              <div>Conversation ID: {currentConversation?._id}</div>
              <div>Messages: {currentMessages.length}</div>
              <div>Provider: {provider?.name}</div>
              <div>Customer: {customer?.name}</div>
              <div>Socket Connected: {socket?.connected ? 'Yes' : 'No'}</div>
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

export default ChatWindow; 