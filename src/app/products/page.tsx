"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  getProducts, 
  PRODUCT_CATEGORIES, 
  filterProductsByCategory, 
  searchProducts, 
  filterProductsByActiveFilter,
  Product 
} from "@/lib/products";
import HeaderHero from "@/components/products/HeaderHero";
import FiltersBar from "@/components/products/FiltersBar";
import ProductsGrid from "@/components/products/ProductsGrid";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Products");
  const [activeFilter, setActiveFilter] = useState<"all" | "new" | "best">("all");

  // Load products on component mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Filter products based on current filters
  const filteredProducts = useMemo(() => {
    let result = products;

    // Filter by category
    result = filterProductsByCategory(result, selectedCategory);

    // Filter by search query
    result = searchProducts(result, query);

    // Filter by active filter (new, best, all)
    result = filterProductsByActiveFilter(result, activeFilter);

    return result;
  }, [products, selectedCategory, query, activeFilter]);

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="w-8 h-8 border-4 border-[#F46300] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Hero */}
        <HeaderHero 
          activeFilter={activeFilter} 
          onFilterChange={setActiveFilter} 
        />

        {/* Filters Bar */}
        <FiltersBar
          categories={PRODUCT_CATEGORIES}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          query={query}
          onQueryChange={setQuery}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        {/* Results Count */}
        <div className="text-sm text-gray-600">
          {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
        </div>

        {/* Products Grid */}
        <ProductsGrid products={filteredProducts} />
      </div>
    </div>
  );
}

