import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useConversations } from '@/contexts/ConversationContext';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Check, CheckCheck, Play, Pause, Download, File, Image as ImageIcon, FileAudio, X, ZoomIn, RotateCw, Paperclip, FileWarning } from 'lucide-react';
import axios from 'axios';
import { chatDebugger } from '@/utils/chatDebugger';
import { formatFileSize } from '@/utils/fileUtils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle2 } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const ChatWindow: React.FC = () => {
  const { 
    currentConversation, 
    messages, 
    loading: conversationLoading, 
    error: conversationError,
    getProviderForConversation, 
    getCustomerForConversation 
  } = useConversations();
  
  const { user: currentUser, userType } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Determine the other participant
  const otherParticipant = useMemo(() => {
    if (!currentConversation || !currentUser) return null;
    return currentConversation.participants.find(p => p._id !== currentUser._id);
  }, [currentConversation, currentUser]);

  // Audio player component
  const AudioPlayer: React.FC<{ url: string; filename: string; isSender: boolean }> = ({ url, filename, isSender }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    // Extract filename from URL
    const getFilenameFromUrl = (url: string) => {
      const parts = url.split('/');
      return parts[parts.length - 1];
    };

    const audioFilename = getFilenameFromUrl(url);

    useEffect(() => {
      const audio = audioRef.current;
      if (!audio) return;

      // Set the audio source
      audio.src = `http://localhost:5000${url}`;
      audio.preload = 'metadata';

      const handleLoadedMetadata = () => {
        console.log('Audio loaded metadata:', audio.duration);
        setDuration(audio.duration);
        setIsLoading(false);
        setError(false);
        setIsReady(true);
      };

      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
      };

      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        setPlayingAudio(null);
      };

      const handleError = (e: Event) => {
        console.error('Audio error:', e);
        setError(true);
        setIsLoading(false);
        setIsReady(false);
      };

      const handleCanPlay = () => {
        console.log('Audio can play');
        setIsLoading(false);
        setError(false);
        setIsReady(true);
      };

      const handleLoadStart = () => {
        console.log('Audio load started');
        setIsLoading(true);
        setError(false);
        setIsReady(false);
      };

      const handlePlay = () => {
        console.log('Audio started playing');
        setIsPlaying(true);
      };

      const handlePause = () => {
        console.log('Audio paused');
        setIsPlaying(false);
      };

      audio.addEventListener('loadstart', handleLoadStart);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);
      audio.addEventListener('canplay', handleCanPlay);
      audio.addEventListener('play', handlePlay);
      audio.addEventListener('pause', handlePause);

      return () => {
        audio.removeEventListener('loadstart', handleLoadStart);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('play', handlePlay);
        audio.removeEventListener('pause', handlePause);
      };
    }, [url]);

    const togglePlay = async () => {
      const audio = audioRef.current;
      if (!audio || error || !isReady) return;

      try {
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
          
          // Ensure audio is ready to play
          if (audio.readyState < 2) { // HAVE_CURRENT_DATA
            console.log('Audio not ready, waiting...');
            await new Promise((resolve) => {
              const handleCanPlayThrough = () => {
                audio.removeEventListener('canplaythrough', handleCanPlayThrough);
                resolve(true);
              };
              audio.addEventListener('canplaythrough', handleCanPlayThrough);
            });
          }
          
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            await playPromise;
            setIsPlaying(true);
            setPlayingAudio(url);
          }
        }
      } catch (err) {
        console.error('Failed to play audio:', err);
        setError(true);
        setIsPlaying(false);
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
        <div className={`flex items-center gap-2 p-2 rounded-lg text-red-700 ${isSender ? 'bg-red-200' : 'bg-red-100'}`}>
          <div className="p-2 bg-red-300 rounded-full">
            <FileAudio className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold">Audio failed</div>
            <div className="text-xs truncate">{filename}</div>
          </div>
        </div>
      );
    }

    const brandColor = 'rgba(59, 130, 246, 1)'; // blue-500
    const lightGray = '#f3f4f6'; // gray-100
    const darkGray = '#4b5563'; // gray-600

    return (
      <div className="flex items-center gap-3 p-1.5 w-48 md:w-56">
        {/* Hidden audio element */}
        <audio ref={audioRef} style={{ display: 'none' }} />
        
        <button
          onClick={togglePlay}
          disabled={isLoading || error || !isReady}
          className={`
            flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 text-white
            ${isPlaying ? 'bg-opacity-80' : 'bg-opacity-100'}
            ${isLoading ? 'animate-pulse' : ''}
            ${!isReady && !isLoading ? 'opacity-50' : ''}
          `}
          style={{ backgroundColor: isSender ? brandColor : darkGray }}
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4 ml-0.5" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="relative h-6 w-full flex items-center">
            <div 
              className="absolute w-full h-1 rounded-full cursor-pointer"
              onClick={handleSeek}
              style={{ backgroundColor: isSender ? 'rgba(255,255,255,0.3)' : lightGray }}
            >
              <div 
                className="h-full rounded-full"
                style={{ 
                  width: `${(currentTime / duration) * 100}%`,
                  backgroundColor: isSender ? 'white' : brandColor
                }}
              />
              <div 
                className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full shadow border-2"
                style={{ 
                  left: `${(currentTime / duration) * 100}%`, 
                  marginLeft: '-6px',
                  backgroundColor: isSender ? 'white' : brandColor,
                  borderColor: isSender ? 'rgba(255,255,255,0.5)' : lightGray,
                }}
              />
            </div>
          </div>
           <div className="flex justify-between items-center mt-1">
            <span className={`text-xs font-mono ${isSender ? 'text-blue-200' : 'text-gray-500'}`}>
              {formatTime(currentTime)}
            </span>
             <span className={`text-xs font-mono ${isSender ? 'text-blue-200' : 'text-gray-500'}`}>
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Attachment component
  const AttachmentDisplay: React.FC<{ attachment: any, isSender: boolean }> = ({ attachment, isSender }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    // Extract filename from the URL path
    const getFilenameFromUrl = (url: string) => {
      const pathParts = url.split('/');
      return pathParts[pathParts.length - 1];
    };

    // Construct the correct image URL
    const getImageUrl = (attachment: any) => {
      // If the attachment.url already contains the full path, use it
      if (attachment.url && attachment.url.startsWith('/uploads/')) {
        return `http://localhost:5000${attachment.url}`;
      }
      
      // Fallback: construct from filename
      const filename = attachment.filename || getFilenameFromUrl(attachment.url || '');
      return `http://localhost:5000/uploads/chat/images/${filename}`;
    };

    const imageUrl = getImageUrl(attachment);
    const filename = getFilenameFromUrl(attachment.url || '');

    const handleDownload = (e: React.MouseEvent) => {
      e.stopPropagation();
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    const handleImageClick = () => {
      setSelectedImage(imageUrl);
    };

    const handleImageLoad = () => {
      setImageLoaded(true);
      setImageError(false);
    };

    const handleImageError = () => {
      setImageError(true);
      setImageLoaded(true); // Stop loading animation
    };

    return (
      <div 
        className="relative m-1 rounded-xl overflow-hidden cursor-pointer group max-w-48"
        onClick={handleImageClick}
      >
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center" style={{ height: '150px', width: '150px' }}>
            <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}
        
        {imageError ? (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg flex flex-col items-center justify-center w-full">
            <FileWarning className="h-10 w-10 mb-2" />
            <span className="text-sm">Failed to load image</span>
            <span className="text-xs truncate max-w-full">{filename}</span>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={filename}
            className={`block w-full h-auto transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}

        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 via-black/40 to-transparent">
          <div className="flex items-center justify-between text-white">
            <p className="text-xs font-semibold truncate flex-1 mr-2">{filename}</p>
            <button
              onClick={handleDownload}
              className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white"
              title="Download"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Image Modal Component
  const ImageModal: React.FC<{ imageUrl: string | null; onClose: () => void }> = ({ imageUrl, onClose }) => {
    const [imageRotation, setImageRotation] = useState(0);

    const handleRotate = () => {
      setImageRotation(prev => (prev + 90) % 360);
    };

    const handleDownload = () => {
      if (!imageUrl) return;
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = imageUrl.split('/').pop() || 'image';
      link.click();
    };

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (imageUrl) {
          if (e.key === 'Escape') {
            onClose();
          } else if (e.key === 'r' || e.key === 'R') {
            handleRotate();
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [imageUrl, onClose]);

    if (!imageUrl) return null;

    const filename = imageUrl.split('/').pop() || 'Image';

    return (
      <Dialog open={!!imageUrl} onOpenChange={onClose}>
        <DialogContent 
          className="max-w-4xl max-h-[90vh] p-0 bg-black/80 backdrop-blur-sm border-gray-700"
          aria-describedby="image-modal-description"
        >
          <DialogHeader className="absolute top-0 left-0 right-0 z-10 p-2 bg-gradient-to-b from-black/50 to-transparent">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-white text-sm font-medium truncate">{filename}</DialogTitle>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRotate}
                  className="h-8 w-8 p-0 text-white hover:bg-white/20"
                  title="Rotate (R)"
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownload}
                  className="h-8 w-8 p-0 text-white hover:bg-white/20"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0 text-white hover:bg-white/20"
                  title="Close (Esc)"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>
          
          <div className="flex items-center justify-center h-full pt-10">
            <img
              src={imageUrl}
              alt={filename}
              className="max-w-full max-h-[80vh] object-contain transition-transform duration-300 ease-in-out"
              style={{ transform: `rotate(${imageRotation}deg)` }}
            />
          </div>
          
          <div id="image-modal-description" className="sr-only">
            Image preview: {filename}. Use R to rotate, Esc to close.
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  if (conversationLoading) {
    return <div className="flex-1 flex items-center justify-center"><LoadingSpinner /></div>;
  }

  if (conversationError) {
    return <div className="flex-1 flex items-center justify-center text-red-500">{conversationError}</div>;
  }

  if (!currentConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-center p-4">
        <div className="max-w-md">
          <img src="/placeholder.svg" alt="Select a conversation" className="w-48 h-48 mx-auto text-gray-300" />
          <h2 className="mt-4 text-2xl font-bold text-gray-800">Welcome to your Inbox</h2>
          <p className="mt-2 text-gray-500">
            Select a conversation from the list on the left to start chatting. If you don't have any conversations yet, find a service provider to begin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="flex items-center justify-between p-3 border-b bg-white">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={otherParticipant?.profilePicture} />
            <AvatarFallback>{otherParticipant?.name?.substring(0, 2) || '??'}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">{otherParticipant?.name || 'Chat'}</h2>
            <span className="text-sm text-gray-500">{otherParticipant?.role}</span>
          </div>
        </div>
      </header>

      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-2">
        {messages.map(msg => {
          const isSender = msg.sender?._id === currentUser?._id;

          return (
            <div key={msg._id} className={`flex items-start gap-3 ${isSender ? 'justify-end' : 'justify-start'}`}>
              {!isSender && (
                <Avatar className="h-9 w-9 self-start">
                  <AvatarImage src={msg.sender?.profilePicture || '/placeholder.svg'} />
                  <AvatarFallback>{msg.sender?.name?.substring(0, 2) || '??'}</AvatarFallback>
                </Avatar>
              )}
              <div className={`flex flex-col max-w-sm md:max-w-md ${isSender ? 'items-end' : 'items-start'}`}>
                <div
                  className={`
                    relative px-1 py-1 rounded-2xl shadow
                    ${isSender ? 'bg-blue-500 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'}
                  `}
                >
                  {/* Message Content */}
                  <div>
                    {msg.attachments && msg.attachments.length > 0 ? (
                      <div className="w-full">
                        {msg.attachments.map(att => {
                          if (att.mimeType?.startsWith('image/')) {
                            return <AttachmentDisplay key={att.url} attachment={att} isSender={isSender} />;
                          }
                          if (att.mimeType?.startsWith('audio/')) {
                            return <AudioPlayer key={att.url} url={att.url} filename={att.filename} isSender={isSender} />;
                          }
                          return (
                            <div key={att.url} className="p-3">
                              <a href={`http://localhost:5000${att.url}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm hover:underline">
                                <Paperclip className="h-4 w-4" />
                                <span className="truncate">{att.filename}</span>
                              </a>
                            </div>
                          );
                        })}
                        {msg.content && <p className={`px-3 pb-2 text-sm ${isSender ? 'text-white' : 'text-gray-800'}`}>{msg.content}</p>}
                      </div>
                    ) : (
                      <p className="px-3 py-2 text-sm">{msg.content}</p>
                    )}
                  </div>

                  {/* Timestamp */}
                  <div className={`text-xs mt-1 text-right px-2 ${isSender ? 'text-blue-200' : 'text-gray-400'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString('ar-EG', { hour: 'numeric', minute: 'numeric', hour12: true })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {selectedImage && <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />}
    </div>
  );
};

export default ChatWindow; 