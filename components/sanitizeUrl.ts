/** Allow only http: and https: scheme URLs to prevent javascript: XSS. */
export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return url;
    }
  } catch {
    // invalid URL – fall through to safe fallback
  }
  return '#';
}
