import productsData from "@/data/products.json";

export type Product = {
  id: string;
  design_code: string;
  design_name: string;
  product_code: string;
  category: string;
  brand: string;
  finish: string;
  size: string;
  thickness: string;
  length?: string;
  width?: string;
  mrp: number;
  selling_price: number;
  discount: number;
  image_url: string;
  rating: number;
  reviews: number;
  tags: string[];
};

/**
 * Get all products from the JSON data
 */
export async function getProducts(): Promise<Product[]> {
  return productsData as Product[];
}

/**
 * Calculate discount percentage for a product
 * The discount field is already calculated in the import script
 */
export function calcDiscount(p: Product): number {
  return Math.round(p.discount);
}

/**
 * Format number as Indian Rupee currency
 */
export function money(n: number): string {
  return `₹${n.toLocaleString('en-IN')}`;
}

/**
 * Get unique categories from products data in a stable order
 */
export function getProductCategories(): string[] {
  const categories = new Set<string>();
  
  productsData.forEach((product: Product) => {
    categories.add(product.category);
  });
  
  // Return categories in order of appearance in data
  return Array.from(categories).sort();
}

/**
 * Get all unique categories including "All Products"
 */
export const PRODUCT_CATEGORIES = ["All Products", ...getProductCategories()];

/**
 * Filter products by category
 */
export function filterProductsByCategory(products: Product[], category: string): Product[] {
  if (category === "All Products") {
    return products;
  }
  return products.filter(product => product.category === category);
}

/**
 * Search products by query (searches design_name, brand, and design_code)
 */
export function searchProducts(products: Product[], query: string): Product[] {
  if (!query.trim()) {
    return products;
  }
  
  const lowerQuery = query.toLowerCase();
  return products.filter(product => 
    product.design_name.toLowerCase().includes(lowerQuery) ||
    product.brand.toLowerCase().includes(lowerQuery) ||
    product.design_code.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Filter products by active filter (new, best, all)
 */
export function filterProductsByActiveFilter(products: Product[], activeFilter: "all" | "new" | "best"): Product[] {
  switch (activeFilter) {
    case "new":
      return products.filter(product => product.tags.includes("NEW"));
    case "best":
      // Filter by rating >= 4.5 or top 20% by reviews+rating
      const sortedByRating = products
        .filter(product => product.rating >= 4.5)
        .sort((a, b) => (b.rating + b.reviews / 100) - (a.rating + a.reviews / 100));
      return sortedByRating.slice(0, Math.ceil(products.length * 0.2));
    default:
      return products;
  }
}

