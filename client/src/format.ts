/** API dátum -> megjelenítés YYYY-MM-DD formában (pl. "2023-01-31"). */
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${year}-${month}-${day}`;
}

/** Érvényes, létező YYYY-MM-DD dátum-e (pl. 2023-02-30 nem az). */
export function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}
