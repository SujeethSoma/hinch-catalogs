#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

async function transformCSVData() {
  try {
    console.log('🔄 Transforming CSV data to match CatalogItem interface...');
    
    // Read the raw CSV data
    const csvDataPath = path.join(process.cwd(), 'src', 'data', 'catalogs.json');
    const rawData = JSON.parse(await fs.readFile(csvDataPath, 'utf-8'));
    
    console.log(`📊 Processing ${rawData.length} records...`);
    
    // Transform each record to match CatalogItem interface
    const transformedData = rawData.map((item, index) => {
      // Extract catalog name (handle different possible field names)
      const catalogName = item['﻿Catalogues Name'] || item['Catalogues Name'] || item['Catalogue Name'] || `Catalog ${index + 1}`;
      
      // Extract drive link (handle different possible field names)
      const driveLink = item['Catalouge links'] || item['Catalogue links'] || item['Drive Link'] || item['Link'] || '';
      
      // Extract category
      const category = item['Category'] || 'Uncategorized';
      
      // Extract brand
      const brand = item['Brand'] || '';
      
      // Generate file ID from drive link
      const fileId = extractFileIdFromDriveLink(driveLink);
      
      // Generate preview and download URLs
      const previewUrl = fileId ? `https://drive.google.com/file/d/${fileId}/preview` : '';
      const downloadUrl = fileId ? `https://drive.google.com/uc?export=download&id=${fileId}` : '';
      
      // Generate thumbnail URL (placeholder for now)
      const thumbnailUrl = '/placeholder.png';
      
      // Create category key (normalized)
      const categoryKey = category.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      return {
        name: catalogName,
        driveLink: driveLink,
        category: category,
        brand: brand || undefined,
        categoryKey: categoryKey,
        previewUrl: previewUrl,
        downloadUrl: downloadUrl,
        thumbnailUrl: thumbnailUrl,
        fileId: fileId,
        sourceCsv: item.__source || 'unknown'
      };
    });
    
    // Filter out items without valid drive links
    const validData = transformedData.filter(item => item.driveLink && item.driveLink.includes('drive.google.com'));
    
    console.log(`✅ Transformed ${validData.length} valid records (filtered out ${transformedData.length - validData.length} invalid entries)`);
    
    // Show category breakdown
    const categoryCounts = {};
    validData.forEach(item => {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    });
    
    console.log('\n📈 Category breakdown:');
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} catalogs`);
    });
    
    // Save transformed data
    const outputPath = path.join(process.cwd(), 'src', 'data', 'catalogs-transformed.json');
    await fs.writeFile(outputPath, JSON.stringify(validData, null, 2));
    
    console.log(`💾 Transformed data saved to: ${outputPath}`);
    console.log('🎉 Data transformation completed successfully!');
    
  } catch (error) {
    console.error('❌ Error transforming CSV data:', error.message);
    process.exit(1);
  }
}

function extractFileIdFromDriveLink(url) {
  if (!url || typeof url !== 'string') return '';
  
  // Handle different Google Drive URL formats
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9-_]+)/,  // Standard format
    /id=([a-zA-Z0-9-_]+)/,          // Alternative format
    /\/d\/([a-zA-Z0-9-_]+)/         // Short format
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return '';
}

// Run the transformation
transformCSVData();
