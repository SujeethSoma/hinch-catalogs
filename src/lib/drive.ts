import { CatalogItem } from './categories';

export function extractDriveId(url: string): string {
    if (!url) return "";
    const m1 = url.match(/\/file\/d\/([\w-]+)/);
    if (m1) return m1[1];
    const m2 = url.match(/[?&]id=([\w-]+)/);
    if (m2) return m2[1];
    const m3 = url.match(/[-\w]{25,}/);
    return m3 ? m3[0] : "";
  }
  export function previewUrl(url: string): string {
    const id = extractDriveId(url);
    return id ? `https://drive.google.com/file/d/${id}/preview` : url;
  }
  export function downloadUrl(url: string): string {
    const id = extractDriveId(url);
    return id ? `https://drive.google.com/uc?export=download&id=${id}` : url;
  }
  export function thumbUrl(url: string): string | null {
    const id = extractDriveId(url);
    return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w1000` : null;
  }

export async function loadCatalogData(): Promise<CatalogItem[]> {
  try {
    const response = await fetch('/data/catalogs.json');
    const data = await response.json();
    
    // Return items as-is, no normalization
    return data.data;
  } catch (error) {
    console.error('Error loading catalog data:', error);
    return [];
  }
}
  