import React from "react";
import { processDriveLink } from "@/utils/drivePreview";

type Row = Record<string, any>;

const IMG_KEYS  = ["image","image url","image_url","img","thumbnail","thumb","preview","image1","image_1","first image","images","cover"];
const LINK_KEYS = ["Catalouge links", "catalouge links", "catalogue links", "catalog links", "pdf","pdf url","catalog url","url","link","catalogue link"];
const TITLE_KEYS= ["Catalogues Name", "catalogues name", "catalogue name", "catalog name", "name","title","catalog","catalogue","file name","filename","design","code"];
const SUB_KEYS  = ["Brand", "brand", "Category", "category"];

function lowerKeyMap(row: Row){ return Object.keys(row).reduce<Record<string,string>>((m,k)=>{m[k.toLowerCase()]=k; return m;}, {}); }

function splitMulti(v: string){ return v.split(/[,|]\s*|\s{2,}/g).filter(Boolean); }

function isHttp(s: string){ return /^https?:\/\//i.test(s); }

function getFirstUrl(val: any){ if(!val) return null; const raw=String(val).trim(); const parts = splitMulti(raw); for(const p of (parts.length?parts:[raw])){ const s=p.trim(); if(isHttp(s)) return s; } return null; }

function pick(row: Row, keys: string[], asUrl=false){
  const m = lowerKeyMap(row);
  for(const k of keys){
    const real = m[k.toLowerCase()];
    if(!real) continue;
    const v = row[real];
    if(v==null || String(v).trim()==="") continue;
    return asUrl ? getFirstUrl(v) : String(v).trim();
  }
  return null;
}

// --- DATA EXTRACTORS ---
function getPrimaryLink(row: Row){
  return pick(row, LINK_KEYS, true) || pick(row, IMG_KEYS, true) || null;
}
function getTitle(row: Row){
  return pick(row, TITLE_KEYS) || (row.category ?? "Untitled");
}
function getSubtitle(row: Row){
  const m = lowerKeyMap(row);
  const brand = m["brand"] ? String(row[m["brand"]]).trim() : "";
  const cat   = m["category"] ? String(row[m["category"]]).trim() : "";
  return brand || cat ? (brand || cat) : "";
}

export default function CatalogCardPreview({ item }: { item: Row }) {
  console.log('🚀 CatalogCardPreview called with item:', item);
  
  const title = getTitle(item);
  const subtitle = getSubtitle(item);

  const rawLink = getPrimaryLink(item);
  const { isDrive, fileId, urls } = processDriveLink(rawLink || '');

  let imgSrc: string | null = null;
  let previewHref: string | null = null;
  let downloadHref: string | null = null;

  if (isDrive && urls) {
    // Google Drive file
    imgSrc = urls.thumb;
    previewHref = urls.preview;
    downloadHref = urls.download;
  } else {
    // Non-Drive: try image fields for thumbnail, and use rawLink for preview/download
    imgSrc = pick(item, IMG_KEYS, true);
    previewHref = rawLink || imgSrc;
    downloadHref = rawLink || imgSrc || null;
  }

  // Debug logging
  console.log('🔍 CatalogCardPreview Debug:', {
    title,
    rawLink,
    isDrive,
    fileId,
    imgSrc,
    previewHref,
    downloadHref,
    hasImage: !!imgSrc,
    itemKeys: Object.keys(item),
    itemData: item
  });

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm hover:shadow-md transition overflow-hidden">
      {/* media 3:4 */}
      <div className="relative w-full pt-[133%] bg-gradient-to-b from-orange-200 to-orange-100">
        {imgSrc && (
          <img
            src={imgSrc}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            referrerPolicy="no-referrer"
            onLoad={() => console.log('✅ Thumbnail loaded:', imgSrc)}
            onError={(e) => {
              console.error('❌ Thumb failed:', imgSrc);
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        )}
      </div>

      <div className="p-3">
        <div className="text-sm font-semibold text-neutral-900 line-clamp-1">{title}</div>
        {subtitle && <div className="text-xs text-neutral-500 mt-0.5 line-clamp-1">{subtitle}</div>}

        {(previewHref || downloadHref) && (
          <div className="mt-3 flex gap-2">
            {previewHref && (
              <a href={previewHref} target="_blank" rel="noopener noreferrer"
                 className="inline-flex items-center justify-center px-3 py-1.5 text-sm rounded-full bg-[#F46300] text-white hover:opacity-90">
                Preview
              </a>
            )}
            {downloadHref && (
              <a href={downloadHref} target="_blank" rel="noopener noreferrer" download
                 className="inline-flex items-center justify-center px-3 py-1.5 text-sm rounded-full border border-neutral-300 text-neutral-700 hover:bg-neutral-50">
                Download
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}