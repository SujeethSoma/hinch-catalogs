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

type CatalogCardProps = {
  title: string;
  brand: string;
  cover?: string;
  previewUrl?: string;
  downloadUrl?: string;
  showActions?: boolean;
};

export default function CatalogCardPreview({ 
  item, 
  showActions = false 
}: { 
  item: Row;
  showActions?: boolean;
}) {
  console.log('🚀 CatalogCardPreview called with item:', item);
  
  const title = getTitle(item);
  const brand = getSubtitle(item);

  const rawLink = getPrimaryLink(item);
  const { isDrive, fileId, urls } = processDriveLink(rawLink || '');

  let cover: string | null = null;
  let previewUrl: string | null = null;
  let downloadUrl: string | null = null;

  if (isDrive && urls) {
    // Google Drive file
    cover = urls.thumb;
    previewUrl = urls.preview;
    downloadUrl = urls.download;
  } else {
    // Non-Drive: try image fields for thumbnail, and use rawLink for preview/download
    cover = pick(item, IMG_KEYS, true);
    previewUrl = rawLink || cover;
    downloadUrl = rawLink || cover || null;
  }

  const canPreview = Boolean(previewUrl);
  const canDownload = Boolean(downloadUrl);

  // Debug logging
  console.log('🔍 CatalogCardPreview Debug:', {
    title,
    brand,
    rawLink,
    isDrive,
    fileId,
    cover,
    previewUrl,
    downloadUrl,
    showActions,
    canPreview,
    canDownload,
    itemKeys: Object.keys(item),
    itemData: item
  });

  // Additional debug for button visibility
  console.log('🔘 Button Debug:', {
    showActions,
    canPreview,
    canDownload,
    shouldShowButtons: showActions && (canPreview || canDownload),
    previewUrl,
    downloadUrl
  });

  return (
    <div className="relative min-h-[360px] pb-16 overflow-visible rounded-2xl border border-neutral-200 bg-white shadow-sm hover:shadow-md transition">
      {/* Cover area - 12rem height */}
      <div className="h-48 w-full rounded-t-2xl bg-gradient-to-b from-orange-200 to-amber-100">
        {cover && (
          <img
            src={cover}
            alt={title}
            className="h-48 w-full rounded-t-2xl object-cover"
            loading="lazy"
            referrerPolicy="no-referrer"
            onLoad={() => console.log('✅ Thumbnail loaded:', cover)}
            onError={(e) => {
              console.error('❌ Thumb failed:', cover);
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        )}
      </div>

      {/* Meta (title/brand) */}
      <div className="p-3">
        <h3 className="line-clamp-1 text-sm font-semibold text-neutral-900">{title}</h3>
        <p className="mt-1 text-xs text-neutral-500">{brand}</p>
      </div>

      {/* Action bar - absolutely positioned at bottom */}
      {showActions && (
        <div className="absolute inset-x-3 bottom-3 z-10 flex gap-2">
          <button
            className="flex-1 inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-lg bg-[#F46300] text-white hover:opacity-90 transition shadow-sm"
            onClick={() => window.open(previewUrl || "#", "_blank")}
          >
            Preview
          </button>
          <button
            className="flex-1 inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition shadow-sm"
            onClick={() => window.open(downloadUrl || "#", "_blank")}
          >
            Download
          </button>
        </div>
      )}
    </div>
  );
}