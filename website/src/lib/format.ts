// dates are stored as YYYY-MM-DD and formatted by hand, so the prerendered HTML and
// the browser always print the same thing (no time zones, no locale surprises)

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2026-07-30" → "Jul 30, 2026" */
export function fmtDate(iso: string): string {
    const [y, m, d] = iso.split('-').map(Number);
    return `${MONTHS[m - 1]} ${d}, ${y}`;
}

/** a Google Maps directions link to an address */
export function directionsHref(address: string): string {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}

/** "1 program", "26 programs" */
export function plural(n: number, word: string, many = `${word}s`): string {
    return `${n} ${n === 1 ? word : many}`;
}
