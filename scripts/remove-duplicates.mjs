#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const catalogsPath = path.join(process.cwd(), 'src/data/catalogs.json');

console.log('🔍 Loading catalogs data...');
const catalogsData = JSON.parse(fs.readFileSync(catalogsPath, 'utf8'));

console.log(`📊 Original count: ${catalogsData.length} catalogs`);

// Track unique catalogs by name and link combination
const uniqueCatalogs = new Map();
const duplicates = [];

catalogsData.forEach((catalog, index) => {
  const name = catalog["Catalogues Name"] || catalog["Catalogues name"] || '';
  const link = catalog["Catalogues Links"] || catalog["Catalouge links"] || '';
  
  // Create a unique key based on name and link
  const key = `${name.toLowerCase().trim()}|${link}`;
  
  if (uniqueCatalogs.has(key)) {
    // This is a duplicate
    duplicates.push({
      index,
      name,
      category: catalog.Category || catalog.category,
      source: catalog.__source,
      existing: uniqueCatalogs.get(key)
    });
  } else {
    // First occurrence - store it
    uniqueCatalogs.set(key, {
      index,
      name,
      category: catalog.Category || catalog.category,
      source: catalog.__source,
      catalog
    });
  }
});

console.log(`🔄 Found ${duplicates.length} duplicate entries`);

// Show duplicates for review
if (duplicates.length > 0) {
  console.log('\n📋 Duplicate entries found:');
  duplicates.forEach(dup => {
    console.log(`  - "${dup.name}" in ${dup.category} (${dup.source})`);
    console.log(`    Duplicate of: "${dup.existing.name}" in ${dup.existing.category} (${dup.existing.source})`);
  });
}

// Remove duplicates by keeping only the first occurrence
const deduplicatedCatalogs = catalogsData.filter((catalog, index) => {
  const name = catalog["Catalogues Name"] || catalog["Catalogues name"] || '';
  const link = catalog["Catalogues Links"] || catalog["Catalouge links"] || '';
  const key = `${name.toLowerCase().trim()}|${link}`;
  
  // Keep only if this is the first occurrence
  const firstOccurrence = uniqueCatalogs.get(key);
  return firstOccurrence && firstOccurrence.index === index;
});

console.log(`✅ After deduplication: ${deduplicatedCatalogs.length} catalogs`);

// Create backup
const backupPath = catalogsPath.replace('.json', '.backup.json');
fs.writeFileSync(backupPath, JSON.stringify(catalogsData, null, 2));
console.log(`💾 Backup created: ${backupPath}`);

// Write deduplicated data
fs.writeFileSync(catalogsPath, JSON.stringify(deduplicatedCatalogs, null, 2));
console.log(`✨ Updated catalogs.json with deduplicated data`);

// Show category distribution
const categoryCounts = {};
deduplicatedCatalogs.forEach(catalog => {
  const category = catalog.Category || catalog.category || 'Unknown';
  categoryCounts[category] = (categoryCounts[category] || 0) + 1;
});

console.log('\n📊 Category distribution after deduplication:');
Object.entries(categoryCounts)
  .sort(([,a], [,b]) => b - a)
  .forEach(([category, count]) => {
    console.log(`  ${category}: ${count} catalogs`);
  });

