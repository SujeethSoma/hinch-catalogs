"use client";

interface HeaderHeroProps {
  activeFilter: "all" | "new" | "best";
  onFilterChange: (filter: "all" | "new" | "best") => void;
}

export default function HeaderHero({ activeFilter, onFilterChange }: HeaderHeroProps) {
  return (
    <div className="space-y-6">
      {/* Header Strip */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F46300] rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#414042]">Product Catalog Hub</h1>
              <p className="text-sm text-gray-600">Discover our comprehensive range of quality products</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={() => onFilterChange("all")}
          className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
            activeFilter === "all"
              ? "bg-[#F46300] text-white shadow-md"
              : "bg-white text-gray-700 border border-gray-200 hover:border-[#F46300] hover:text-[#F46300]"
          }`}
        >
          📈 Trending
        </button>
        <button
          onClick={() => onFilterChange("new")}
          className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
            activeFilter === "new"
              ? "bg-[#F46300] text-white shadow-md"
              : "bg-white text-gray-700 border border-gray-200 hover:border-[#F46300] hover:text-[#F46300]"
          }`}
        >
          ✨ New Arrivals
        </button>
        <button
          onClick={() => onFilterChange("best")}
          className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
            activeFilter === "best"
              ? "bg-[#F46300] text-white shadow-md"
              : "bg-white text-gray-700 border border-gray-200 hover:border-[#F46300] hover:text-[#F46300]"
          }`}
        >
          🏆 Best Sellers
        </button>
      </div>
    </div>
  );
}




