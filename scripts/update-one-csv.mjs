#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs';
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
    console.error(`Error reading CSV file: ${error.message}`);
    process.exit(1);
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
    process.exit(1);
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
  const codeFields = ['code', 'CODE', 'sku', 'SKU', 'name', 'NAME', 'title', 'TITLE'];
  
  let sortField = '';
  for (const field of codeFields) {
    if (item[field] && item[field].trim()) {
      sortField = item[field].trim();
      break;
    }
  }
  
  return `${category}|${sortField}`;
}

// Main function
function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error('Usage: node scripts/update-one-csv.mjs "/path/to/file.csv" --category "CategoryName"');
    process.exit(1);
  }

  const csvPath = args[0];
  let category = null;

  // Parse --category argument
  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--category' && i + 1 < args.length) {
      category = args[i + 1];
      break;
    }
  }

  // If no category provided, derive from filename
  if (!category) {
    const filename = basename(csvPath, extname(csvPath));
    category = filename.replace(/^Catalogue links - /, '').trim();
    console.log(`Derived category from filename: "${category}"`);
  }

  if (!category) {
    console.error('Error: Category is required. Provide --category argument or ensure filename contains category name.');
    process.exit(1);
  }

  // Check if CSV file exists
  if (!existsSync(csvPath)) {
    console.error(`Error: CSV file not found: ${csvPath}`);
    process.exit(1);
  }

  console.log(`Processing CSV: ${csvPath}`);
  console.log(`Category: ${category}`);

  // Read and parse CSV
  const csvContent = readCsv(csvPath);
  const { headers, rows: allRows } = parseCsv(csvContent);

  console.log(`Total lines in CSV (minus header): ${allRows.length}`);

  // Filter out empty rows
  const nonEmptyRows = allRows.filter(row => !isEmptyRow(row));
  const emptyRowsSkipped = allRows.length - nonEmptyRows.length;

  console.log(`Parsed rows kept: ${nonEmptyRows.length}`);
  console.log(`Empty rows skipped: ${emptyRowsSkipped}`);

  if (nonEmptyRows.length === 0) {
    console.error('Error: No non-empty rows found in CSV');
    process.exit(1);
  }

  // Add metadata to each row
  const csvBasename = basename(csvPath, extname(csvPath));
  const now = new Date().toISOString();
  
  const processedRows = nonEmptyRows.map(row => ({
    ...row,
    category: category,
    __source: csvBasename,
    __updatedAt: now
  }));

  // Load existing catalogs
  const catalogsPath = join(__dirname, '..', 'src', 'data', 'catalogs.json');
  const existingCatalogs = loadJson(catalogsPath);

  // Count existing items for this category
  const existingCount = existingCatalogs.filter(item => item.category === category).length;

  // Remove existing items for this category
  const filteredCatalogs = existingCatalogs.filter(item => item.category !== category);

  // Add new rows
  const updatedCatalogs = [...filteredCatalogs, ...processedRows];

  // Stable sort
  updatedCatalogs.sort((a, b) => {
    const keyA = getSortKey(a);
    const keyB = getSortKey(b);
    return keyA.localeCompare(keyB);
  });

  // Save updated catalogs
  saveJson(catalogsPath, updatedCatalogs);

  console.log(`Replaced count for category "${category}": ${existingCount} → ${processedRows.length}`);
  console.log(`Final total records in catalogs.json: ${updatedCatalogs.length}`);
  console.log('Update completed successfully!');
}

// Run the script
main();