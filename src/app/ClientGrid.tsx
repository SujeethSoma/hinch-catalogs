"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import CategoryTabs from "@/components/CategoryTabs";
import CatalogCard from "@/components/CatalogCard";
import { CatalogItem, normalizeCategory } from "@/lib/categories";
import json from "@/data/catalogs.json";

export default function ClientGrid() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Load and normalize data
  const rawItems = (json as any).data as any[];
  const items: CatalogItem[] = rawItems.map(item => ({
    ...item,
    normalizedCategory: normalizeCategory(item.category)
  }));

  // State management with URL sync
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [q, setQ] = useState("");
  const [brand, setBrand] = useState("");

  // Initialize from URL params
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setActiveCategory(decodeURIComponent(categoryParam));
    }
  }, [searchParams]);

  // Update URL when category changes
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    const params = new URLSearchParams(searchParams);
    if (category === "All") {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const brands = useMemo(() => 
    Array.from(new Set(items.map(i => i.brand).filter(Boolean))).sort() as string[], 
    [items]
  );

  const filtered = useMemo(() => {
    const k = q.toLowerCase();
    
    // First filter by active category
    let categoryFiltered = activeCategory === "All" 
      ? items 
      : items.filter(i => normalizeCategory(i.category) === activeCategory);
    
    // Then apply search and brand filters
    return categoryFiltered.filter(i => {
      const matchQ = !k || 
        i.name.toLowerCase().includes(k) || 
        (i.brand || "").toLowerCase().includes(k) || 
        (i.category || "").toLowerCase().includes(k);
      const matchBrand = !brand || i.brand === brand;
      return matchQ && matchBrand;
    });
  }, [items, activeCategory, q, brand]);

  return (
    <div className="container section space-y-6">
      <CategoryTabs 
        activeCategory={activeCategory} 
        setActiveCategory={handleCategoryChange} 
        items={items} 
      />

      <div className="flex flex-col md:flex-row gap-3 md:items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Search</label>
          <input 
            value={q} 
            onChange={e => setQ(e.target.value)} 
            placeholder="Search catalogs..."
            className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-hinch.secondary" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Brand</label>
          <select 
            value={brand} 
            onChange={e => setBrand(e.target.value)} 
            className="border rounded-xl px-3 py-2"
          >
            <option value="">All</option>
            {brands.map(b => <option key={b} value={b!}>{b}</option>)}
          </select>
        </div>
      </div>

      <div className="subtle">{filtered.length} result(s)</div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((item, idx) => <CatalogCard key={idx + item.name} item={item} />)}
      </div>

      {filtered.length === 0 && <div className="text-center text-gray-500 py-10">No catalogs found</div>}
    </div>
  );
}

