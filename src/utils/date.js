/**
 * Date and time formatting utilities with accurate timezone normalization.
 */

/**
 * Safely parse date strings into JavaScript Date objects.
 * Handles:
 * - Standard ISO-8601 strings (e.g., '2026-09-15T17:13:20.000Z')
 * - SQLite timestamps stored in UTC without timezone (e.g., '2026-09-15 17:13:20' or '2026-09-15T17:13:20')
 * - Unix millisecond timestamps or Date instances
 */
export function parseDateSafe(dateInput) {
  if (!dateInput) return null;
  if (dateInput instanceof Date) return isNaN(dateInput.getTime()) ? null : dateInput;

  if (typeof dateInput === 'number') {
    const d = new Date(dateInput);
    return isNaN(d.getTime()) ? null : d;
  }

  let str = String(dateInput).trim();
  if (!str) return null;

  // If format is "YYYY-MM-DD HH:MM:SS" or "YYYY-MM-DD HH:MM:SS.sss" (from SQLite / UTC)
  // without 'Z' or timezone offset (+XX:XX or -XX:XX):
  if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}/.test(str) && !str.includes('Z') && !/[+-]\d{2}:?\d{2}$/.test(str)) {
    // Normalize space to 'T' and append 'Z' so browsers parse as true UTC
    str = str.replace(' ', 'T') + 'Z';
  }

  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return d;
  }

  const fallback = new Date(dateInput);
  return isNaN(fallback.getTime()) ? null : fallback;
}

/**
 * Format relative time in real-time (e.g. "just now", "1 minute ago", "5 minutes ago", etc.)
 */
export function formatRelativeTime(dateInput) {
  const d = parseDateSafe(dateInput);
  if (!d) return '';

  const now = new Date();
  // Difference in seconds
  const diffSecs = Math.floor((now.getTime() - d.getTime()) / 1000);

  // If posted within the last 45 seconds or slight clock drift (future up to a few seconds):
  if (diffSecs < 45) {
    return 'just now';
  }

  const diffMins = Math.floor(diffSecs / 60);
  if (diffMins < 60) {
    return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
  }

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  }

  return formatDate(dateInput);
}

/**
 * Format calendar date (e.g. "September 15, 2026")
 */
export function formatDate(dateInput) {
  const d = parseDateSafe(dateInput);
  if (!d) return '';
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}
