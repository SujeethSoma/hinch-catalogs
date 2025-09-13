import React from "react";

type Row = Record<string, any>;

const IMAGE_KEYS = [
  "image","image url","image_url","img","thumbnail","thumb","preview",
  "image1","image_1","first image","images","cover"
];
const LINK_KEYS = [
  "pdf","pdf url","catalog url","url","link","catalogue link"
];
const TITLE_KEYS = [
  "name","title","catalog","catalogue","file name","filename","design","code"
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

function getImage(row: Row): string | null {
  return getFirstByKeys(row, IMAGE_KEYS, true);
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
  const img = getImage(item);
  const href = getPrimaryLink(item);

  return (
    <div className="group rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow bg-white overflow-hidden">
      {/* Thumbnail: 3:4 box */}
      <div className="relative w-full pt-[133%] bg-gradient-to-b from-orange-200 to-orange-100">
        {img && (
          <img
            src={img}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
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