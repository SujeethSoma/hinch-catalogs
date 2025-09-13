import catalogsData from "@/data/catalogs.json";
import { CatalogItem } from "./categories";

/**
 * Central catalog data aggregator
 * Loads all catalog data from the main catalogs.json file
 */
export function getAllCatalogs(): CatalogItem[] {
  // Convert catalog data to match CatalogItem interface
  const allCatalogs = catalogsData.map(item => ({
    name: item["Catalogues Name"] || "",
    driveLink: item["Catalouge links"] || item["Catalogues Links"] || "",
    category: item.category || "",
    brand: item.Brand || item.Brands || "",
    categoryKey: "", // Not available in current data
    previewUrl: item["Catalouge links"] || item["Catalogues Links"] || "", // Use drive link as preview
    downloadUrl: item["Catalouge links"] || item["Catalogues Links"] || "", // Use drive link as download
    thumbnailUrl: "", // Not available in current data
    fileId: "", // Not available in current data
    sourceCsv: item.__source || "",
    // New fields for enhanced preview (optional, may not exist in current data)
    previewImage: (item as any).previewImage || "",
    thumbnail: (item as any).thumbnail || "",
    pdfUrl: (item as any).pdfUrl || ""
  }));

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



