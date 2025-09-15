import type { NextApiRequest, NextApiResponse } from 'next';
import { extractDriveId } from '@/lib/drive';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { url } = req.query;
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ message: 'Missing url parameter' });
    }

    // Extract Google Drive file ID
    const fileId = extractDriveId(url);
    
    if (!fileId) {
      return res.status(400).json({ message: 'Invalid Google Drive URL' });
    }

    // Use Google Drive's built-in thumbnail service
    // This generates a thumbnail of the first page of the PDF
    const thumbnailUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w400-h300`;
    
    // Fetch the thumbnail from Google Drive
    const response = await fetch(thumbnailUrl, {
      headers: {
        'User-Agent': 'HinchCatalogThumbnail/1.0'
      }
    });

    if (!response.ok) {
      return res.status(502).json({ message: `Failed to fetch thumbnail: ${response.status}` });
    }

    const imageBuffer = await response.arrayBuffer();
    
    // Set headers for image response
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable'); // Cache for 24 hours
    res.setHeader('Content-Length', imageBuffer.byteLength);
    
    // Send the image
    res.status(200).send(Buffer.from(imageBuffer));
    
  } catch (error: any) {
    console.error('PDF thumbnail generation error:', error);
    
    // Return a fallback image or error
    res.status(500).json({ 
      message: 'Failed to generate PDF thumbnail',
      error: error.message 
    });
  }
}
