import { previewUrl, downloadUrl, thumbUrl } from "@/lib/drive";

type Item = { name:string; drive_link:string; brand?:string; category?:string; cover_image?:string; tags?:string; };

export default function CatalogCard({ item }: { item: Item }) {
  const p = previewUrl(item.drive_link);
  const d = downloadUrl(item.drive_link);
  const t = item.cover_image || thumbUrl(item.drive_link);

  return (
    <div className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Thumbnail */}
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-gray-50">
        {t ? (
          <img 
            src={t} 
            alt={item.name} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-center p-6">
            <div className="brand-gradient absolute inset-0 opacity-95" />
            <div className="relative text-white font-semibold leading-snug text-lg line-clamp-3">
              {item.name}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 leading-tight line-clamp-2 min-h-[3.25rem] mb-3">
          {item.name}
        </h3>
        
        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4 min-h-[1.75rem]">
          {item.brand && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 uppercase tracking-wide">
              {item.brand}
            </span>
          )}
          {item.category && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 uppercase tracking-wide">
              {item.category}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <a 
            href={p} 
            target="_blank" 
            rel="noreferrer"
            className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:border-hinch-primary hover:text-hinch-primary transition-colors duration-200"
          >
            Preview
          </a>
          <a 
            href={d} 
            target="_blank" 
            rel="noreferrer"
            className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-hinch-primary rounded-xl hover:bg-hinch-accent transition-colors duration-200"
          >
            Download
          </a>
        </div>
      </div>
    </div>
  );
}
