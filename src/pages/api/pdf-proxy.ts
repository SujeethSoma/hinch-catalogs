import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const url = req.query.url;
    if (!url || typeof url !== 'string') {
      res.status(400).json({ message: 'Missing url param' });
      return;
    }
    if (!/^https?:\/\//i.test(url)) {
      res.status(400).json({ message: 'Only http/https urls allowed' });
      return;
    }
    const r = await fetch(url, { headers: { 'User-Agent': 'HinchaCatalogPreview/1.0' } });
    if (!r.ok) {
      res.status(502).json({ message: `Upstream error ${r.status}` });
      return;
    }
    const ab = await r.arrayBuffer();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
    res.status(200).send(Buffer.from(ab));
  } catch (e: any) {
    res.status(500).json({ message: e?.message || 'proxy error' });
  }
}
