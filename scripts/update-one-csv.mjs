#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { parse } from 'csv-parse/sync';

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

async function updateOneCSV(csvFilePath) {
  try {
    console.log(`🔄 Updating single CSV: ${path.basename(csvFilePath)}`);
    
    // Check if CSV file exists
    try {
      await fs.access(csvFilePath);
    } catch (error) {
      throw new Error(`CSV file not found: ${csvFilePath}`);
    }
    
    // Read and parse the CSV
    const csvContent = await fs.readFile(csvFilePath, 'utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      quote: '"',
      escape: '"',
      relax_column_count: true
    });
    
    console.log(`📊 Parsed ${records.length} rows from CSV`);
    
    // Process records and determine category
    const processedRecords = records.map(record => {
      const category = determineCategory(record, csvFilePath);
      const sourceName = path.basename(csvFilePath, '.csv');
      
      return {
        ...record,
        __source: sourceName,
        category: category
      };
    });
    
    // Determine the category for this CSV
    const csvCategory = processedRecords[0]?.category || 'Uncategorized';
    console.log(`📋 Category determined: ${csvCategory}`);
    
    // Load existing JSON data
    const jsonPath = path.join(process.cwd(), 'src', 'data', 'catalogs.json');
    let existingData = [];
    
    try {
      const jsonContent = await fs.readFile(jsonPath, 'utf-8');
      existingData = JSON.parse(jsonContent);
      console.log(`📄 Loaded ${existingData.length} existing records`);
    } catch (error) {
      console.log('📄 No existing data found, starting fresh');
    }
    
    // Count old entries for this category
    const oldCount = existingData.filter(item => item.category === csvCategory).length;
    
    // Remove old entries for this category
    const filteredData = existingData.filter(item => item.category !== csvCategory);
    console.log(`🗑️  Removed ${oldCount} old ${csvCategory} records`);
    
    // Append new records
    const updatedData = [...filteredData, ...processedRecords];
    console.log(`➕ Added ${processedRecords.length} new ${csvCategory} records`);
    
    // Save updated data
    await fs.writeFile(jsonPath, JSON.stringify(updatedData, null, 2));
    
    console.log(`💾 Updated data saved to: ${jsonPath}`);
    console.log(`📊 Total records: ${updatedData.length}`);
    console.log(`🔄 Replaced ${oldCount} → ${processedRecords.length} ${csvCategory} rows`);
    console.log('🎉 Single CSV update completed successfully!');
    
  } catch (error) {
    console.error('❌ Error updating CSV:', error.message);
    process.exit(1);
  }
}

// Get CSV file path from command line arguments
const csvFilePath = process.argv[2];

if (!csvFilePath) {
  console.error('❌ Please provide the CSV file path as an argument');
  console.error('Usage: node scripts/update-one-csv.mjs "/absolute/path/to/file.csv"');
  process.exit(1);
}

// Run the update
updateOneCSV(csvFilePath);
