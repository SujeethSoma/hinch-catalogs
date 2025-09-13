import React from "react";

type Row = Record<string, any>;

const IMG_KEYS = ["image","image url","image_url","img","thumbnail","thumb","preview","image1","image_1","first image","images","cover"];
const LINK_KEYS = ["pdf","pdf url","catalog url","url","link","catalogue link"];
const TITLE_KEYS = ["name","title","catalog","catalogue","file name","filename","design","code"];
const SUB_KEYS   = ["brand","category"];

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
  const brandKey = map["brand"]; const categoryKey = map["category"];
  const brand = brandKey ? String(row[brandKey]).trim() : "";
  const cat   = categoryKey ? String(row[categoryKey]).trim() : "";
  return brand || cat ? (brand || cat) : "";
}

export default function CatalogCardPreview({ item }: { item: Row }) {
  const title = getTitle(item);
  const subtitle = getSubtitle(item);
  const img = getImage(item);
  const href = getLink(item) || img || null;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm hover:shadow-md transition overflow-hidden">
      {/* media 3:4 */}
      <div className="relative w-full pt-[133%] bg-gradient-to-b from-orange-200 to-orange-100">
        {img && (
          <img
            src={img}
            alt={title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
      </div>

      <div className="p-3">
        <div className="text-sm font-semibold text-neutral-900 line-clamp-1">{title}</div>
        {subtitle && <div className="text-xs text-neutral-500 mt-0.5 line-clamp-1">{subtitle}</div>}

        {href && (
          <div className="mt-3 flex gap-2">
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-3 py-1.5 text-sm rounded-full bg-[#F46300] text-white hover:opacity-90"
            >
              Preview
            </a>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="inline-flex items-center justify-center px-3 py-1.5 text-sm rounded-full border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
            >
              Download
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
