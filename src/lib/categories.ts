export interface CatalogItem {
  name: string;
  drive_link: string;
  category: string;
  brand?: string;
  normalizedCategory?: string;
}

export const CATEGORY_ORDER = [
  "All",
  "Laminates",
  "Hardware",
  "Louvers",
  "Wall Panels",
  "Veneers",
  "Profiles",
  "OSG Board",
  "Flooring",
  "Electrical"
] as const;

export type CategoryType = typeof CATEGORY_ORDER[number];

export function normalizeCategory(raw?: string): string {
  if (!raw) return "Unknown";
  
  const normalized = raw.toLowerCase().trim();
  
  // Laminates group
  if (["decorative laminates", "acrylic laminates", "pvc laminates", "liners", "laminate", "laminates"].includes(normalized)) {
    return "Laminates";
  }
  
  // Louvers group
  if (["louvers", "louver", "360 louvers"].includes(normalized)) {
    return "Louvers";
  }
  
  // Wall Panels group
  if (["wall panels", "wall panel", "moulders", "mouldings", "ti patti", "ti-patti", "ti patti (1)"].includes(normalized)) {
    return "Wall Panels";
  }
  
  // Veneers group
  if (["veneers", "veneer"].includes(normalized)) {
    return "Veneers";
  }
  
  // Profiles group
  if (["profiles", "profile"].includes(normalized)) {
    return "Profiles";
  }
  
  // OSG Board group
  if (["osg board", "osgboard", "osg"].includes(normalized)) {
    return "OSG Board";
  }
  
  // Flooring group
  if (["flooring", "floors", "floor"].includes(normalized)) {
    return "Flooring";
  }
  
  // Electrical group
  if (["electrical", "electrics"].includes(normalized)) {
    return "Electrical";
  }
  
  // Hardware group (catch-all for other categories)
  if (["hardware", "moulders", "mouldings"].includes(normalized)) {
    return "Hardware";
  }
  
  // Default: title-case the input
  return raw
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function countByCategory(items: CatalogItem[]): Map<string, number> {
  const counts = new Map<string, number>();
  
  // Initialize all categories with 0
  CATEGORY_ORDER.forEach(category => {
    if (category !== "All") {
      counts.set(category, 0);
    }
  });
  
  // Count items by normalized category
  items.forEach(item => {
    const normalized = normalizeCategory(item.category);
    const currentCount = counts.get(normalized) || 0;
    counts.set(normalized, currentCount + 1);
  });
  
  return counts;
}

export function getTotalCount(items: CatalogItem[]): number {
  return items.length;
}
