"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import CategoryTabs from "@/components/CategoryTabs";
import CatalogCard from "@/components/CatalogCard";
import { CatalogItem, CATEGORY_ORDER, safeCompare, ensureKnownCategory } from "@/lib/categories";
import json from "@/data/catalogs.json";

function ClientGridContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Load data
  const rawItems = json as any[];
  const items: CatalogItem[] = rawItems;

  // State management with URL sync
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [brand, setBrand] = useState<string>("All");
  const [search, setSearch] = useState<string>("");

  // Initialize from URL params
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      const category = decodeURIComponent(categoryParam);
      setActiveCategory(ensureKnownCategory(category));
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

  // Handle dropdown category change
  const handleDropdownCategoryChange = (category: string) => {
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
    // Filter by category first
    const byCategory = activeCategory === "All"
      ? items
      : items.filter(i => safeCompare(i.category, activeCategory));

    // Filter by brand
    const byBrand = brand === "All"
      ? byCategory
      : byCategory.filter(i => i.brand && safeCompare(i.brand, brand));

    // Filter by search
    const visible = search.trim()
      ? byBrand.filter(i =>
          (i.name && i.name.toLowerCase().includes(search.toLowerCase())) ||
          (i.brand && i.brand.toLowerCase().includes(search.toLowerCase())) ||
          (i.category && i.category.toLowerCase().includes(search.toLowerCase()))
        )
      : byBrand;

    return visible;
  }, [items, activeCategory, brand, search]);

  return (
    <div className="px-2 sm:px-4 md:px-6 py-6 space-y-6">
      <CategoryTabs 
        activeCategory={activeCategory} 
        setActiveCategory={handleCategoryChange} 
        items={items} 
      />

      <div className="flex flex-col sm:flex-row gap-3 sm:items-end border-b border-gray-200 pb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1 text-gray-700">Search</label>
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search catalogs..."
            className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#F46300]" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Brand</label>
          <select 
            value={brand} 
            onChange={e => setBrand(e.target.value)} 
            className="border rounded-xl px-3 py-2"
          >
            <option value="All">All</option>
            {brands.map(b => <option key={b} value={b!}>{b}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Category</label>
          <select 
            value={activeCategory} 
            onChange={e => handleDropdownCategoryChange(e.target.value)} 
            className="border rounded-xl px-3 py-2"
          >
            {CATEGORY_ORDER.filter(c => c !== "All").map(c => 
              <option key={c} value={c}>{c}</option>
            )}
            <option value="All">All</option>
          </select>
        </div>
      </div>

      <div className="text-sm text-gray-600">{filtered.length} result(s)</div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((item, idx) => <CatalogCard key={idx + item.name} item={item} />)}
      </div>

      {filtered.length === 0 && <div className="text-center text-gray-500 py-10">No catalogs found</div>}
    </div>
  );
}

export default function ClientGrid() {
  return (
    <Suspense fallback={<div className="container section py-10 text-center">Loading...</div>}>
      <ClientGridContent />
    </Suspense>
  );
}

