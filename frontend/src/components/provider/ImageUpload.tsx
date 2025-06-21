import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Image, Upload, X } from 'lucide-react';

interface ImageUploadProps {
  title: string;
  description: string;
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
  aspectRatio?: 'square' | 'landscape' | 'portrait';
}

export default function ImageUpload({
  title,
  description,
  currentImage,
  onImageChange,
  aspectRatio = 'square'
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Convert to base64 for demo purposes
      // In production, you'd upload to a service like Cloudinary
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        onImageChange(base64);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    onImageChange('');
  };

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'landscape':
        return 'aspect-video';
      case 'portrait':
        return 'aspect-[3/4]';
      default:
        return 'aspect-square';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">{description}</p>
        
        <div className={`${getAspectRatioClass()} relative bg-gray-100 rounded-lg overflow-hidden`}>
          {currentImage ? (
            <>
              <img
                src={currentImage}
                alt={title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <Image className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">لا توجد صورة</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById(`image-upload-${title}`)?.click()}
            disabled={isUploading}
            className="flex-1"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                جاري الرفع...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                رفع صورة
              </>
            )}
          </Button>
          {currentImage && (
            <Button
              type="button"
              variant="destructive"
              onClick={removeImage}
              className="px-3"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <input
          id={`image-upload-${title}`}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
} 