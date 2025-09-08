import { promises as fs } from "fs";
import path from "path";
import fg from "fast-glob";
import { parse } from "csv-parse/sync";

type Row = Record<string, string>;

type Item = {
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
const CSV_DIR = path.join(ROOT, "..", "Catalogue links CSV Export");
const OUT_DIR = path.join(ROOT, "src", "data");
const BY_CAT_DIR = path.join(OUT_DIR, "by-category");

// --- helpers ---
function norm(s: any): string {
  return String(s ?? "").trim().replace(/\s+/g, " ");
}

function keyOfCategory(cat: string): string {
  return norm(cat).toLowerCase().replace(/\s+/g, "-");
}

function getHeader(row: Row, ...names: string[]): string {
  for (const n of names) {
    const hit = Object.keys(row).find(
      (k) => k.toLowerCase() === n.toLowerCase()
    );
    if (hit) return hit;
  }
  return "";
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

async function ensureDirs() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.mkdir(BY_CAT_DIR, { recursive: true });
}

function dedupe(items: Item[]): Item[] {
  const seen = new Set<string>();
  const out: Item[] = [];
  for (const it of items) {
    const key = `${it.name}||${it.brand}||${it.fileId}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push(it);
    }
  }
  return out;
}

(async () => {
  await ensureDirs();

  const csvFiles = await fg(["*.csv"], { cwd: CSV_DIR, absolute: true, dot: false });
  if (!csvFiles.length) {
    console.warn(`No CSV files found in: ${CSV_DIR}`);
    process.exit(0);
  }

  const all: Item[] = [];
  let totalRows = 0;
  let skipped = 0;

  for (const file of csvFiles) {
    const csvName = path.basename(file);
    const fallbackCategory = norm(csvName.replace(/\.csv$/i, ""));

    const buf = await fs.readFile(file);
    const records: Row[] = parse(buf, {
      columns: true,
      skip_empty_lines: true
    });

    for (const rec of records) {
      totalRows++;

      const nameH = getHeader(rec, "Catalogues Name", "Catalogue Name", "Name");
      const linkH = getHeader(rec, "Catalogues Links", "Catalouge links", "Catalogue Links", "Link", "URL");
      const brandH = getHeader(rec, "Brands", "Brand");
      const catH = getHeader(rec, "Category");

      const name = norm(rec[nameH]);
      const driveLink = norm(rec[linkH]);
      const brand = norm(rec[brandH]);
      const category = norm(rec[catH]) || fallbackCategory;

      if (!name || !driveLink) {
        skipped++;
        continue;
      }

      const fileId = extractFileId(driveLink);
      if (!fileId) {
        console.warn(`WARN: No fileId (${csvName}) → "${name}"`);
        skipped++;
        continue;
      }

      const previewUrl   = `https://drive.google.com/file/d/${fileId}/preview`;
      const downloadUrl  = `https://drive.google.com/uc?export=download&id=${fileId}`;
      const thumbnailUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w780`;

      all.push({
        name,
        brand,
        category,
        categoryKey: keyOfCategory(category),
        driveLink,
        previewUrl,
        downloadUrl,
        thumbnailUrl,
        fileId,
        sourceCsv: csvName
      });
    }
  }

  const deduped = dedupe(all);

  // sort by category then name
  deduped.sort((a, b) =>
    a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
  );

  // write all
  await fs.writeFile(
    path.join(OUT_DIR, "catalogs.json"),
    JSON.stringify(deduped, null, 2),
    "utf8"
  );

  // by category
  const byCat = new Map<string, Item[]>();
  for (const item of deduped) {
    if (!byCat.has(item.categoryKey)) byCat.set(item.categoryKey, []);
    byCat.get(item.categoryKey)!.push(item);
  }

  for (const [key, arr] of byCat) {
    const file = path.join(BY_CAT_DIR, `${key}.json`);
    await fs.writeFile(file, JSON.stringify(arr, null, 2), "utf8");
  }

  // summary
  const catSummary = [...byCat.entries()]
    .map(([k, arr]) => `${k}=${arr.length}`)
    .join(", ");

  console.log("---- Import Summary ----");
  console.log(`CSV files:     ${csvFiles.length}`);
  console.log(`Rows parsed:   ${totalRows}`);
  console.log(`Rows kept:     ${deduped.length}`);
  console.log(`Rows skipped:  ${skipped}`);
  console.log(`Categories:    ${byCat.size}`);
  console.log(`Per-category:  ${catSummary}`);
  console.log(`Wrote:         src/data/catalogs.json`);
  console.log(`Wrote:         src/data/by-category/*.json`);
})();
