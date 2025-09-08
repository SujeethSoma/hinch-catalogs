import Link from "next/link";
import { CATEGORY_ORDER } from "@/lib/categories";
import json from "@/data/catalogs.json";

export const metadata = {
  title: "HINCH Catalogues - Your Trusted Partner for Quality Materials",
  description: "Explore, preview, and download product catalogs from HINCH. Your trusted partner for quality materials and solutions.",
};

export default function HomePage() {
  const items = json as any[];
  
  // Get top brands by count
  const brandCounts = new Map<string, number>();
  items.forEach(item => {
    if (item.brand) {
      const count = brandCounts.get(item.brand) || 0;
      brandCounts.set(item.brand, count + 1);
    }
  });
  
  const topBrands = Array.from(brandCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([brand]) => brand);

  // Get featured categories (excluding "All")
  const featuredCategories = CATEGORY_ORDER.filter(cat => cat !== "All").slice(0, 6);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 to-white py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-[#414042] mb-6">
              HINCH Catalogues
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Your trusted partner for quality materials and solutions. Explore our comprehensive collection of product catalogs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/catalogs"
                className="bg-[#F46300] text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-[#CC380A] transition-colors duration-200"
              >
                Browse Catalogs
              </Link>
              <Link
                href="/contact"
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg text-lg font-medium hover:border-[#F46300] hover:text-[#F46300] transition-colors duration-200"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#414042] mb-4">Featured Categories</h2>
            <p className="text-gray-600">Explore our most popular product categories</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {featuredCategories.map((category) => (
              <Link
                key={category}
                href={`/catalogs?category=${encodeURIComponent(category)}`}
                className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-[#F46300] hover:shadow-md transition-all duration-200 group"
              >
                <div className="text-sm font-medium text-gray-900 group-hover:text-[#F46300] transition-colors duration-200">
                  {category}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Brands */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#414042] mb-4">Featured Brands</h2>
            <p className="text-gray-600">Discover products from our trusted brand partners</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {topBrands.map((brand) => (
              <Link
                key={brand}
                href={`/catalogs?brand=${encodeURIComponent(brand)}`}
                className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-[#F46300] hover:shadow-md transition-all duration-200 group"
              >
                <div className="text-sm font-medium text-gray-900 group-hover:text-[#F46300] transition-colors duration-200">
                  {brand}
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/brands"
              className="text-[#F46300] hover:text-[#CC380A] font-medium transition-colors duration-200"
            >
              View All Brands →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#F46300] rounded-2xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl mb-8 opacity-90">
              Contact us today for personalized recommendations and quotes
            </p>
            <Link
              href="/contact"
              className="bg-white text-[#F46300] px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-100 transition-colors duration-200"
            >
              Get a Quote
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}