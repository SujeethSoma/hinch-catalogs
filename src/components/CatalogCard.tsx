import React from "react";

type Row = Record<string, any>;

const IMAGE_KEYS = [
  "image","image url","image_url","img","thumbnail","thumb","preview",
  "image1","image_1","first image","images","cover"
];
const LINK_KEYS = [
  "catalouge links", "catalogue links", "catalog links", "pdf","pdf url","catalog url","url","link","catalogue link"
];
const TITLE_KEYS = [
  "catalogues name", "catalogue name", "catalog name", "name","title","catalog","catalogue","file name","filename","design","code"
];
const SUB_KEYS = ["brand","category"];

function firstHttpUrl(val: any): string | null {
  if (!val) return null;
  let s = String(val).trim();
  // split common multi-value separators
  const parts = s.split(/[,|\s]\s*/).filter(Boolean);
  for (const p of parts) {
    const u = p.trim();
    if (/^https?:\/\//i.test(u) && /\.(png|jpe?g|webp|gif)(\?.*)?$/i.test(u)) return u;
    if (/^https?:\/\//i.test(u)) return u; // fallback even if no extension
  }
  return null;
}

function getFirstByKeys(row: Row, keys: string[], acceptImages = false): string | null {
  const lowers = Object.keys(row).reduce<Record<string,string>>((m,k)=>{m[k.toLowerCase()] = k; return m;}, {});
  for (const key of keys) {
    const real = lowers[key.toLowerCase()];
    if (real && String(row[real]).trim() !== "") {
      return acceptImages ? firstHttpUrl(row[real]) : String(row[real]).trim();
    }
  }
  return null;
}

function extractDriveFileId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname !== 'drive.google.com') return null;
    const m1 = u.pathname.match(/\/file\/d\/([^/]+)\//);
    if (m1?.[1]) return m1[1];
    const id = u.searchParams.get('id');
    if (id) return id;
    return null;
  } catch { return null; }
}

function getDriveThumbnail(driveUrl: string): string | null {
  const fileId = extractDriveFileId(driveUrl);
  if (!fileId) return null;
  return `https://lh3.googleusercontent.com/d/${fileId}=w400-h300`;
}

function getImage(row: Row): string | null {
  // First try to find static images
  const staticImage = getFirstByKeys(row, IMAGE_KEYS, true);
  if (staticImage) return staticImage;
  
  // Get the drive link
  const driveLink = getFirstByKeys(row, LINK_KEYS, false);
  if (!driveLink) return null;
  
  // Check if it's a Google Drive link - use PDF thumbnail API
  if (driveLink.includes('drive.google.com')) {
    return `/api/pdf-thumbnail?url=${encodeURIComponent(driveLink)}`;
  }
  
  // Fallback for testing - use a placeholder image
  return 'https://via.placeholder.com/400x300/FF6B35/FFFFFF?text=PDF+Thumbnail';
}

function getPrimaryLink(row: Row): string | null {
  const v = getFirstByKeys(row, LINK_KEYS, false);
  if (v && /^https?:\/\//i.test(v)) return v;
  // if link columns are empty, fall back to an image URL (so Preview still works)
  return getImage(row);
}

function getTitle(row: Row): string {
  const t = getFirstByKeys(row, TITLE_KEYS, false);
  return t || (row.category ? String(row.category) : "Untitled");
}

function getSubtitle(row: Row): string {
  const a = getFirstByKeys(row, SUB_KEYS, false);
  const b = getFirstByKeys(row, SUB_KEYS.filter(k => k !== a), false);
  return [a, b].filter(Boolean).slice(0, 1).join(" • ");
}

export function CatalogCard({ item }: { item: Row }) {
  const title = getTitle(item);
  const subtitle = getSubtitle(item);
  const displayImage = getImage(item);
  const href = getPrimaryLink(item);
  
  // Debug logging
  console.log('🔍 CatalogCard Debug:', {
    title,
    displayImage,
    href,
    hasImage: !!displayImage,
    driveLink: getFirstByKeys(item, LINK_KEYS, false)
  });

  return (
    <div className="group rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden">
      {/* Thumbnail: 3:4 box */}
      <div className="relative w-full pt-[133%] bg-gradient-to-b from-orange-200 to-orange-100">
        {displayImage ? (
          <img
            src={displayImage}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            onLoad={() => console.log('✅ Image loaded:', displayImage)}
            onError={(e) => {
              console.error('❌ Image failed to load:', displayImage);
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-center p-4">
            <div className="bg-gradient-to-b from-orange-300 to-orange-700 absolute inset-0 opacity-95" />
            <div className="relative text-white font-semibold leading-snug text-sm line-clamp-3">
              {title}
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-3">
        <div className="text-sm font-semibold text-neutral-900 line-clamp-1">{title}</div>
        {subtitle && (
          <div className="text-xs text-neutral-500 mt-0.5 line-clamp-1">{subtitle}</div>
        )}

        {/* Actions */}
        {href && (
          <div className="mt-3 flex items-center gap-2">
            <a
              className="inline-flex items-center justify-center px-3 py-1.5 text-sm rounded-full bg-[#F46300] text-white hover:opacity-90 transition"
              href={href}
              target="_blank"
              rel="noopener noreferrer"
            >
              Preview
            </a>
            <a
              className="inline-flex items-center justify-center px-3 py-1.5 text-sm rounded-full border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition"
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              download
            >
              Download
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default CatalogCard;