/**
 * Google Drive preview utilities
 * Handles extraction of Drive file IDs and URL building
 */

export interface DriveUrls {
  thumb: string;
  preview: string;
  download: string;
}

/**
 * Extract Google Drive file ID from various URL formats
 */
export function extractDriveId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  
  // Handle various Google Drive URL formats
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]{10,})/,           // /file/d/FILE_ID/
    /[?&]id=([a-zA-Z0-9_-]{10,})/,               // ?id=FILE_ID or &id=FILE_ID
    /\/open\?id=([a-zA-Z0-9_-]{10,})/,           // /open?id=FILE_ID
    /\/uc\?export=download&id=([a-zA-Z0-9_-]{10,})/ // /uc?export=download&id=FILE_ID
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Build Google Drive URLs for thumbnail, preview, and download
 */
export function buildDriveUrls(fileId: string): DriveUrls {
  const proxy = process.env.NEXT_PUBLIC_DRIVE_THUMBNAIL_PROXY;
  
  return {
    thumb: proxy 
      ? `${proxy}?id=${fileId}&w=1000`
      : `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`,
    preview: `https://drive.google.com/file/d/${fileId}/preview`,
    download: `https://drive.google.com/uc?export=download&id=${fileId}`
  };
}

/**
 * Check if a URL is a Google Drive link
 */
export function isDriveUrl(url: string): boolean {
  return /drive\.google\.com/i.test(url);
}

/**
 * Process a link and return appropriate URLs
 */
export function processDriveLink(url: string): {
  isDrive: boolean;
  fileId: string | null;
  urls: DriveUrls | null;
} {
  if (!url) {
    return { isDrive: false, fileId: null, urls: null };
  }
  
  const isDrive = isDriveUrl(url);
  const fileId = isDrive ? extractDriveId(url) : null;
  const urls = fileId ? buildDriveUrls(fileId) : null;
  
  // Debug logging
  if (isDrive && fileId) {
    console.log('Drive preview URLs:', urls);
  }
  
  return { isDrive, fileId, urls };
}


