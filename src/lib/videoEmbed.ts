/**
 * Returns the player URL to load in an <iframe> from an admin-provided embed code
 * (`<iframe src="...">` snippet or plain URL), or null if none is usable.
 *
 * The embed HTML itself is never injected into the page: only the iframe `src`
 * is kept, and only over https, so a pasted snippet cannot run scripts on the site.
 */
export function getEmbedSrc(embed: string | null | undefined): string | null {
  if (!embed) return null;

  const trimmed = embed.trim();
  const match = trimmed.match(/<iframe\b[^>]*?\ssrc\s*=\s*(["'])(.*?)\1/i);
  let candidate = (match ? match[2] : trimmed).replace(/&amp;/g, '&');
  if (candidate.startsWith('//')) candidate = `https:${candidate}`;

  try {
    const url = new URL(candidate);
    return url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
}
