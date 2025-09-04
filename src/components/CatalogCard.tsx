import Image from "next/image";
import { previewUrl, downloadUrl, thumbUrl } from "@/lib/drive";

type Item = { name:string; drive_link:string; brand?:string; category?:string; cover_image?:string; tags?:string; };

export default function CatalogCard({ item }: { item: Item }) {
  const p = previewUrl(item.drive_link);
  const d = downloadUrl(item.drive_link);
  const t = item.cover_image || thumbUrl(item.drive_link);

  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden max-w-[200px] mx-auto hover:scale-105">
      {/* Thumbnail */}
      <div className="relative w-full h-[220px] overflow-hidden bg-gray-50 rounded-t-xl">
        {t ? (
          <Image 
            src={t} 
            alt={item.name} 
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => {}} 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-center p-4">
            <div className="brand-gradient absolute inset-0 opacity-95" />
            <div className="relative text-white font-semibold leading-snug text-sm line-clamp-3">
              {item.name}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
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
            href={p} 
            target="_blank" 
            rel="noreferrer"
            className="block w-full text-center px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-colors duration-200"
          >
            Preview
          </a>
          <a 
            href={d} 
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
