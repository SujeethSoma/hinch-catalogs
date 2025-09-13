import { toDriveDirectPdf } from '@/lib/drive';
let _pdfjs: any;

async function ensurePdfjs() {
  if (_pdfjs) return _pdfjs;
  const pdfjsLib = await import('pdfjs-dist');
  // @ts-ignore
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  _pdfjs = pdfjsLib;
  return _pdfjs;
}

export async function getPdfFirstPageDataUrl(pdfUrl: string, maxW = 300): Promise<string | null> {
  if (!pdfUrl) return null;

  // Normalize Drive viewer URLs → direct bytes
  const normalized = toDriveDirectPdf(pdfUrl);
  const key = `pdf:thumb:${normalized}`;
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(key);
    if (cached) return cached;
  }

  try {
    const proxyUrl = `/api/pdf-proxy?url=${encodeURIComponent(normalized)}`;
    const res = await fetch(proxyUrl);
    if (!res.ok) throw new Error(`proxy ${res.status}`);

    const buf = await res.arrayBuffer();
    const pdfjs = await ensurePdfjs();
    const doc = await pdfjs.getDocument({ data: new Uint8Array(buf) }).promise;
    const page = await doc.getPage(1);

    const base = page.getViewport({ scale: 1 });
    const scale = Math.min(maxW / base.width, 2);
    const vp = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(vp.width);
    canvas.height = Math.ceil(vp.height);
    const ctx = canvas.getContext('2d')!;
    await page.render({ canvasContext: ctx, viewport: vp }).promise;

    const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
    if (typeof window !== 'undefined') localStorage.setItem(key, dataUrl);
    return dataUrl;
  } catch (e) {
    console.error('PDF thumbnail generation failed:', e);
    console.error('PDF URL:', pdfUrl);
    console.error('Normalized URL:', normalized);
    return null;
  }
}
