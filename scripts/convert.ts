import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

interface CatalogItem {
  name: string;
  drive_link: string;
  category: string;
  brand?: string;
}

function extractCategoryFromFilename(filename: string): string {
  // Remove "Catalogue links - " prefix and ".csv" suffix
  const category = filename
    .replace("Catalogue links - ", "")
    .replace(".csv", "")
    .trim();
  
  return category;
}

function processCSVFile(filePath: string): CatalogItem[] {
  try {
    const csvContent = fs.readFileSync(filePath, "utf8");
    const rows = parse(csvContent, { columns: true, skip_empty_lines: true });
    
    const category = extractCategoryFromFilename(path.basename(filePath));
    
    return rows.map((row: any) => {
      // Handle different possible column names
      const name = row["Catalogues Name"] || row["Catalogues Name "] || row["name"] || "";
      const driveLink = row["Catalouge links"] || row["Catalogues Links"] || row["drive_link"] || row["link"] || "";
      const brand = row["Brands"] || row["brand"] || "";
      
      return {
        name: name.trim(),
        drive_link: driveLink.trim(),
        category: category,
        brand: brand.trim() || undefined
      };
    }).filter(item => item.name && item.drive_link); // Filter out items with missing name or drive_link
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return [];
  }
}

function main() {
  const dataDir = path.join(__dirname, "..", "..", "Data");
  const outputPath = path.join(__dirname, "..", "src", "data", "catalogs.json");
  
  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Get all CSV files in the Data directory
  const csvFiles = fs.readdirSync(dataDir)
    .filter(file => file.endsWith(".csv") && file.startsWith("Catalogue links -"));
  
  console.log(`Found ${csvFiles.length} CSV files to process:`);
  csvFiles.forEach(file => console.log(`  - ${file}`));
  
  // Process all CSV files
  const allItems: CatalogItem[] = [];
  
  csvFiles.forEach(csvFile => {
    const filePath = path.join(dataDir, csvFile);
    const items = processCSVFile(filePath);
    allItems.push(...items);
    console.log(`  Processed ${csvFile}: ${items.length} items`);
  });
  
  // Write combined data to JSON file
  const outputData = { data: allItems };
  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
  
  console.log(`\n✅ Successfully wrote ${outputPath} with ${allItems.length} total items`);
  console.log(`📁 Categories found: ${[...new Set(allItems.map(item => item.category))].join(", ")}`);
}

main();
