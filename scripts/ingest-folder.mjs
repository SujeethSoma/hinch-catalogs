#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'fs';
import { basename, extname, join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Category mapping and aliases
const CATEGORY_MAP = {
  "Decorative Laminates": "Decorative Laminates",
  "Solid Colour Laminates": "Solid Colour Laminates",
  "Solid Color Laminates": "Solid Colour Laminates",
  "Solid Colours": "Solid Colour Laminates",
  "Solid Colors": "Solid Colour Laminates",
  "Acrylic Laminates": "Acrylic Laminates",
  "PVC Laminates": "PVC Laminates",
  "Thermo Laminates": "Thermo Laminates",
  "Veneers": "Veneers",
  "Veeners": "Veneers",
  "Louvers": "Louvers",
  "360 Louvers": "360 Louvers",
  "Wall Panels": "Wall Panels",
  "Mouldings": "Mouldings",
  "Moulders": "Mouldings",
  "Edge Banding": "Edge Banding",
  "Ti Patti": "Edge Banding",
  "Hardware": "Hardware",
  "Doors": "Doors",
  "Liners": "Liners",
  "Decorative Fabric sheet": "Decorative Fabric sheet"
};

// Helper function to read CSV file
function readCsv(filePath) {
  try {
    let content = readFileSync(filePath, 'utf8');
    // Strip UTF-8 BOM if present
    if (content.charCodeAt(0) === 0xFEFF) {
      content = content.slice(1);
    }
    return content;
  } catch (error) {
    console.error(`Error reading CSV file ${filePath}: ${error.message}`);
    return null;
  }
}

// Robust CSV parser
function parseCsv(text) {
  const lines = text.split(/\r?\n/);
  if (lines.length < 2) {
    throw new Error('CSV must have at least a header row and one data row');
  }

  // Parse header row
  const headers = parseCsvLine(lines[0]);
  if (headers.length === 0) {
    throw new Error('CSV header row is empty');
  }

  // Normalize headers: trim and keep original casing
  const normalizedHeaders = headers.map(h => h.trim());

  const rows = [];
  let currentLine = '';
  let inQuotes = false;
  let lineIndex = 1;

  // Process data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    currentLine += line;

    // Count quotes to determine if we're inside a quoted field
    let quoteCount = 0;
    for (const char of line) {
      if (char === '"') quoteCount++;
    }

    if (quoteCount % 2 === 1) {
      inQuotes = !inQuotes;
    }

    // If we're not in quotes, we have a complete row
    if (!inQuotes) {
      try {
        const fields = parseCsvLine(currentLine);
        if (fields.length > 0) {
          const row = {};
          for (let j = 0; j < normalizedHeaders.length; j++) {
            const value = j < fields.length ? fields[j].trim() : '';
            row[normalizedHeaders[j]] = value;
          }
          rows.push(row);
        }
      } catch (error) {
        console.warn(`Warning: Skipping malformed row at line ${lineIndex}: ${error.message}`);
      }
      currentLine = '';
      lineIndex = i + 1;
    } else {
      // Continue to next line for multi-line fields
      currentLine += '\n';
    }
  }

  return { headers: normalizedHeaders, rows };
}

// Parse a single CSV line with proper quote handling
function parseCsvLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i += 2;
      } else {
        // Start or end of quoted field
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      fields.push(current);
      current = '';
      i++;
    } else {
      current += char;
      i++;
    }
  }

  // Add the last field
  fields.push(current);
  return fields;
}

// Check if a row is completely empty
function isEmptyRow(obj) {
  return Object.values(obj).every(value => 
    typeof value === 'string' ? value.trim() === '' : value === null || value === undefined
  );
}

// Extract category from filename
function extractCategoryFromFilename(filename) {
  // Remove common prefixes and file extension
  let category = filename
    .replace(/^Catalogue links[_\s-]*/, '')
    .replace(/^Catalogue[_\s-]*/, '')
    .replace(/\.[^/.]+$/, '')
    .trim();
  
  // Handle special cases and normalize
  if (CATEGORY_MAP[category]) {
    return CATEGORY_MAP[category];
  }
  
  // Try to find a match (case-insensitive)
  for (const [key, value] of Object.entries(CATEGORY_MAP)) {
    if (key.toLowerCase() === category.toLowerCase()) {
      return value;
    }
  }
  
  // If no match found, return the original category
  return category;
}

// Convert category name to slug for filename
function categoryToSlug(category) {
  return category
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Get sort key for stable sorting
function getSortKey(item) {
  const category = item.category || '';
  const codeFields = ['code', 'CODE', 'sku', 'SKU', 'name', 'NAME', 'title', 'TITLE', 'Catalogues Name'];
  
  let sortField = '';
  for (const field of codeFields) {
    if (item[field] && item[field].trim()) {
      sortField = item[field].trim();
      break;
    }
  }
  
  return `${category}|${sortField}`;
}

// Ensure directory exists
function ensureDir(dirPath) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

// Save JSON file
function saveJson(path, data) {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    writeFileSync(path, jsonString, 'utf8');
  } catch (error) {
    console.error(`Error saving JSON file: ${error.message}`);
    process.exit(1);
  }
}

