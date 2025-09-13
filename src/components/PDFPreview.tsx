"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import PDF.js only on client side
const loadPDFJS = async () => {
  if (typeof window === 'undefined') return null;
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  return pdfjsLib;
};

interface PDFPreviewProps {
  pdfUrl: string;
  className?: string;
  fallback?: React.ReactNode;
}

export default function PDFPreview({ pdfUrl, className = "", fallback }: PDFPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const generatePreview = async () => {
      try {
        setLoading(true);
        setError(false);

        // Check if we're on client side
        if (typeof window === 'undefined') {
          setLoading(false);
          return;
        }

        // Check localStorage cache first
        const cacheKey = `pdf_preview_${pdfUrl}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          setPreviewUrl(cached);
          setLoading(false);
          return;
        }

        // Load PDF.js dynamically
        const pdfjsLib = await loadPDFJS();
        if (!pdfjsLib) {
          throw new Error('PDF.js not available');
        }

        // Load PDF and render first page
        const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
        const page = await pdf.getPage(1);
        
        const scale = 1.5;
        const viewport = page.getViewport({ scale });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (!context) {
          throw new Error('Could not get canvas context');
        }

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
          canvas: canvas
        };

        await page.render(renderContext).promise;
        
        // Convert to data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        
        // Cache in localStorage
        localStorage.setItem(cacheKey, dataUrl);
        
        setPreviewUrl(dataUrl);
      } catch (err) {
        console.error('Error generating PDF preview:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (pdfUrl) {
      generatePreview();
    }
  }, [pdfUrl]);

  if (loading) {
    return (
      <div className={`bg-gray-200 animate-pulse flex items-center justify-center ${className}`}>
        <div className="text-gray-500 text-sm">Loading preview...</div>
      </div>
    );
  }

  if (error || !previewUrl) {
    return fallback || (
      <div className={`bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center ${className}`}>
        <div className="text-gray-500 text-sm">Preview unavailable</div>
      </div>
    );
  }

  return (
    <img 
      src={previewUrl} 
      alt="PDF Preview" 
      className={`object-cover w-full h-full ${className}`}
    />
  );
}
