import { supabase } from '@/db/supabase';

const MAX_FILE_SIZE = 1024 * 1024; // 1MB
const MAX_DIMENSION = 1080;
const COMPRESSION_QUALITY = 0.8;

interface CompressionResult {
  blob: Blob;
  compressed: boolean;
  originalSize: number;
  finalSize: number;
}

/**
 * Compress image to WEBP format with max 1080p resolution and <1MB size
 */
async function compressImage(file: File): Promise<CompressionResult> {
  const originalSize = file.size;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    img.onload = () => {
      // Calculate new dimensions maintaining aspect ratio
      let width = img.width;
      let height = img.height;

      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = (height / width) * MAX_DIMENSION;
          width = MAX_DIMENSION;
        } else {
          width = (width / height) * MAX_DIMENSION;
          height = MAX_DIMENSION;
        }
      }

      // Create canvas and compress
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Try compression with quality degradation if needed
      let quality = COMPRESSION_QUALITY;
      const tryCompress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            // If still too large and quality can be reduced, try again
            if (blob.size > MAX_FILE_SIZE && quality > 0.3) {
              quality -= 0.1;
              tryCompress();
            } else {
              resolve({
                blob,
                compressed: true,
                originalSize,
                finalSize: blob.size,
              });
            }
          },
          'image/webp',
          quality
        );
      };

      tryCompress();
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Validate file format
 */
function validateFileFormat(file: File): boolean {
  const validFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
  return validFormats.includes(file.type);
}

/**
 * Sanitize filename to only contain English letters and numbers
 */
function sanitizeFilename(filename: string): string {
  const ext = filename.split('.').pop() || 'webp';
  const name = filename.replace(/\.[^/.]+$/, '');
  const sanitized = name.replace(/[^a-zA-Z0-9]/g, '_');
  return `${sanitized}_${Date.now()}.${ext}`;
}

/**
 * Upload profile picture to Supabase Storage
 */
export async function uploadProfilePicture(
  file: File,
  userId: string,
  onProgress?: (progress: number) => void
): Promise<{ url: string; compressed: boolean; originalSize: number; finalSize: number }> {
  // Validate format
  if (!validateFileFormat(file)) {
    throw new Error('Invalid file format. Supported formats: JPEG, PNG, GIF, WEBP, AVIF');
  }

  // Check if compression is needed
  let uploadBlob: Blob = file;
  let compressed = false;
  let originalSize = file.size;
  let finalSize = file.size;

  if (file.size > MAX_FILE_SIZE) {
    if (onProgress) onProgress(10);
    const result = await compressImage(file);
    uploadBlob = result.blob;
    compressed = result.compressed;
    originalSize = result.originalSize;
    finalSize = result.finalSize;
    if (onProgress) onProgress(50);
  } else {
    if (onProgress) onProgress(30);
  }

  // Sanitize filename
  const filename = sanitizeFilename(file.name);
  const filePath = `${userId}/${filename}`;

  // Delete old profile pictures for this user
  const { data: existingFiles } = await supabase.storage
    .from('profile_images')
    .list(userId);

  if (existingFiles && existingFiles.length > 0) {
    const filesToDelete = existingFiles.map((f) => `${userId}/${f.name}`);
    await supabase.storage.from('profile_images').remove(filesToDelete);
  }

  if (onProgress) onProgress(70);

  // Upload new file
  const { data, error } = await supabase.storage
    .from('profile_images')
    .upload(filePath, uploadBlob, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  if (onProgress) onProgress(90);

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('profile_images')
    .getPublicUrl(data.path);

  if (onProgress) onProgress(100);

  return {
    url: urlData.publicUrl,
    compressed,
    originalSize,
    finalSize,
  };
}

/**
 * Delete profile picture from Supabase Storage
 */
export async function deleteProfilePicture(userId: string): Promise<void> {
  const { data: existingFiles } = await supabase.storage
    .from('profile_images')
    .list(userId);

  if (existingFiles && existingFiles.length > 0) {
    const filesToDelete = existingFiles.map((f) => `${userId}/${f.name}`);
    await supabase.storage.from('profile_images').remove(filesToDelete);
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
