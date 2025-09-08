import fs from 'fs/promises';
import path from 'path';
import { parse } from 'csv-parse/sync';

interface Product {
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
}

interface CSVRow {
  FINISH: string;
  'DESIGN CODE': string;
  'DESIGN NAME': string;
  'PRODUCT CODE': string;
  CATEGORY: string;
  MRP: string;
  'Selling Price': string;
  'Discount %': string;
  BRAND: string;
  SIZE: string;
  Thickness: string;
  Length: string;
  Width: string;
  'Image name ': string;
  'Image URL': string;
  'Product URL': string;
  'Sheet Price': string;
  'Market Price': string;
  Discount: string;
  'Effect Type': string;
  Colour: string;
  Application: string;
  'Coverage Area': string;
  'Package Size': string;
  'Indoor Outdoor': string;
  'Project Type': string;
  Features: string;
  Look: string;
  Description: string;
}

function parseNumber(value: string): number {
  if (!value || value.trim() === '') return 0;
  const cleaned = value.replace(/[₹,\s]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

function generateRandomRating(): number {
  return Math.round((Math.random() * 1 + 4) * 10) / 10; // 4.0 to 5.0
}

function generateRandomReviews(): number {
  return Math.floor(Math.random() * 451) + 50; // 50 to 500
}

function generateTags(discount: number): string[] {
  const tags: string[] = [];
  if (discount >= 20) {
    tags.push('POPULAR');
  }
  return tags;
}

function calculateDiscount(mrp: number, sellingPrice: number, discountPercent?: number): number {
  if (discountPercent && discountPercent > 0) {
    return Math.round(discountPercent);
  }
  if (mrp > 0 && sellingPrice > 0) {
    return Math.round(100 - (sellingPrice / mrp) * 100);
  }
  return 0;
}

async function importProducts() {
  try {
    console.log('🚀 Starting product import from CSV...');
    
    // Read the CSV file
    const csvPath = path.join(process.cwd(), '..', 'Louvers final - Kairos Louvers .csv');
    const csvContent = await fs.readFile(csvPath, 'utf-8');
    
    console.log('📄 CSV file read successfully');
    
    // Parse CSV
    const records: CSVRow[] = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
    
    console.log(`📊 Found ${records.length} rows in CSV`);
    
    // Transform to Product objects
    const products: Product[] = records.map((row, index) => {
      let mrp = parseNumber(row.MRP || row['Market Price'] || row['Sheet Price']);
      let sellingPrice = parseNumber(row['Selling Price']);
      let discountPercent = parseNumber(row['Discount %'] || row.Discount);
      
      // Generate realistic pricing if not provided
      if (mrp === 0 && sellingPrice === 0) {
        // Base price for louvers: ₹150-300 per linear foot
        const basePrice = Math.floor(Math.random() * 151) + 150; // 150-300
        const size = row.SIZE?.trim() || '8ft x 4.5in';
        const length = parseFloat(size.match(/(\d+(?:\.\d+)?)ft/)?.[1] || '8');
        mrp = Math.round(basePrice * length);
        discountPercent = Math.floor(Math.random() * 26) + 5; // 5-30% discount
        sellingPrice = Math.round(mrp * (1 - discountPercent / 100));
      }
      
      const discount = calculateDiscount(mrp, sellingPrice, discountPercent);
      const rating = generateRandomRating();
      const reviews = generateRandomReviews();
      const tags = generateTags(discount);
      
      // Use DESIGN CODE as ID, fallback to index
      const id = row['DESIGN CODE']?.trim() || `product-${index + 1}`;
      
      return {
        id,
        design_code: row['DESIGN CODE']?.trim() || '',
        design_name: row['DESIGN NAME']?.trim() || row['PRODUCT CODE']?.trim() || '',
        product_code: row['PRODUCT CODE']?.trim() || '',
        category: row.CATEGORY?.trim() || 'Louvers',
        brand: row.BRAND?.trim() || 'KAIROS',
        finish: row.FINISH?.trim() || '',
        size: row.SIZE?.trim() || '',
        thickness: row.Thickness?.trim() || '',
        length: row.Length?.trim() || undefined,
        width: row.Width?.trim() || undefined,
        mrp,
        selling_price: sellingPrice,
        discount,
        image_url: row['Image URL']?.trim() || '/placeholder-product.jpg',
        rating,
        reviews,
        tags
      };
    });
    
    // Filter out products with missing essential data
    const validProducts = products.filter(p => 
      p.design_code && 
      p.design_name
    );
    
    // Debug: show why products were filtered out
    const filteredOut = products.filter(p => !p.design_code || !p.design_name);
    if (filteredOut.length > 0) {
      console.log(`🔍 Filtered out ${filteredOut.length} products due to missing design_code or design_name`);
      console.log('Sample filtered product:', filteredOut[0]);
    }
    
    console.log(`✅ Processed ${validProducts.length} valid products (filtered out ${products.length - validProducts.length} invalid entries)`);
    
    // Create output directory if it doesn't exist
    const outputDir = path.join(process.cwd(), 'src', 'data');
    await fs.mkdir(outputDir, { recursive: true });
    
    // Write to JSON file
    const outputPath = path.join(outputDir, 'products.json');
    await fs.writeFile(outputPath, JSON.stringify(validProducts, null, 2));
    
    console.log(`💾 Products saved to ${outputPath}`);
    
    // Print summary statistics
    const categories = [...new Set(validProducts.map(p => p.category))];
    const brands = [...new Set(validProducts.map(p => p.brand))];
    const avgRating = validProducts.reduce((sum, p) => sum + p.rating, 0) / validProducts.length;
    const avgDiscount = validProducts.reduce((sum, p) => sum + p.discount, 0) / validProducts.length;
    const popularProducts = validProducts.filter(p => p.tags.includes('POPULAR')).length;
    
    console.log('\n📈 Import Summary:');
    console.log(`   Total Products: ${validProducts.length}`);
    console.log(`   Categories: ${categories.join(', ')}`);
    console.log(`   Brands: ${brands.join(', ')}`);
    console.log(`   Average Rating: ${avgRating.toFixed(1)}`);
    console.log(`   Average Discount: ${avgDiscount.toFixed(1)}%`);
    console.log(`   Popular Products (≥20% discount): ${popularProducts}`);
    
    // Show sample products
    console.log('\n🔍 Sample Products:');
    validProducts.slice(0, 3).forEach((product, i) => {
      console.log(`   ${i + 1}. ${product.design_name} (${product.design_code})`);
      console.log(`      Category: ${product.category} | Brand: ${product.brand}`);
      console.log(`      Price: ₹${product.selling_price} (MRP: ₹${product.mrp}) | Discount: ${product.discount}%`);
      console.log(`      Rating: ${product.rating}/5.0 (${product.reviews} reviews)`);
      console.log(`      Tags: ${product.tags.length > 0 ? product.tags.join(', ') : 'None'}`);
      console.log('');
    });
    
    console.log('🎉 Product import completed successfully!');
    
  } catch (error) {
    console.error('❌ Error importing products:', error);
    process.exit(1);
  }
}

// Run the import
importProducts();