import type { NextApiRequest, NextApiResponse } from 'next';
import { toDriveDirectPdf } from '@/lib/drive';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { url } = req.query;
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ message: 'Missing url parameter' });
    }

    // Convert Google Drive viewer links to direct PDF links
    const pdfUrl = toDriveDirectPdf(url);
    
    // Fetch the PDF
    const response = await fetch(pdfUrl, {
      headers: {
        'User-Agent': 'HinchCatalogThumbnail/1.0'
      }
    });

    if (!response.ok) {
      return res.status(502).json({ message: `Failed to fetch PDF: ${response.status}` });
    }

    const pdfBuffer = await response.arrayBuffer();
    
    // Import pdfjs-dist dynamically to avoid SSR issues
    const pdfjsLib = await import('pdfjs-dist');
    
    // Set up the worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    
    // Load the PDF document
    const pdf = await pdfjsLib.getDocument({ data: pdfBuffer }).promise;
    
    // Get the first page
    const page = await pdf.getPage(1);
    
    // Set up canvas for rendering
    const viewport = page.getViewport({ scale: 0.5 }); // Scale down for thumbnail
    const { createCanvas } = await import('canvas');
    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext('2d');
    
    // Render the page to canvas
    await page.render({
      canvasContext: context as any,
      viewport: viewport,
      canvas: canvas as any
    }).promise;
    
    // Convert canvas to image buffer
    const imageBuffer = canvas.toBuffer('image/jpeg', { quality: 0.8 });
    
    // Set headers for image response
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable'); // Cache for 24 hours
    res.setHeader('Content-Length', imageBuffer.length);
    
    // Send the image
    res.status(200).send(imageBuffer);
    
  } catch (error: any) {
    console.error('PDF thumbnail generation error:', error);
    
    // Return a fallback image or error
    res.status(500).json({ 
      message: 'Failed to generate PDF thumbnail',
      error: error.message 
    });
  }
}
