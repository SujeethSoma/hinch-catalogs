import { promises as fs } from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

type Row = Record<string, string>;

type DecorativeLaminatesItem = {
  name: string;
  brand: string;
  category: string;
  categoryKey: string;
  driveLink: string;
  previewUrl: string;
  downloadUrl: string;
  thumbnailUrl: string;
  fileId: string;
  sourceCsv: string;
};

const ROOT = process.cwd();
const CSV_FILE = path.join(ROOT, "..", "Decorative Laminates.csv");
const OUT_FILE = path.join(ROOT, "src", "data", "decorative-laminates.json");

// --- helpers ---
function norm(s: any): string {
  return String(s ?? "").trim().replace(/\s+/g, " ");
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function keyOfCategory(cat: string): string {
  return norm(cat).toLowerCase().replace(/\s+/g, "-");
}

function extractFileId(url: string): string {
  const u = norm(url);
  if (!u) return "";

  // /file/d/<id>/
  let m = u.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (m?.[1]) return m[1];

  // ?id=<id>
  m = u.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m?.[1]) return m[1];

  return "";
}

async function ensureDir() {
  const dir = path.dirname(OUT_FILE);
  await fs.mkdir(dir, { recursive: true });
}

(async () => {
  try {
    await ensureDir();

    // Check if CSV file exists
    try {
      await fs.access(CSV_FILE);
    } catch {
      console.error(`CSV file not found: ${CSV_FILE}`);
      process.exit(1);
    }

    // Read and parse CSV
    const buf = await fs.readFile(CSV_FILE);
    const records: Row[] = parse(buf, {
      columns: true,
      skip_empty_lines: true
    });

    const items: DecorativeLaminatesItem[] = [];
    let processed = 0;
    let skipped = 0;

    for (const rec of records) {
      processed++;

      const name = norm(rec["Catalogues Name "]);
      const driveLink = norm(rec["Catalogues Links"]);
      const brand = norm(rec["Brands"]);

      if (!name || !driveLink) {
        console.warn(`Skipping row ${processed}: missing name or drive link`);
        skipped++;
        continue;
      }

      const fileId = extractFileId(driveLink);
      if (!fileId) {
        console.warn(`Skipping row ${processed}: no fileId found in "${driveLink}"`);
        skipped++;
        continue;
      }

      const category = "Decorative Laminates";
      const categoryKey = keyOfCategory(category);
      const previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;
      const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
      const thumbnailUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w780`;

      items.push({
        name,
        brand,
        category,
        categoryKey,
        driveLink,
        previewUrl,
        downloadUrl,
        thumbnailUrl,
        fileId,
        sourceCsv: "Decorative Laminates.csv"
      });
    }

    // Sort by name
    items.sort((a, b) => a.name.localeCompare(b.name));

    // Write JSON file
    await fs.writeFile(OUT_FILE, JSON.stringify(items, null, 2), "utf8");

    // Summary
    console.log("---- Decorative Laminates Import Summary ----");
    console.log(`CSV file:        ${CSV_FILE}`);
    console.log(`Output file:     ${OUT_FILE}`);
    console.log(`Rows processed:  ${processed}`);
    console.log(`Items created:   ${items.length}`);
    console.log(`Rows skipped:    ${skipped}`);
    console.log(`Categories:      Decorative Laminates (${items.length} items)`);
    console.log(`Brands:          ${[...new Set(items.map(i => i.brand))].length} unique brands`);
    console.log("✅ Import completed successfully!");

  } catch (error) {
    console.error("❌ Import failed:", error);
    process.exit(1);
  }
})();
