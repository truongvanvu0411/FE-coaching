function bigrams(text: string): Set<string> {
  const normalized = text.replace(/\s+/g, "");
  const set = new Set<string>();
  for (let i = 0; i < normalized.length - 1; i++) {
    set.add(normalized.slice(i, i + 2));
  }
  return set;
}

/** Dice coefficient over character bigrams — cheap, dependency-free, works
 * reasonably on Japanese text where whitespace tokenization doesn't apply. */
export function diceSimilarity(a: string, b: string): number {
  const setA = bigrams(a);
  const setB = bigrams(b);
  if (setA.size === 0 || setB.size === 0) return 0;

  let overlap = 0;
  for (const gram of setA) {
    if (setB.has(gram)) overlap++;
  }
  return (2 * overlap) / (setA.size + setB.size);
}
