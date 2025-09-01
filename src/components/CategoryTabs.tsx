type Props = {
    categories: string[];      // display order
    active: string;
    onChange: (c: string) => void;
    counts?: Record<string, number>;
  };
  
  export default function CategoryTabs({ categories, active, onChange, counts = {} }: Props) {
  const all = ["All", ...categories];
  return (
    <div className="flex flex-wrap gap-3 mb-8">
      {all.map((c) => {
        const isActive = active === c;
        const n = c === "All" ? (counts["__all"] ?? 0) : (counts[c] ?? 0);
        const disabled = c !== "All" && n === 0;
        
        return (
          <button
            key={c}
            onClick={() => !disabled && onChange(c)}
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
            {c}
            {typeof n === "number" && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                isActive ? "bg-white/20" : "bg-gray-100"
              }`}>
                {n}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
  
