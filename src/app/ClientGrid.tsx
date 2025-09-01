"use client";
import { useMemo, useState } from "react";
import CatalogCard from "@/components/CatalogCard";
import CategoryTabs from "@/components/CategoryTabs";
import json from "@/data/catalogs.json";

type Item = { name:string; drive_link:string; brand?:string; category?:string; cover_image?:string; tags?:string; };

// Define fixed display order
const DISPLAY_CATEGORIES = ["Laminates","Hardware","Louvers","Wall Panels","Veneers","Profiles","OSG Board","Flooring","Electrical"];

export default function ClientGrid() {
  const items = (json as any).data as Item[];

  const [activeCat, setActiveCat] = useState<string>("All");
  const [q, setQ] = useState(""); const [brand, setBrand] = useState(""); const [category, setCategory] = useState("");

  // categories present in data (for dropdown options if you keep them)
  const categoriesInData = useMemo(() =>
    Array.from(new Set(items.map(i => i.category).filter(Boolean))).sort() as string[], [items]);

  // counts for tabs
  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const i of items) m[i.category || ""] = (m[i.category || ""] || 0) + 1;
    m["__all"] = items.length;
    return m;
  }, [items]);

  const brands = useMemo(() => Array.from(new Set(items.map(i => i.brand).filter(Boolean))).sort() as string[], [items]);

  // filtering (add tab match)
  const filtered = useMemo(() => {
    const k = q.toLowerCase();
    return items.filter(i => {
      const matchTab = activeCat === "All" || (i.category || "") === activeCat;
      const matchQ = !k || i.name.toLowerCase().includes(k) || (i.brand||"").toLowerCase().includes(k) || (i.category||"").toLowerCase().includes(k);
      const matchBrand = !brand || i.brand === brand;
      const matchCat = !category || i.category === category;
      return matchTab && matchQ && matchBrand && matchCat;
    });
  }, [items, activeCat, q, brand, category]);

  return (
    <div className="container section space-y-8">
      {/* Category Tabs */}
      <CategoryTabs categories={DISPLAY_CATEGORIES} active={activeCat} onChange={setActiveCat} counts={counts} />

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Search */}
          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Search Catalogs</label>
            <input 
              value={q} 
              onChange={e => setQ(e.target.value)} 
              placeholder="Search by name, brand, or category..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-hinch-secondary focus:border-hinch-secondary transition-colors"
            />
          </div>
          
          {/* Brand Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Brand</label>
            <select 
              value={brand} 
              onChange={e => setBrand(e.target.value)} 
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-hinch-secondary focus:border-hinch-secondary transition-colors"
            >
              <option value="">All Brands</option>
              {brands.map(b => <option key={b} value={b!}>{b}</option>)}
            </select>
          </div>
          
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
            <select 
              value={category} 
              onChange={e => setCategory(e.target.value)} 
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-hinch-secondary focus:border-hinch-secondary transition-colors"
            >
              <option value="">All Categories</option>
              {categoriesInData.map(c => <option key={c} value={c!}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-center">
        <p className="text-gray-600 font-medium">
          {filtered.length} catalog{filtered.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((item, idx) => (
          <CatalogCard key={idx + item.name} item={item} />
        ))}
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="text-gray-400 text-6xl mb-4">📚</div>
          <h3 className="text-xl font-medium text-gray-600 mb-2">No catalogs found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}

