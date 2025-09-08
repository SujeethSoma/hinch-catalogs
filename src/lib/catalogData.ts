import mainCatalogsData from "@/data/catalogs.json";
import decorativeLaminatesData from "@/data/decorative-laminates.json";
import { CatalogItem } from "./categories";

/**
 * Central catalog data aggregator
 * Merges all catalog sources into a single array
 */
export function getAllCatalogs(): CatalogItem[] {
  // Convert decorative laminates data to match CatalogItem interface
  const decorativeLaminates = decorativeLaminatesData.map(item => ({
    name: item.name,
    driveLink: item.driveLink,
    category: item.category,
    brand: item.brand,
    categoryKey: item.categoryKey,
    previewUrl: item.previewUrl,
    downloadUrl: item.downloadUrl,
    thumbnailUrl: item.thumbnailUrl,
    fileId: item.fileId,
    sourceCsv: item.sourceCsv
  }));

  // Combine main catalogs with decorative laminates
  const allCatalogs = [
    ...mainCatalogsData,
    ...decorativeLaminates
  ];

  // Sort by category then name
  return allCatalogs.sort((a, b) => 
    a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
  );
}

/**
 * Get catalogs by category
 */
export function getCatalogsByCategory(category: string): CatalogItem[] {
  const allCatalogs = getAllCatalogs();
  if (category === "All") return allCatalogs;
  
  return allCatalogs.filter(item => 
    item.category.toLowerCase() === category.toLowerCase()
  );
}

/**
 * Get catalogs by brand
 */
export function getCatalogsByBrand(brand: string): CatalogItem[] {
  const allCatalogs = getAllCatalogs();
  if (brand === "All") return allCatalogs;
  
  return allCatalogs.filter(item => 
    item.brand && item.brand.toLowerCase().includes(brand.toLowerCase())
  );
}

/**
 * Search catalogs
 */
export function searchCatalogs(query: string): CatalogItem[] {
  const allCatalogs = getAllCatalogs();
  if (!query.trim()) return allCatalogs;
  
  const searchTerm = query.toLowerCase();
  return allCatalogs.filter(item => 
    item.name.toLowerCase().includes(searchTerm) ||
    (item.brand && item.brand.toLowerCase().includes(searchTerm)) ||
    item.category.toLowerCase().includes(searchTerm)
  );
}

/**
 * Get unique brands
 */
export function getUniqueBrands(): string[] {
  const allCatalogs = getAllCatalogs();
  const brands = allCatalogs
    .map(item => item.brand)
    .filter(Boolean) as string[];
  
  return [...new Set(brands)].sort();
}

/**
 * Get category counts
 */
export function getCategoryCounts(): Map<string, number> {
  const allCatalogs = getAllCatalogs();
  const counts = new Map<string, number>();
  
  allCatalogs.forEach(item => {
    const currentCount = counts.get(item.category) || 0;
    counts.set(item.category, currentCount + 1);
  });
  
  return counts;
}
