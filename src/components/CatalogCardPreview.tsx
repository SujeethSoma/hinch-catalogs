import React, { useState, useEffect } from "react";
import { toDriveDirectPdf } from "@/lib/drive";
import { getPdfFirstPageDataUrl } from "@/lib/pdfThumb";

type Row = Record<string, any>;

const IMG_KEYS = ["image","image url","image_url","img","thumbnail","thumb","preview","image1","image_1","first image","images","cover","thumbnailUrl","previewImage"];
const LINK_KEYS = ["pdf","pdf url","catalog url","url","link","catalogue link","driveLink","previewUrl","downloadUrl","pdfUrl"];
const TITLE_KEYS = ["name","title","catalog","catalogue","file name","filename","design","code","Catalogues Name"];
const SUB_KEYS   = ["brand","category","Brand","Brands","Category"];

function lowerKeyMap(row: Row) {
  return Object.keys(row).reduce<Record<string,string>>((m,k)=>{m[k.toLowerCase()] = k; return m;}, {});
}

function firstHttpFromValue(v: any, allowImages=false): string | null {
  if (v == null) return null;
  const raw = String(v).trim();
  const parts = raw.split(/[,|]\s*|\s{2,}/g).filter(Boolean); // comma, pipe, or multi-space
  for (const p of (parts.length ? parts : [raw])) {
    const s = p.trim();
    if (!/^https?:\/\//i.test(s)) continue;
    if (!allowImages) return s;
    if (/\.(png|jpe?g|webp|gif)(\?|#|$)/i.test(s)) return s;
    // as a fallback, still return the http(s) even if no image extension
    return s;
  }
  return null;
}

function pick(row: Row, keys: string[], opts?: {asUrl?: boolean, images?: boolean}) {
  const map = lowerKeyMap(row);
  for (const k of keys) {
    const real = map[k.toLowerCase()];
    if (!real) continue;
    const val = row[real];
    if (val == null || String(val).trim() === "") continue;
    if (opts?.asUrl) return firstHttpFromValue(val, !!opts.images);
    return String(val).trim();
  }
  return null;
}

function getImage(row: Row)   { return pick(row, IMG_KEYS,   { asUrl:true, images:true }); }
function getLink(row: Row)    { return pick(row, LINK_KEYS,  { asUrl:true }); }
function getTitle(row: Row)   { return pick(row, TITLE_KEYS) || (row.category ?? "Untitled"); }
function getSubtitle(row: Row){
  const map = lowerKeyMap(row);
  const brandKey = map["brand"] || map["brands"]; 
  const categoryKey = map["category"];
  const brand = brandKey ? String(row[brandKey]).trim() : "";
  const cat   = categoryKey ? String(row[categoryKey]).trim() : "";
  return brand || cat ? (brand || cat) : "";
}

export default function CatalogCardPreview({ item }: { item: Row }) {
  const title = getTitle(item);
  const subtitle = getSubtitle(item);
  const img = getImage(item);
  const href = getLink(item) || img || null;
  const hasLink = !!href;
  const downloadUrl = href ? toDriveDirectPdf(href) : null;
  
  // PDF thumbnail state
  const [pdfThumbnail, setPdfThumbnail] = useState<string | null>(null);
  const [isLoadingThumbnail, setIsLoadingThumbnail] = useState(false);

  // Generate PDF thumbnail if no image is available and we have a PDF link
  useEffect(() => {
    if (!img && href && href.includes('drive.google.com')) {
      setIsLoadingThumbnail(true);
      getPdfFirstPageDataUrl(href, 300)
        .then(thumbnail => {
          setPdfThumbnail(thumbnail);
        })
        .catch(error => {
          console.warn('Failed to generate PDF thumbnail for:', title, error);
        })
        .finally(() => {
          setIsLoadingThumbnail(false);
        });
    }
  }, [img, href, title]);

  // Use PDF thumbnail if no regular image is available
  const displayImage = img || pdfThumbnail;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm hover:shadow-md transition overflow-hidden">
      {/* media 3:4 */}
      <div className="relative w-full pt-[133%] bg-gradient-to-b from-orange-200 to-orange-100">
        {displayImage && (
          <img
            src={displayImage}
            alt={title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        {isLoadingThumbnail && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F46300]"></div>
          </div>
        )}
      </div>

      <div className="p-3">
        <div className="text-sm font-semibold text-neutral-900 line-clamp-1">{title}</div>
        {subtitle && <div className="text-xs text-neutral-500 mt-0.5 line-clamp-1">{subtitle}</div>}

        <div className="mt-3 flex gap-2">
          {hasLink ? (
            <>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-3 py-1.5 text-sm rounded-full bg-[#F46300] text-white hover:opacity-90"
              >
                Preview
              </a>
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="inline-flex items-center justify-center px-3 py-1.5 text-sm rounded-full border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
              >
                Download
              </a>
            </>
          ) : (
            <>
              <button
                onClick={() => window.open('/contact', '_blank')}
                className="inline-flex items-center justify-center px-3 py-1.5 text-sm rounded-full bg-[#F46300] text-white hover:opacity-90"
              >
                Request Info
              </button>
              <button
                onClick={() => window.open('/contact', '_blank')}
                className="inline-flex items-center justify-center px-3 py-1.5 text-sm rounded-full border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
              >
                Contact
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
