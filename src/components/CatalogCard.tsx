import React, { useEffect, useState } from 'react';
import { getPdfFirstPageDataUrl } from '@/lib/pdfThumb';
import { CatalogItem } from '@/lib/categories';

type Props = {
  item: CatalogItem;
  // ...other props
};

export default function CatalogCard({ item, ...rest }: Props) {
  const initial = item.previewImage || item.thumbnail || null;
  const [thumb, setThumb] = useState<string | null>(initial);
  const [loading, setLoading] = useState<boolean>(!initial && !!item.pdfUrl);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!thumb && item.pdfUrl) {
        const dataUrl = await getPdfFirstPageDataUrl(item.pdfUrl);
        if (mounted) {
          if (dataUrl) setThumb(dataUrl);
          setLoading(false);
        }
      }
    }
    load();
    return () => { mounted = false; };
  }, [item.pdfUrl, thumb]);

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm border border-neutral-200 bg-white">
      <div className="h-[220px] w-full">
        {thumb ? (
          <img
            src={thumb}
            alt={item.name}
            className="h-[220px] w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="h-[220px] w-full bg-gradient-to-b from-orange-300 to-orange-700 animate-pulse" />
        )}
      </div>

      {/* keep your existing title/meta/actions below */}
      <div className="p-3">
        {/* Title */}
        <h3 className="text-sm font-medium text-gray-900 leading-tight truncate mb-1">
          {item.name}
        </h3>
        
        {/* Category + Brand */}
        <div className="text-xs text-gray-500 mb-3">
          {item.category && item.brand ? `${item.category} • ${item.brand}` : item.category || item.brand || ''}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <a 
            href={item.previewUrl} 
            target="_blank" 
            rel="noreferrer"
            className="block w-full text-center px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-colors duration-200"
          >
            Preview
          </a>
          <a 
            href={item.downloadUrl} 
            target="_blank" 
            rel="noreferrer"
            className="block w-full text-center px-3 py-2 text-xs font-medium text-white bg-[#F46300] rounded-lg hover:bg-[#CC380A] transition-colors duration-200"
          >
            Download
          </a>
        </div>
      </div>
    </div>
  );
}
