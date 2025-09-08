export interface CatalogItem {
  name: string;
  driveLink: string;
  category: string;
  brand?: string;
  categoryKey: string;
  previewUrl: string;
  downloadUrl: string;
  thumbnailUrl: string;
  fileId: string;
  sourceCsv: string;
}

export const CATEGORY_ORDER = [
  "All",
  "Decorative Laminates",
  "360 Louvers",
  "Decorative Fabric sheet",
  "Hardware",
  "Liners",
  "Louvers",
  "Mouldings",
  "PVC Laminates",
  "Wall Panels"
] as const;

export type CategoryType = typeof CATEGORY_ORDER[number];

export function safeCompare(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export function countByExactCategory(items: CatalogItem[]): Map<string, number> {
  const counts = new Map<string, number>();
  
  // Initialize all categories with 0
  CATEGORY_ORDER.forEach(category => {
    if (category !== "All") {
      counts.set(category, 0);
    }
  });
  
  // Count items by exact category
  items.forEach(item => {
    const currentCount = counts.get(item.category) || 0;
    counts.set(item.category, currentCount + 1);
  });
  
  return counts;
}

export function ensureKnownCategory(cat: string): string {
  if (!cat) return "All";
  
  // Check if the category exists in CATEGORY_ORDER (case-insensitive)
  const found = CATEGORY_ORDER.find(category => 
    category !== "All" && safeCompare(category, cat)
  );
  
  return found || "All";
}

export function getTotalCount(items: CatalogItem[]): number {
  return items.length;
}
