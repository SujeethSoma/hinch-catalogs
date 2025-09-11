#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { parse } from 'csv-parse/sync';
import pkg from 'fast-glob';
const { glob } = pkg;

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
        
        // Add source field to each record
        const sourceName = path.basename(csvFile, '.csv');
        const recordsWithSource = records.map(record => ({
          ...record,
          __source: sourceName
        }));
        
        allData.push(...recordsWithSource);
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