// Main function
function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error('Usage: node scripts/ingest-folder.mjs "/path/to/csv/folder"');
    process.exit(1);
  }

  const csvDir = args[0];
  
  if (!existsSync(csvDir)) {
    console.error(`Error: CSV directory not found: ${csvDir}`);
    process.exit(1);
  }

  console.log(`Processing CSV files from: ${csvDir}`);

  // Get all CSV files
  const files = readdirSync(csvDir).filter(file => file.endsWith('.csv'));
  console.log(`Found ${files.length} CSV files`);

  // Track statistics
  const stats = {
    totalFiles: files.length,
    processedFiles: 0,
    totalRows: 0,
    categories: {}
  };

  // Collect all processed data
  const allCatalogs = [];
  const categoryData = {};

  // Process each CSV file
  for (const file of files) {
    const filePath = join(csvDir, file);
    console.log(`\nProcessing: ${file}`);
    
    // Read and parse CSV
    const csvContent = readCsv(filePath);
    if (!csvContent) {
      console.error(`Skipping ${file} due to read error`);
      continue;
    }

    try {
      const { headers, rows: allRows } = parseCsv(csvContent);
      console.log(`  Headers: ${headers.join(', ')}`);
      console.log(`  Total rows: ${allRows.length}`);

      // Filter out empty rows
      const nonEmptyRows = allRows.filter(row => !isEmptyRow(row));
      const emptyRowsSkipped = allRows.length - nonEmptyRows.length;
      
      console.log(`  Non-empty rows: ${nonEmptyRows.length}`);
      console.log(`  Empty rows skipped: ${emptyRowsSkipped}`);

      if (nonEmptyRows.length === 0) {
        console.log(`  Skipping ${file} - no non-empty rows`);
        continue;
      }

      // Extract category from filename
      const category = extractCategoryFromFilename(file);
      console.log(`  Category: ${category}`);

      // Add metadata to each row
      const csvBasename = basename(file, extname(file));
      const now = new Date().toISOString();
      
      const processedRows = nonEmptyRows.map(row => ({
        ...row,
        category: category,
        __source: csvBasename,
        __updatedAt: now
      }));

      // Add to combined data
      allCatalogs.push(...processedRows);

      // Add to category-specific data
      if (!categoryData[category]) {
        categoryData[category] = [];
      }
      categoryData[category].push(...processedRows);

      // Update statistics
      stats.processedFiles++;
      stats.totalRows += processedRows.length;
      if (!stats.categories[category]) {
        stats.categories[category] = { files: 0, rows: 0 };
      }
      stats.categories[category].files++;
      stats.categories[category].rows += processedRows.length;

      console.log(`  Processed: ${processedRows.length} items`);

    } catch (error) {
      console.error(`Error processing ${file}: ${error.message}`);
      continue;
    }
  }

  // Sort all catalogs
  allCatalogs.sort((a, b) => {
    const keyA = getSortKey(a);
    const keyB = getSortKey(b);
    return keyA.localeCompare(keyB);
  });

  // Sort category data
  for (const [category, items] of Object.entries(categoryData)) {
    items.sort((a, b) => {
      const keyA = getSortKey(a);
      const keyB = getSortKey(b);
      return keyA.localeCompare(keyB);
    });
  }

  // Ensure output directories exist
  const outputDir = join(__dirname, '..', 'src', 'data');
  const byCategoryDir = join(outputDir, 'by-category');
  ensureDir(outputDir);
  ensureDir(byCategoryDir);

  // Save combined data
  const catalogsPath = join(outputDir, 'catalogs.json');
  saveJson(catalogsPath, allCatalogs);

  // Save category-specific data
  for (const [category, items] of Object.entries(categoryData)) {
    const slug = categoryToSlug(category);
    const categoryPath = join(byCategoryDir, `${slug}.json`);
    saveJson(categoryPath, items);
  }

  // Print summary
  console.log('\n' + '='.repeat(80));
  console.log('INGESTION SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total CSV files found: ${stats.totalFiles}`);
  console.log(`Successfully processed: ${stats.processedFiles}`);
  console.log(`Total rows processed: ${stats.totalRows}`);
  console.log(`Final total records in catalogs.json: ${allCatalogs.length}`);
  
  console.log('\nCategory breakdown:');
  console.log('Category | Files | Rows');
  console.log('-'.repeat(30));
  for (const [category, info] of Object.entries(stats.categories)) {
    console.log(`${category.padEnd(20)} | ${info.files.toString().padStart(5)} | ${info.rows.toString().padStart(4)}`);
  }

  console.log('\nFiles created:');
  console.log(`- Combined: ${catalogsPath}`);
  for (const [category] of Object.entries(categoryData)) {
    const slug = categoryToSlug(category);
    console.log(`- ${category}: ${join(byCategoryDir, `${slug}.json`)}`);
  }

  console.log('\nIngestion completed successfully!');
}

// Run the script
main();
