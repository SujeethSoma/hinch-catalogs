#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const catalogsPath = path.join(process.cwd(), 'src/data/catalogs.json');
const backupPath = catalogsPath.replace('.json', '.backup.json');

console.log('🔍 Loading backup data...');
const originalData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

console.log(`📊 Original count: ${originalData.length} catalogs`);

// The issue is that some brands appear in both "Solid Colour Laminates" and "Decorative Laminates"
// We need to differentiate them properly. Let's check what the intended categorization should be.

// Group by name and link to see duplicates
const groupedByKey = new Map();
originalData.forEach((catalog, index) => {
  const name = catalog["Catalogues Name"] || catalog["Catalogues name"] || '';
  const link = catalog["Catalogues Links"] || catalog["Catalouge links"] || '';
  const key = `${name.toLowerCase().trim()}|${link}`;
  
  if (!groupedByKey.has(key)) {
    groupedByKey.set(key, []);
  }
  groupedByKey.get(key).push({ ...catalog, originalIndex: index });
});

console.log('\n🔍 Analyzing potential duplicates...');

// Find entries that appear in multiple categories
const multiCategoryEntries = [];
groupedByKey.forEach((entries, key) => {
  if (entries.length > 1) {
    const categories = entries.map(e => e.Category || e.category);
    const uniqueCategories = [...new Set(categories)];
    
    if (uniqueCategories.length > 1) {
      multiCategoryEntries.push({
        key,
        entries,
        categories: uniqueCategories
      });
    }
  }
});

console.log(`Found ${multiCategoryEntries.length} entries that appear in multiple categories:`);

multiCategoryEntries.forEach(({ key, entries, categories }) => {
  const [name] = key.split('|');
  console.log(`\n📋 "${name}" appears in: ${categories.join(', ')}`);
  
  entries.forEach(entry => {
    const category = entry.Category || entry.category;
    const source = entry.__source;
    console.log(`  - ${category} (${source})`);
  });
});

// For now, let's restore the original data and implement a different approach
// We'll keep all entries but ensure they have unique identifiers
console.log('\n🔄 Restoring original data and adding unique identifiers...');

const fixedData = originalData.map((catalog, index) => {
  const name = catalog["Catalogues Name"] || catalog["Catalogues name"] || '';
  const category = catalog.Category || catalog.category || '';
  const brand = catalog.Brand || catalog.Brands || '';
  
  // Create a unique identifier that includes category
  const uniqueId = `${name}-${category}-${index}`;
  
  return {
    ...catalog,
    uniqueId,
    // Ensure we have consistent field names
    name: name,
    category: category,
    brand: brand,
    driveLink: catalog["Catalogues Links"] || catalog["Catalouge links"] || ''
  };
});

// Write the fixed data
fs.writeFileSync(catalogsPath, JSON.stringify(fixedData, null, 2));
console.log(`✨ Updated catalogs.json with ${fixedData.length} entries`);

// Show category distribution
const categoryCounts = {};
fixedData.forEach(catalog => {
  const category = catalog.category || 'Unknown';
  categoryCounts[category] = (categoryCounts[category] || 0) + 1;
});

console.log('\n📊 Category distribution:');
Object.entries(categoryCounts)
  .sort(([,a], [,b]) => b - a)
  .forEach(([category, count]) => {
    console.log(`  ${category}: ${count} catalogs`);
  });

console.log('\n💡 The issue was that some brands legitimately appear in multiple categories.');
console.log('   For example, "Alimo" produces both Solid Colour Laminates and Decorative Laminates.');
console.log('   These should be treated as separate products, not duplicates.');

