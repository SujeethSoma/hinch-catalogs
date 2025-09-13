import React, { useState, useEffect } from 'react';
import { getPdfFirstPageDataUrl } from '@/lib/pdfThumb';

// Helper to extract first image URL from row data
export function getFirstImageUrl(row: Record<string, any>): string | null {
  const imageKeys = [
    "image", "image url", "image_url", "img", "thumbnail", "thumb",
    "preview", "image1", "image_1", "first image", "images"
  ];

  // Find first matching key (case-insensitive)
  for (const key of imageKeys) {
    const rowKey = Object.keys(row).find(k => 
      k.toLowerCase() === key.toLowerCase()
    );
    
    if (rowKey && row[rowKey]) {
      let value = String(row[rowKey]).trim();
      
      // Handle multiple URLs (comma/pipe/space separated)
      const urls = value.split(/[,| ]+/).map(url => url.trim()).filter(Boolean);
      
      for (const url of urls) {
        // Check if it's a valid HTTP(S) URL with image extension
        if (/^https?:\/\/.+/i.test(url) && 
            /\.(jpg|jpeg|png|webp|gif)$/i.test(url)) {
          return url;
        }
      }
    }
  }
  
  return null;
}

// Helper to extract PDF URL from row data
export function getPdfUrl(row: Record<string, any>): string | null {
  const pdfKeys = [
    "catalouge links", "catalogue links", "catalog links", "pdf", "pdf url", "pdf_url", "catalog url", "catalogue link", 
    "drive link", "file", "document", "catalog", "catalogue"
  ];

  for (const key of pdfKeys) {
    const rowKey = Object.keys(row).find(k => 
      k.toLowerCase() === key.toLowerCase()
    );
    
    if (rowKey && row[rowKey]) {
      const value = String(row[rowKey]).trim();
      if (/^https?:\/\/.+/.test(value)) {
        return value;
      }
    }
  }
  
  return null;
}

// Helper to extract primary link from row data
export function getPrimaryLink(row: Record<string, any>): string | null {
  const linkKeys = [
    "pdf", "pdf url", "catalog url", "url", "link", "catalogue link"
  ];

  for (const key of linkKeys) {
    const rowKey = Object.keys(row).find(k => 
      k.toLowerCase() === key.toLowerCase()
    );
    
    if (rowKey && row[rowKey]) {
      const value = String(row[rowKey]).trim();
      if (/^https?:\/\/.+/.test(value)) {
        return value;
      }
    }
  }
  
  return null;
}

// Helper to extract title from row data
export function getTitle(row: Record<string, any>): string {
  const titleKeys = [
    "catalogues name", "catalogue name", "catalog name", "name", "title", "catalog", "catalogue", "file name", "filename", "design", "code"
  ];

  for (const key of titleKeys) {
    const rowKey = Object.keys(row).find(k => 
      k.toLowerCase() === key.toLowerCase()
    );
    
    if (rowKey && row[rowKey]) {
      const value = String(row[rowKey]).trim();
      if (value) return value;
    }
  }
  
  return "Untitled";
}

// Helper to extract subtitle from row data
export function getSubtitle(row: Record<string, any>): string | null {
  const subtitleKeys = ["brand", "category"];

  for (const key of subtitleKeys) {
    const rowKey = Object.keys(row).find(k => 
      k.toLowerCase() === key.toLowerCase()
    );
    
    if (rowKey && row[rowKey]) {
      const value = String(row[rowKey]).trim();
      if (value) return value;
    }
  }
  
  return null;
}

interface CatalogCardProps {
  item: Record<string, any>;
  onClick?: (item: Record<string, any>) => void;
}

export default function CatalogCard({ item, onClick }: CatalogCardProps) {
  const staticImageUrl = getFirstImageUrl(item);
  const pdfUrl = getPdfUrl(item);
  const primaryLink = getPrimaryLink(item);
  const title = getTitle(item);
  const subtitle = getSubtitle(item);

  // State for PDF thumbnail
  const [pdfThumbnail, setPdfThumbnail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load PDF thumbnail if no static image is available
  useEffect(() => {
    if (!staticImageUrl && pdfUrl) {
      setLoading(true);
      getPdfFirstPageDataUrl(pdfUrl)
        .then((dataUrl) => {
          if (dataUrl) {
            setPdfThumbnail(dataUrl);
          }
        })
        .catch((error) => {
          console.error('Failed to load PDF thumbnail:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [staticImageUrl, pdfUrl]);

  // Determine which image to show (priority: static image > PDF thumbnail > gradient)
  const displayImage = staticImageUrl || pdfThumbnail;

  const handleClick = () => {
    if (onClick) {
      onClick(item);
    } else if (primaryLink) {
      window.open(primaryLink, '_blank');
    } else if (staticImageUrl) {
      window.open(staticImageUrl, '_blank');
    }
  };

  return (
    <div 
      className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden w-full"
    >
      {/* Thumbnail area with 3:4 aspect ratio */}
      <div className="relative w-full pt-[133%] bg-gradient-to-b from-orange-200 to-orange-100">
        {displayImage ? (
          <img 
            src={displayImage}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              // Hide image on error, show gradient fallback
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-orange-600 text-sm">Loading preview...</div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-center p-4">
            <div className="bg-gradient-to-b from-orange-300 to-orange-700 absolute inset-0 opacity-95" />
            <div className="relative text-white font-semibold leading-snug text-sm line-clamp-3">
              {title}
            </div>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1 line-clamp-2">
          {title}
        </h3>
        
        {/* Subtitle */}
        {subtitle && (
          <p className="text-xs text-gray-500 mb-3 line-clamp-1">
            {subtitle}
          </p>
        )}
        
        {/* Action Buttons */}
        {primaryLink && (
          <div className="space-y-2">
            <a 
              href={primaryLink} 
              target="_blank" 
              rel="noreferrer"
              className="block w-full text-center px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-colors duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              Preview
            </a>
            <a 
              href={primaryLink} 
              target="_blank" 
              rel="noreferrer"
              download
              className="block w-full text-center px-3 py-2 text-xs font-medium text-white bg-[#F46300] rounded-lg hover:bg-[#CC380A] transition-colors duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              Download
            </a>
          </div>
        )}
      </div>
    </div>
  );
}