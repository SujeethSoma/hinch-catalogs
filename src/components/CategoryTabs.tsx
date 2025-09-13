import { CATEGORY_ORDER, HIDDEN_TOP_CATEGORIES, countByExactCategory, getTotalCount, CatalogItem } from '@/lib/categories';

type Props = {
  activeCategory: string;
  setActiveCategory: (c: string) => void;
  items: CatalogItem[];
};

export default function CategoryTabs({ activeCategory, setActiveCategory, items }: Props) {
  const counts = countByExactCategory(items);
  const totalCount = getTotalCount(items);

  // Filter out hidden categories
  const visibleCategories = CATEGORY_ORDER.filter(category => 
    !HIDDEN_TOP_CATEGORIES.has(category)
  );

  return (
    <div className="flex flex-wrap gap-3 mb-8">
      {visibleCategories.map((category) => {
        const isActive = activeCategory === category;
        const count = counts.get(category) || 0;
        const disabled = count === 0;
        
        return (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            disabled={disabled}
            className={`
              px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200
              ${disabled
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : isActive
                  ? "bg-[#F46300] text-white shadow-md shadow-[#F46300]/25"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
              }
            `}
          >
            {category}
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
              isActive ? "bg-white/20" : "bg-gray-100"
            }`}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
  
