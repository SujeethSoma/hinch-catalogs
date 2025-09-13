import React from "react";
import CatalogCardPreview from "./CatalogCardPreview";

export default function CatalogPreviewGrid({ items }: { items: any[] }) {
  if (!items?.length) return <div className="text-sm text-neutral-500">No catalogs found.</div>;
  // Auto-fit grid: min 220px, grows up to 1fr → avoids huge or tiny cards
  return (
    <div className="grid [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))] gap-6">
      {items.map((it, i) => (
        <CatalogCardPreview key={it.id ?? it.code ?? it.name ?? i} item={it} />
      ))}
    </div>
  );
}
