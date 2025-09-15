import { CATEGORY_ORDER, countByExactCategory, getTotalCount, CatalogItem } from '@/lib/categories';

type Props = {
  activeCategory: string;
  setActiveCategory: (c: string) => void;
  items: CatalogItem[];
};

export default function CategoryTabs({ activeCategory, setActiveCategory, items }: Props) {
  const counts = countByExactCategory(items);
  const totalCount = getTotalCount(items);

  return (
    <div className="flex flex-wrap gap-3 mb-8">
      {CATEGORY_ORDER.map((category) => {
        const isActive = activeCategory === category;
        const count = category === "All" ? totalCount : (counts.get(category) || 0);
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
                  ? "bg-hinch-primary text-white shadow-md shadow-hinch-primary/25"
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
  
