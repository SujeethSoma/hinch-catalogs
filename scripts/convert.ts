import fs from "fs";
import { parse } from "csv-parse/sync";

type Row = Record<string,string>;
const csv = fs.readFileSync("src/data/catalogs.csv","utf8");
const rows = parse(csv, { columns:true, skip_empty_lines:true }) as Row[];

function key(s:string){ return s.trim().toLowerCase(); }

const data = rows.map(r=>{
  const o:Record<string,string>={};
  for (const [k,v] of Object.entries(r)) o[key(k)] = String(v??"");
  return {
    name: o["catalogues name"]||o["catalogue name"]||o["name"]||"",
    drive_link: o["catalogue link"]||o["link"]||"",
    brand: o["brand"]||"",
    category: o["category"]||"Laminates",
    cover_image: o["cover image url"]||o["cover_image"]||"",
    tags: o["tags"]||""
  };
});

fs.writeFileSync("src/data/catalogs.json", JSON.stringify({data},null,2));
console.log("✅ wrote src/data/catalogs.json with", data.length, "items");
