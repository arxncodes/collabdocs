import { useState, useRef } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { uploadProfilePicture, formatFileSize } from '@/lib/imageUpload';
import { supabase } from '@/db/supabase';
import { cn } from '@/lib/utils';

interface ProfilePictureUploadProps {
  userId: string;
  currentAvatarUrl: string | null;
  onUploadSuccess: (url: string) => void;
  className?: string;
}

export function ProfilePictureUpload({
  userId,
  currentAvatarUrl,
  onUploadSuccess,
  className,
}: ProfilePictureUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setProgress(0);

    try {
      const result = await uploadProfilePicture(file, userId, (p) => setProgress(p));

      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: result.url })
        .eq('id', userId);

      if (error) throw error;

      onUploadSuccess(result.url);

      // Show success message
      if (result.compressed) {
        toast({
          title: 'Profile picture uploaded',
          description: `Image was automatically compressed from ${formatFileSize(result.originalSize)} to ${formatFileSize(result.finalSize)}`,
        });
      } else {
        toast({
          title: 'Profile picture uploaded',
          description: 'Your profile picture has been updated successfully',
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload profile picture',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      setProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const getInitials = (email: string | null) => {
    if (!email) return '?';
    return email.charAt(0).toUpperCase();
  };

  return (
    <div
      className={cn('relative inline-block', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Profile Picture */}
      <div className="relative w-32 h-32 rounded-full overflow-hidden bg-muted border-4 border-border">
        {currentAvatarUrl ? (
          <img
            src={currentAvatarUrl}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl font-semibold text-muted-foreground">
            {getInitials(userId)}
          </div>
        )}

        {/* Hover Overlay */}
        {(isHovered || isUploading) && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity">
            {isUploading ? (
              <div className="flex flex-col items-center gap-2 px-4">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
                <Progress value={progress} className="w-full h-2" />
                <span className="text-xs text-white">{progress}%</span>
              </div>
            ) : (
              <Button
                size="sm"
                variant="secondary"
                onClick={handleClick}
                className="gap-2"
              >
                <Camera className="h-4 w-4" />
                Upload
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />
    </div>
  );
}
