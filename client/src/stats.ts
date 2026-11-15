function present(values: (number | null)[]): number[] {
  return values.filter((v): v is number => v !== null && Number.isFinite(v));
}

export function median(values: (number | null)[]): number | null {
  const sorted = present(values).sort((a, b) => a - b);
  if (sorted.length === 0) return null;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/**
 * A leggyakoribb érték(ek), növekvő sorrendben. Ha minden érték csak egyszer
 * fordul elő (és több érték van), nincs módusz: üres tömb.
 */
export function mode(values: (number | null)[]): number[] {
  const nums = present(values);
  if (nums.length === 0) return [];

  // 2 tizedesre kerekítve számolunk, hogy a lebegőpontos zaj ne zavarjon be.
  const counts = new Map<number, number>();
  for (const v of nums) {
    const key = Math.round(v * 100);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const maxCount = Math.max(...counts.values());
  if (maxCount === 1 && nums.length > 1) return [];

  return [...counts.entries()]
    .filter(([, count]) => count === maxCount)
    .map(([key]) => key / 100)
    .sort((a, b) => a - b);
}
