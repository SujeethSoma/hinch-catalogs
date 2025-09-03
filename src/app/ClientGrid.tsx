"use client";

import { useMemo, useState } from "react";
import CategoryTabs from "@/components/CategoryTabs";
import CatalogCard from "@/components/CatalogCard";
import json from "@/data/catalogs.json";

type Item = { name:string; drive_link:string; brand?:string; category?:string; cover_image?:string; tags?:string; };

const DISPLAY_CATEGORIES = ["Laminates","Hardware","Louvers","Wall Panels","Veneers","Profiles","OSG Board","Flooring","Electrical"];

export default function ClientGrid() {
  const items = (json as any).data as Item[];

  const [activeCat, setActiveCat] = useState<string>("All");
  const [q, setQ] = useState(""); const [brand, setBrand] = useState(""); const [category, setCategory] = useState("");

  const brands = useMemo(()=> Array.from(new Set(items.map(i=>i.brand).filter(Boolean))).sort() as string[], [items]);
  const categoriesInData = useMemo(()=> Array.from(new Set(items.map(i=>i.category).filter(Boolean))).sort() as string[], [items]);

  const counts = useMemo(()=>{
    const m:Record<string,number> = {};
    for (const i of items) m[i.category || ""] = (m[i.category || ""] || 0) + 1;
    m["__all"] = items.length;
    return m;
  }, [items]);

  const filtered = useMemo(()=>{
    const k = q.toLowerCase();
    return items.filter(i=>{
      const matchTab = activeCat === "All" || (i.category || "") === activeCat;
      const matchQ = !k || i.name.toLowerCase().includes(k) || (i.brand||"").toLowerCase().includes(k) || (i.category||"").toLowerCase().includes(k);
      const matchBrand = !brand || i.brand === brand;
      const matchCat = !category || i.category === category;
      return matchTab && matchQ && matchBrand && matchCat;
    });
  }, [items, activeCat, q, brand, category]);

  return (
    <div className="container section space-y-6">
      <CategoryTabs categories={DISPLAY_CATEGORIES} active={activeCat} onChange={setActiveCat} counts={counts} />

      <div className="flex flex-col md:flex-row gap-3 md:items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Search</label>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search catalogs..."
                 className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-hinch.secondary" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Brand</label>
          <select value={brand} onChange={e=>setBrand(e.target.value)} className="border rounded-xl px-3 py-2">
            <option value="">All</option>
            {brands.map(b=><option key={b} value={b!}>{b}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select value={category} onChange={e=>setCategory(e.target.value)} className="border rounded-xl px-3 py-2">
            <option value="">All</option>
            {categoriesInData.map(c=><option key={c} value={c!}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="subtle">{filtered.length} result(s)</div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((item, idx)=> <CatalogCard key={idx + item.name} item={item} />)}
      </div>

      {filtered.length === 0 && <div className="text-center text-gray-500 py-10">No catalogs found</div>}
    </div>
  );
}

