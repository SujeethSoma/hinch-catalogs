export function extractDriveFileId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname !== 'drive.google.com') return null;

    // Patterns:
    // 1) /file/d/<id>/view
    const m1 = u.pathname.match(/\/file\/d\/([^/]+)\//);
    if (m1?.[1]) return m1[1];

    // 2) open?id=<id>
    const id = u.searchParams.get('id');
    if (id) return id;

    return null;
  } catch { return null; }
}

export function toDriveDirectPdf(url: string): string {
  const id = extractDriveFileId(url);
  return id ? `https://drive.google.com/uc?export=download&id=${id}` : url;
}