"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import json from "@/data/catalogs.json";

export default function BrandsPage() {
  const [search, setSearch] = useState("");
  
  const items = json as any[];
  
  const brands = useMemo(() => {
    const brandCounts = new Map<string, number>();
    
    items.forEach(item => {
      if (item.brand) {
        const count = brandCounts.get(item.brand) || 0;
        brandCounts.set(item.brand, count + 1);
      }
    });
    
    return Array.from(brandCounts.entries())
      .map(([brand, count]) => ({ brand, count }))
      .sort((a, b) => b.count - a.count);
  }, [items]);
  
  const filteredBrands = useMemo(() => {
    if (!search.trim()) return brands;
    
    return brands.filter(b => 
      b.brand.toLowerCase().includes(search.toLowerCase())
    );
  }, [brands, search]);

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#414042] mb-4">Our Brands</h1>
          <p className="text-xl text-gray-600 mb-8">
            Discover products from our trusted brand partners
          </p>
          
          {/* Search */}
          <div className="max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search brands..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F46300] focus:border-transparent"
            />
          </div>
        </div>

        {/* Results count */}
        <div className="text-sm text-gray-600 mb-6">
          {filteredBrands.length} brand{filteredBrands.length !== 1 ? 's' : ''} found
        </div>

        {/* Brands Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filteredBrands.map(({ brand, count }) => (
            <Link
              key={brand}
              href={`/catalogs?brand=${encodeURIComponent(brand)}`}
              className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:border-[#F46300] hover:shadow-md transition-all duration-200 group"
            >
              <div className="text-lg font-semibold text-gray-900 group-hover:text-[#F46300] transition-colors duration-200 mb-2">
                {brand}
              </div>
              <div className="text-sm text-gray-500">
                {count} catalog{count !== 1 ? 's' : ''}
              </div>
            </Link>
          ))}
        </div>

        {filteredBrands.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            <p className="text-lg">No brands found matching your search.</p>
            <button
              onClick={() => setSearch("")}
              className="text-[#F46300] hover:text-[#CC380A] font-medium mt-2 transition-colors duration-200"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

