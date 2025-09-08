import decorativeLaminatesData from "@/data/decorative-laminates.json";

export interface DecorativeLaminatesItem {
  id: string;
  name: string;
  brand: string;
  category: string;
  drive_link: string;
  preview_url: string;
  download_url: string;
  thumbnail_url: string;
}

/**
 * Get all Decorative Laminates items
 */
export function getDecorativeLaminates(): DecorativeLaminatesItem[] {
  return decorativeLaminatesData as DecorativeLaminatesItem[];
}

/**
 * Get Decorative Laminates items by brand
 */
export function getDecorativeLaminatesByBrand(brand: string): DecorativeLaminatesItem[] {
  const items = getDecorativeLaminates();
  return items.filter(item => 
    item.brand.toLowerCase().includes(brand.toLowerCase())
  );
}

/**
 * Get Decorative Laminates items by name search
 */
export function searchDecorativeLaminates(query: string): DecorativeLaminatesItem[] {
  const items = getDecorativeLaminates();
  const searchTerm = query.toLowerCase();
  return items.filter(item => 
    item.name.toLowerCase().includes(searchTerm) ||
    item.brand.toLowerCase().includes(searchTerm)
  );
}

/**
 * Get unique brands from Decorative Laminates
 */
export function getDecorativeLaminatesBrands(): string[] {
  const items = getDecorativeLaminates();
  return [...new Set(items.map(item => item.brand))].sort();
}

/**
 * Get count of Decorative Laminates items
 */
export function getDecorativeLaminatesCount(): number {
  return getDecorativeLaminates().length;
}
