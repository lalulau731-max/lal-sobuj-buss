/**
 * Date Utility: Strict Date-Month-Year (DD-MM-YYYY) formatting everywhere
 */

export function formatDateDMY(dateInput?: string | number | Date | null): string {
  if (!dateInput) return '';

  try {
    // If it's a string like "2026-10-05" or "2026-10-05T00:00:00.000Z"
    if (typeof dateInput === 'string') {
      const cleanStr = dateInput.trim();
      if (cleanStr.includes('-')) {
        const parts = cleanStr.split('T')[0].split('-');
        if (parts.length === 3) {
          // If in YYYY-MM-DD format
          if (parts[0].length === 4) {
            const [y, m, d] = parts;
            return `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${y}`;
          }
          // If already in DD-MM-YYYY format
          if (parts[2].length === 4) {
            return `${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}-${parts[2]}`;
          }
        }
      }
    }

    const dt = new Date(dateInput);
    if (!isNaN(dt.getTime())) {
      const day = String(dt.getDate()).padStart(2, '0');
      const month = String(dt.getMonth() + 1).padStart(2, '0');
      const year = dt.getFullYear();
      return `${day}-${month}-${year}`;
    }
  } catch (e) {
    console.warn('formatDateDMY error:', e);
  }

  return String(dateInput);
}

/**
 * Returns Date-Month-Year with Day name, e.g. "05-10-2026 (Monday)"
 */
export function formatDateDMYWithDay(dateInput?: string | number | Date | null): string {
  if (!dateInput) return '';

  try {
    let dt: Date;
    if (typeof dateInput === 'string' && dateInput.includes('-')) {
      const parts = dateInput.split('T')[0].split('-');
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        dt = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      } else {
        dt = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      }
    } else {
      dt = new Date(dateInput);
    }

    if (!isNaN(dt.getTime())) {
      const day = String(dt.getDate()).padStart(2, '0');
      const month = String(dt.getMonth() + 1).padStart(2, '0');
      const year = dt.getFullYear();
      const dayName = dt.toLocaleDateString('en-US', { weekday: 'long' });
      return `${day}-${month}-${year} (${dayName})`;
    }
  } catch (e) {
    console.warn('formatDateDMYWithDay error:', e);
  }

  return formatDateDMY(dateInput);
}

/**
 * Converts any date format back to YYYY-MM-DD strictly for HTML <input type="date"> value
 */
export function toHTMLDateInputValue(dateInput?: string | null): string {
  if (!dateInput) {
    return new Date().toISOString().split('T')[0];
  }
  try {
    if (dateInput.includes('-')) {
      const parts = dateInput.split('T')[0].split('-');
      if (parts[0].length === 4) {
        return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      }
      if (parts[2].length === 4) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
  } catch (e) {}
  return dateInput;
}
