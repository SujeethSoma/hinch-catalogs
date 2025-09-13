/**
 * PDF Thumbnail Generation Helper
 * Handles PDF to image conversion with caching and CORS support
 */

export async function getPdfFirstPageDataUrl(
  pdfUrl: string, 
  maxW: number = 280
): Promise<string | null> {
  try {
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      return null;
    }

    // Check localStorage cache first
    const cacheKey = `pdf:thumb:${pdfUrl}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      return cached;
    }

    // Build proxy URL
    const proxyUrl = `/api/pdf-proxy?url=${encodeURIComponent(pdfUrl)}`;
    
    // Fetch PDF via proxy
    const response = await fetch(proxyUrl);
    if (!response.ok) {
      console.error(`Failed to fetch PDF via proxy: ${response.status}`);
      return null;
    }

    // Get PDF as ArrayBuffer
    const arrayBuffer = await response.arrayBuffer();
    
    // Lazy import PDF.js
    const pdfjsLib = await import('pdfjs-dist');
    
    // Set up worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

    // Load PDF document from bytes (not URL)
    const pdf = await pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer)
    }).promise;

    // Get first page
    const page = await pdf.getPage(1);
    
    // Calculate scale to fit maxW
    const viewport = page.getViewport({ scale: 1.0 });
    const scale = Math.min(maxW / viewport.width, 2.0); // Cap scale at 2.0
    const scaledViewport = page.getViewport({ scale });

    // Create canvas
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      throw new Error('Could not get canvas context');
    }

    canvas.height = scaledViewport.height;
    canvas.width = scaledViewport.width;

    // Render page to canvas
    const renderContext = {
      canvasContext: context,
      viewport: scaledViewport,
      canvas: canvas,
    };

    await page.render(renderContext).promise;

    // Convert to data URL
    const dataUrl = canvas.toDataURL('image/jpeg', 0.82);

    // Cache in localStorage
    try {
      localStorage.setItem(cacheKey, dataUrl);
    } catch (error) {
      console.warn('Failed to cache PDF thumbnail:', error);
      // Continue without caching
    }

    return dataUrl;

  } catch (error) {
    console.error('Error generating PDF thumbnail:', error);
    return null;
  }
}

/**
 * Clear PDF thumbnail cache
 */
export function clearPdfThumbnailCache(): void {
  if (typeof window === 'undefined') return;
  
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('pdf:thumb:')) {
      localStorage.removeItem(key);
    }
  });
}

/**
 * Get cache size for PDF thumbnails
 */
export function getPdfThumbnailCacheSize(): number {
  if (typeof window === 'undefined') return 0;
  
  const keys = Object.keys(localStorage);
  return keys.filter(key => key.startsWith('pdf:thumb:')).length;
}
