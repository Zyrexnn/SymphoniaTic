export function normalizeTicketScanPayload(rawText: string): string {
  const trimmed = rawText.trim();
  if (!trimmed) return '';

  let candidate = trimmed;

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      const codeQuery = parsed.searchParams.get('code');
      const seatQuery = parsed.searchParams.get('seat')?.trim().toUpperCase() || '';

      if (codeQuery) {
        candidate = codeQuery.trim();
      } else {
        const segments = parsed.pathname.split('/').filter(Boolean);
        const ticketIdx = segments.findIndex((seg) => seg.toLowerCase() === 'ticket');
        if (ticketIdx >= 0 && segments[ticketIdx + 1]) {
          candidate = decodeURIComponent(segments[ticketIdx + 1]).trim();
        } else if (segments.length > 0) {
          candidate = decodeURIComponent(segments[segments.length - 1]).trim();
        }
      }

      candidate = candidate.replace(/^QR-/i, '').toUpperCase();
      if (seatQuery && !candidate.endsWith(`-${seatQuery}`)) {
        candidate = `${candidate}-${seatQuery}`;
      }
      return candidate;
    } catch {
      // Fallback ke sanitasi string langsung jika URL tidak valid
    }
  }

  return candidate.replace(/^QR-/i, '').toUpperCase();
}
