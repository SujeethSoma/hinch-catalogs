#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { parse } from 'csv-parse/sync';
import pkg from 'fast-glob';
const { glob } = pkg;

// Canonical categories mapping
const CATEGORY_MAP = {
  "Decorative Laminates": "Decorative Laminates",
  "Acrylic Laminates": "Acrylic Laminates",
  "PVC Laminates": "PVC Laminates",
  "Thermo Laminates": "Thermo Laminates",
  "Veneers": "Veneers",
  "Louvers": "Louvers",
  "360 Louvers": "360 Louvers",
  "Wall Panels": "Wall Panels",
  "Mouldings": "Mouldings",
  "Edge Banding": "Edge Banding",
  "Hardware": "Hardware",
  "Doors": "Doors",
  "Liners": "Liners",
  "Decorative Fabric sheet": "Decorative Fabric sheet",
  "Ti Patti": "Edge Banding",
  "Ti Patti/Edge": "Edge Banding",
  "PVC": "PVC Laminates",
  "Thermo": "Thermo Laminates",
  "Fabric": "Decorative Fabric sheet"
};

function normalizeCategory(categoryValue, fileName) {
  // Clean and normalize the input
  const cleanValue = categoryValue ? categoryValue.toString().trim() : '';
  
  // Try to find exact match in CATEGORY_MAP
  if (CATEGORY_MAP[cleanValue]) {
    return CATEGORY_MAP[cleanValue];
  }
  
  // Try case-insensitive match
  const lowerValue = cleanValue.toLowerCase();
  for (const [key, value] of Object.entries(CATEGORY_MAP)) {
    if (key.toLowerCase() === lowerValue) {
      return value;
    }
  }
  
  // Fallback to original value if no mapping found
  return cleanValue || 'Uncategorized';
}

function determineCategory(record, fileName) {
  // Priority 1: Check for category columns in the record
  const categoryColumns = ['Category', 'CATEGORY', 'Group', 'GROUP', 'category', 'group'];
  
  for (const col of categoryColumns) {
    if (record[col] && record[col].toString().trim()) {
      return normalizeCategory(record[col], fileName);
    }
  }
  
  // Priority 2: Use filename (without extension)
  const fileNameWithoutExt = path.basename(fileName, '.csv');
  return normalizeCategory(fileNameWithoutExt, fileName);
}

async function ingestCSVs(csvFolderPath) {
  try {
    console.log(`🚀 Starting CSV ingestion from: ${csvFolderPath}`);
    
    // Check if folder exists
    try {
      await fs.access(csvFolderPath);
    } catch (error) {
      throw new Error(`CSV folder not found: ${csvFolderPath}`);
    }
    
    // Find all CSV files in the folder
    const csvPattern = path.join(csvFolderPath, '*.csv');
    const csvFiles = await glob(csvPattern);
    
    if (csvFiles.length === 0) {
      throw new Error(`No CSV files found in: ${csvFolderPath}`);
    }
    
    console.log(`📄 Found ${csvFiles.length} CSV files`);
    
    const allData = [];
    const categoryCounts = {};
    
    // Process each CSV file
    for (const csvFile of csvFiles) {
      console.log(`📊 Processing: ${path.basename(csvFile)}`);
      
      try {
        // Read CSV content
        const csvContent = await fs.readFile(csvFile, 'utf-8');
        
        // Parse CSV with proper handling of commas, quotes, and newlines
        const records = parse(csvContent, {
          columns: true,           // Use first row as headers
          skip_empty_lines: true,  // Skip empty lines
          trim: true,             // Trim whitespace
          quote: '"',             // Handle quoted fields
          escape: '"',            // Handle escaped quotes
          relax_column_count: true // Allow varying column counts
        });
        
        // Process each record
        const processedRecords = records.map(record => {
          // Determine canonical category
          const category = determineCategory(record, csvFile);
          
          // Count categories
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
          
          // Add source and category fields
          return {
            ...record,
            __source: path.basename(csvFile, '.csv'),
            category: category
          };
        });
        
        allData.push(...processedRecords);
        console.log(`   ✅ Added ${records.length} rows`);
        
      } catch (error) {
        console.error(`   ❌ Error processing ${path.basename(csvFile)}:`, error.message);
        // Continue with other files
      }
    }
    
    console.log(`📈 Total rows collected: ${allData.length}`);
    
    // Create output directory if it doesn't exist
    const outputDir = path.join(process.cwd(), 'src', 'data');
    await fs.mkdir(outputDir, { recursive: true });
    
    // Write merged data to JSON file
    const outputPath = path.join(outputDir, 'catalogs.json');
    await fs.writeFile(outputPath, JSON.stringify(allData, null, 2));
    
    console.log(`💾 Data saved to: ${outputPath}`);
    console.log(`📊 Total rows: ${allData.length}`);
    
    // Print category summary
    console.log('\n📋 Category Summary:');
    Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a) // Sort by count descending
      .forEach(([category, count]) => {
        console.log(`   ${category}: ${count} records`);
      });
    
    console.log('🎉 CSV ingestion completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during CSV ingestion:', error.message);
    process.exit(1);
  }
}

// Get CSV folder path from command line arguments
const csvFolderPath = process.argv[2];

if (!csvFolderPath) {
  console.error('❌ Please provide the CSV folder path as an argument');
  console.error('Usage: node scripts/ingest-csvs.mjs "/path/to/csv/folder"');
  process.exit(1);
}

// Run the ingestion
ingestCSVs(csvFolderPath);
