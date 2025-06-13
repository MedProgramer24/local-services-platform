// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Get file type from mime type
export const getFileType = (mimeType: string): 'image' | 'document' | 'audio' | 'file' => {
  if (mimeType.startsWith('image/')) {
    return 'image';
  } else if (mimeType.startsWith('audio/')) {
    return 'audio';
  } else if (mimeType.startsWith('application/') || mimeType.startsWith('text/')) {
    return 'document';
  } else {
    return 'file';
  }
};

// Get file icon based on type
export const getFileIcon = (type: string) => {
  switch (type) {
    case 'image':
      return '🖼️';
    case 'audio':
      return '🎵';
    case 'document':
      return '📄';
    default:
      return '📎';
  }
};

// Validate file type
export const isValidFileType = (file: File): boolean => {
  const allowedTypes = [
    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    // Audio
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/webm',
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    // Other files
    'application/zip',
    'application/rar',
    'application/x-zip-compressed'
  ];

  return allowedTypes.includes(file.type);
};

// Validate file size
export const isValidFileSize = (file: File, maxSize: number = 10 * 1024 * 1024): boolean => {
  return file.size <= maxSize;
};

// Get file extension
export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

// Create object URL for preview
export const createPreviewUrl = (file: File): string => {
  return URL.createObjectURL(file);
};

// Revoke object URL to free memory
export const revokePreviewUrl = (url: string): void => {
  URL.revokeObjectURL(url);
}; 