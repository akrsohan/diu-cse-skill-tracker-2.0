/**
 * Smart helper to extract the main calling name from a full name,
 * intelligently handling prefixes like "Md.", "Md", "Mohammad", "Mst.", etc.
 */
export function getMainName(fullName: string | undefined | null): string {
  if (!fullName) return 'Learner';
  const trimmed = fullName.trim();
  if (!trimmed) return 'Learner';

  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return parts[0];

  const prefixes = new Set([
    'md.', 'md', 'mohammad', 'mohammed', 'muhammad', 
    'mst.', 'mst', 'most.', 'most', 'dr.', 'dr', 
    'mr.', 'mr', 'mrs.', 'mrs', 'ms.', 'ms', 
    'sk.', 'sk', 'syed', 'sheikh', 'kazi', 'al'
  ]);

  // If first word is a common prefix/title (e.g. "Md." or "Mohammad"), return the second word (e.g. "Sohan")
  if (prefixes.has(parts[0].toLowerCase()) && parts.length > 1) {
    // If the second word is also a prefix or initials (e.g. "Md. A. Sohan"), look for the next valid part
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      if (!prefixes.has(part.toLowerCase()) && part.length > 1) {
        return part;
      }
    }
    return parts[1];
  }

  // Otherwise return the first name (e.g. "Sohan" from "Sohan Ali")
  return parts[0];
}

/**
 * Returns either the main calling name or the full name cleanly
 */
export function getFriendlyName(fullName: string | undefined | null): string {
  return getMainName(fullName);
}
