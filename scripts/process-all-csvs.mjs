#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { basename, extname, join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

// Load JSON file
function loadJson(path) {
  if (!existsSync(path)) {
    return [];
  }
  try {
    const content = readFileSync(path, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error loading JSON file: ${error.message}`);
    return [];
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

// Extract category from filename
function extractCategoryFromFilename(filename) {
  // Remove "Catalogue links" prefix and file extension
  let category = filename
    .replace(/^Catalogue links[_\s-]*/, '')
    .replace(/\.[^/.]+$/, '')
    .trim();
  
  // Handle special cases
  if (category === '360 Louvers') {
    category = '360 Louvers';
  } else if (category === 'Ti Patti') {
    category = 'Ti Patti';
  } else if (category === 'Edge Banding') {
    category = 'Edge Banding';
  } else if (category === 'Wall Panels') {
    category = 'Wall Panels';
  } else if (category === 'PVC Laminates') {
    category = 'PVC Laminates';
  } else if (category === 'Thermo Laminates') {
    category = 'Thermo Laminates';
  } else if (category === 'Decorative Laminates') {
    category = 'Decorative Laminates';
  } else if (category === 'Acrylic Laminates') {
    category = 'Acrylic Laminates';
  }
  
  return category;
}

// Main function
function main() {
  const csvDir = join(__dirname, '..', '..', 'Catalogue links__CSV__2025-09-11_18.58.27');
  
  if (!existsSync(csvDir)) {
    console.error(`Error: CSV directory not found: ${csvDir}`);
    process.exit(1);
  }

  console.log(`Processing CSV files from: ${csvDir}`);

  // Get all CSV files
  const files = readdirSync(csvDir).filter(file => file.endsWith('.csv'));
  console.log(`Found ${files.length} CSV files`);

  // Load existing catalogs
  const catalogsPath = join(__dirname, '..', 'src', 'data', 'catalogs.json');
  let allCatalogs = loadJson(catalogsPath);
  
  // Track statistics
  const stats = {
    totalFiles: files.length,
    processedFiles: 0,
    totalRows: 0,
    totalEmptyRows: 0,
    categories: {}
  };

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

      // Remove existing items for this category
      const existingCount = allCatalogs.filter(item => item.category === category).length;
      allCatalogs = allCatalogs.filter(item => item.category !== category);

      // Add new rows
      allCatalogs = [...allCatalogs, ...processedRows];

      // Update statistics
      stats.processedFiles++;
      stats.totalRows += processedRows.length;
      stats.totalEmptyRows += emptyRowsSkipped;
      stats.categories[category] = {
        oldCount: existingCount,
        newCount: processedRows.length,
        file: file
      };

      console.log(`  Replaced: ${existingCount} → ${processedRows.length} items`);

    } catch (error) {
      console.error(`Error processing ${file}: ${error.message}`);
      continue;
    }
  }

  // Stable sort all catalogs
  allCatalogs.sort((a, b) => {
    const keyA = getSortKey(a);
    const keyB = getSortKey(b);
    return keyA.localeCompare(keyB);
  });

  // Save updated catalogs
  saveJson(catalogsPath, allCatalogs);

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('PROCESSING SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total CSV files found: ${stats.totalFiles}`);
  console.log(`Successfully processed: ${stats.processedFiles}`);
  console.log(`Total rows processed: ${stats.totalRows}`);
  console.log(`Total empty rows skipped: ${stats.totalEmptyRows}`);
  console.log(`Final total records in catalogs.json: ${allCatalogs.length}`);
  
  console.log('\nCategory breakdown:');
  for (const [category, info] of Object.entries(stats.categories)) {
    console.log(`  ${category}: ${info.oldCount} → ${info.newCount} (from ${info.file})`);
  }

  console.log('\nProcessing completed successfully!');
}

// Run the script
main();


