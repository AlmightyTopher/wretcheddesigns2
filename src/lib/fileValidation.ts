import { ReadableStream } from 'stream/web';

export class FileValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileValidationError';
  }
}

// Allowed file types and their MIME types
const ALLOWED_IMAGE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif'],
} as const;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MIN_FILE_SIZE = 1024; // 1KB

/**
 * Validates file type by checking both MIME type and file extension
 */
export function validateFileType(file: File): void {
  const mimeType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  // Check if MIME type is allowed
  if (!Object.keys(ALLOWED_IMAGE_TYPES).includes(mimeType)) {
    throw new FileValidationError(`File type ${mimeType} is not allowed. Allowed types: ${Object.keys(ALLOWED_IMAGE_TYPES).join(', ')}`);
  }

  // Check if file extension matches MIME type
  const allowedExtensions = ALLOWED_IMAGE_TYPES[mimeType as keyof typeof ALLOWED_IMAGE_TYPES];
  const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));

  if (!hasValidExtension) {
    throw new FileValidationError(`File extension does not match MIME type ${mimeType}`);
  }
}

/**
 * Validates file size
 */
export function validateFileSize(file: File): void {
  if (file.size > MAX_FILE_SIZE) {
    throw new FileValidationError(`File size ${file.size} bytes exceeds maximum allowed size of ${MAX_FILE_SIZE} bytes`);
  }

  if (file.size < MIN_FILE_SIZE) {
    throw new FileValidationError(`File size ${file.size} bytes is below minimum size of ${MIN_FILE_SIZE} bytes`);
  }
}

/**
 * Validates image dimensions (requires canvas support)
 */
export function validateImageDimensions(file: File, maxWidth = 4096, maxHeight = 4096): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      if (img.width > maxWidth || img.height > maxHeight) {
        reject(new FileValidationError(`Image dimensions ${img.width}x${img.height} exceed maximum allowed ${maxWidth}x${maxHeight}`));
      } else {
        resolve();
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new FileValidationError('Invalid image file'));
    };

    img.src = url;
  });
}

/**
 * Validates file content by checking magic bytes
 */
export async function validateFileContent(file: File): Promise<void> {
  const buffer = await file.slice(0, 12).arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // Check magic bytes for common image formats
  const signatures = {
    jpeg: [0xFF, 0xD8, 0xFF],
    png: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
    gif: [0x47, 0x49, 0x46, 0x38],
    webp: [0x52, 0x49, 0x46, 0x46], // RIFF (WebP starts with RIFF)
  };

  let isValid = false;

  // Check JPEG
  if (bytes.length >= 3 &&
      bytes[0] === signatures.jpeg[0] &&
      bytes[1] === signatures.jpeg[1] &&
      bytes[2] === signatures.jpeg[2]) {
    isValid = true;
  }

  // Check PNG
  if (bytes.length >= 8 && signatures.png.every((byte, i) => bytes[i] === byte)) {
    isValid = true;
  }

  // Check GIF
  if (bytes.length >= 4 && signatures.gif.every((byte, i) => bytes[i] === byte)) {
    isValid = true;
  }

  // Check WebP (simplified check)
  if (bytes.length >= 4 && signatures.webp.every((byte, i) => bytes[i] === byte)) {
    // WebP has WEBP at bytes 8-11
    if (bytes.length >= 12 &&
        bytes[8] === 0x57 && bytes[9] === 0x45 &&
        bytes[10] === 0x42 && bytes[11] === 0x50) {
      isValid = true;
    }
  }

  if (!isValid) {
    throw new FileValidationError('File content does not match expected image format');
  }
}

/**
 * Comprehensive file validation
 */
export async function validateFile(file: File, options?: {
  maxWidth?: number;
  maxHeight?: number;
  skipDimensionCheck?: boolean;
  skipContentCheck?: boolean;
}): Promise<void> {
  const {
    maxWidth = 4096,
    maxHeight = 4096,
    skipDimensionCheck = false,
    skipContentCheck = false,
  } = options || {};

  // Basic validations
  validateFileType(file);
  validateFileSize(file);

  // Content validation
  if (!skipContentCheck) {
    await validateFileContent(file);
  }

  // Dimension validation (browser only)
  if (!skipDimensionCheck && typeof window !== 'undefined') {
    await validateImageDimensions(file, maxWidth, maxHeight);
  }
}

/**
 * Sanitize filename for safe storage
 */
export function sanitizeFilename(filename: string): string {
  // Remove path traversal attempts
  const basename = filename.split('/').pop()?.split('\\').pop() || 'file';

  // Replace dangerous characters
  return basename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
}

/**
 * Generate secure random filename
 */
export function generateSecureFilename(originalFilename: string): string {
  const ext = originalFilename.split('.').pop()?.toLowerCase() || '';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);

  return `${timestamp}_${random}.${ext}`;
}
