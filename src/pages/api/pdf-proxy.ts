import type { NextApiRequest, NextApiResponse } from 'next';
import { toDriveDirectPdf } from '@/lib/drive';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const q = req.query.url;
    if (!q || typeof q !== 'string') return res.status(400).json({ message: 'Missing url param' });

    let url = q;
    if (!/^https?:\/\//i.test(url)) return res.status(400).json({ message: 'Only http/https urls allowed' });

    // Normalize Google Drive "viewer" links to direct PDF bytes
    try { url = toDriveDirectPdf(url); } catch {}

    const r = await fetch(url, { headers: { 'User-Agent': 'HinchaCatalogPreview/1.0' } });
    if (!r.ok) return res.status(502).json({ message: `Upstream error ${r.status}` });

    const ct = r.headers.get('content-type') || '';
    if (!ct.toLowerCase().startsWith('application/pdf')) {
      // prevent feeding HTML to pdf.js
      const text = await r.text().catch(() => '');
      return res.status(502).json({ message: 'Not a PDF', contentType: ct, len: text.length });
    }

    const ab = await r.arrayBuffer();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
    res.status(200).send(Buffer.from(ab));
  } catch (e: any) {
    res.status(500).json({ message: e?.message || 'proxy error' });
  }
}
