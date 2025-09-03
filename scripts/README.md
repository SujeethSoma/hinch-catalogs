# CSV Conversion Script

This script (`convert.ts`) automatically processes all CSV files in the `Data/` folder and combines them into a single JSON file.

## What it does

1. **Reads all CSV files** in the `Data/` folder that start with "Catalogue links -"
2. **Extracts category names** from filenames (e.g., "Catalogue links - Louvers.csv" → "Louvers")
3. **Parses CSV content** and handles different column name variations
4. **Combines all data** into a single JSON array
5. **Outputs** to `src/data/catalogs.json`

## CSV Structure Expected

Each CSV should have these columns (with flexible naming):
- **Name**: `Catalogues Name`, `Catalogues Name `, or `name`
- **Drive Link**: `Catalouge links`, `Catalogues Links`, `drive_link`, or `link`
- **Brand**: `Brands` or `brand` (optional)

## Usage

### Option 1: Using npm script (recommended)
```bash
npm run convert
```

### Option 2: Direct execution
```bash
npx tsx scripts/convert.ts
```

## Output

The script generates `src/data/catalogs.json` with this structure:

```json
{
  "data": [
    {
      "name": "Product Name",
      "drive_link": "https://drive.google.com/...",
      "category": "Category Name",
      "brand": "Brand Name" // optional
    }
  ]
}
```

## Categories Found

The script automatically detects these categories from your CSV files:
- 360 Louvers
- Acrylic Laminates (1)
- Decorative Laminates
- Liners
- Louvers
- Moulders
- PVC Laminates
- Ti Patti (1)
- Wall Panels

## Error Handling

- Skips CSV files that can't be read
- Filters out items with missing names or drive links
- Provides detailed logging of the conversion process
- Creates output directories if they don't exist

## Dependencies

- `csv-parse`: For parsing CSV files
- `tsx`: For running TypeScript files directly
- Built-in Node.js modules: `fs`, `path`
