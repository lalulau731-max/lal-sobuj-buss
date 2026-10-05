/**
 * Date Formatter Utility for Lal Sabuj Paribahan
 * Enforces standard Date-Month-Year (DD-MM-YYYY) display across the software
 */

export function formatToDMY(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();
  
  // If already in DD-MM-YYYY format
  if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) {
    return trimmed;
  }

  // If in YYYY-MM-DD format (standard ISO date from datepicker / Firestore)
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split('-');
    return `${d}-${m}-${y}`;
  }

  // Fallback for Date objects or parseable strings
  try {
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    }
  } catch (e) {
    // ignore
  }

  return trimmed;
}

export function formatToVerboseDMY(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  try {
    let d: Date;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [y, m, day] = dateStr.split('-').map(Number);
      d = new Date(y, m - 1, day);
    } else if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
      const [day, m, y] = dateStr.split('-').map(Number);
      d = new Date(y, m - 1, day);
    } else {
      d = new Date(dateStr);
    }

    if (isNaN(d.getTime())) return formatToDMY(dateStr);

    const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const monthLong = d.toLocaleDateString('en-US', { month: 'long' });
    const year = d.getFullYear();

    // Standard Date-Month-Year with day of week
    return `${day}-${month}-${year} (${dayName})`;
  } catch {
    return formatToDMY(dateStr);
  }
}
