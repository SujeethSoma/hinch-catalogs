"use client";

interface FiltersBarProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  query: string;
  onQueryChange: (query: string) => void;
  activeFilter: "all" | "new" | "best";
  onFilterChange: (filter: "all" | "new" | "best") => void;
}

export default function FiltersBar({
  categories,
  selectedCategory,
  onCategoryChange,
  query,
  onQueryChange,
  activeFilter,
  onFilterChange,
}: FiltersBarProps) {
  return (
    <div className="space-y-4">
      {/* Main Filters Bar */}
      <div className="bg-white rounded-xl shadow-sm border p-3 md:p-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          {/* Categories Dropdown */}
          <div className="flex-1 md:flex-none">
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full md:w-48 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F46300] focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* All Products Tab */}
          <div className="flex-1 md:flex-none">
            <button
              onClick={() => onCategoryChange("All Products")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                selectedCategory === "All Products"
                  ? "bg-[#F46300] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Products
            </button>
          </div>

          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="Search products…"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#F46300] focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Compare Button */}
          <div className="flex-1 md:flex-none">
            <button className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-[#F46300] hover:text-[#F46300] transition-colors duration-200">
              Compare
            </button>
          </div>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          onClick={() => onFilterChange("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
            activeFilter === "all"
              ? "bg-[#F46300] text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All Products
        </button>
        <button
          onClick={() => onFilterChange("new")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
            activeFilter === "new"
              ? "bg-[#F46300] text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          ✨ New Arrivals
        </button>
        <button
          onClick={() => onFilterChange("best")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
            activeFilter === "best"
              ? "bg-[#F46300] text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          🏆 Best Sellers
        </button>
      </div>
    </div>
  );
}

