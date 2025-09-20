"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import CategoryTabs from "@/components/CategoryTabs";
import CatalogCard from "@/components/CatalogCard";
import CatalogPreviewGrid from "@/components/CatalogPreviewGrid";
import { CatalogItem, CATEGORY_ORDER, HIDDEN_TOP_CATEGORIES, DEFAULT_CATEGORIES, safeCompare, ensureKnownCategory } from "@/lib/categories";
import { getAllCatalogs, getUniqueBrands } from "@/lib/catalogData";

function ClientGridContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Load data
  const items: CatalogItem[] = getAllCatalogs();

  // State management with URL sync
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [brand, setBrand] = useState<string>("All");
  const [search, setSearch] = useState<string>("");
  const [view, setView] = useState<string>("preview");

  // Initialize from URL params
  useEffect(() => {
    const categoryParam = searchParams?.get('category');
    const viewParam = searchParams?.get('view');
    
    if (categoryParam) {
      const category = decodeURIComponent(categoryParam);
      setActiveCategory(ensureKnownCategory(category));
    } else {
      // Default to "All" category
      setActiveCategory("All");
    }
    
    if (viewParam) {
      setView(viewParam);
    } else {
      // Default to preview view and update URL
      setView("preview");
      const params = new URLSearchParams(searchParams || '');
      params.set('view', 'preview');
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, [searchParams, router]);

  // Update URL when category changes
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    const params = new URLSearchParams(searchParams || '');
    if (category === "All") {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    // Preserve view parameter
    if (view) {
      params.set('view', view);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Handle dropdown category change
  const handleDropdownCategoryChange = (category: string) => {
    setActiveCategory(category);
    const params = new URLSearchParams(searchParams || '');
    if (category === "All") {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    // Preserve view parameter
    if (view) {
      params.set('view', view);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Handle view change
  const handleViewChange = (newView: string) => {
    setView(newView);
    const params = new URLSearchParams(searchParams || '');
    if (newView === "preview") {
      params.delete('view');
    } else {
      params.set('view', newView);
    }
    // Preserve category parameter
    if (activeCategory && activeCategory !== "All") {
      params.set('category', activeCategory);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const brands = useMemo(() => getUniqueBrands(), []);

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
            {CATEGORY_ORDER.filter(c => !HIDDEN_TOP_CATEGORIES.has(c)).map(c => 
              <option key={c} value={c}>{c}</option>
            )}
            <option value="All">All</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">View</label>
          <select 
            value={view} 
            onChange={e => handleViewChange(e.target.value)} 
            className="border rounded-xl px-3 py-2"
          >
            <option value="preview">Preview</option>
            <option value="list">List</option>
          </select>
        </div>
      </div>

      <div className="text-sm text-gray-600">{filtered.length} result(s)</div>

      {view === "preview" ? (
        <CatalogPreviewGrid items={filtered} showActions={view?.toLowerCase() === "preview"} />
      ) : (
        <div className="space-y-3">
          {filtered.map((item, idx) => (
            <div key={`${item.name || 'item'}-${item.category || 'unknown'}-${idx}`} className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-600">{item.category}</p>
                  {item.brand && <p className="text-sm text-gray-500">Brand: {item.brand}</p>}
                </div>
                <a 
                  href={item.driveLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-[#F46300] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#CC380A] transition-colors duration-200"
                >
                  View Catalog
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

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

