import type { DiffPart } from "@/types/chapterVersion";

export interface IndexedDiffPart extends DiffPart {
  changeIndex?: number;
}

/**
 * Algoritmo Myers Diff simplificado para comparar duas sequências de palavras.
 * Retorna as partes marcadas como adicionadas, removidas ou inalteradas.
 */
export function computeWordDiff(oldText: string, newText: string): DiffPart[] {
  const oldWords = tokenize(oldText), newWords = tokenize(newText);
  let prefix = 0, suffix = 0;
  while (prefix < Math.min(oldWords.length, newWords.length) && oldWords[prefix] === newWords[prefix]) prefix++;
  while (suffix < Math.min(oldWords.length, newWords.length) - prefix
    && oldWords[oldWords.length - 1 - suffix] === newWords[newWords.length - 1 - suffix]) suffix++;
  const before = oldWords.slice(prefix, oldWords.length - suffix);
  const after = newWords.slice(prefix, newWords.length - suffix);
  const changes = boundedMyers(before, after);
  return groupConsecutiveDiffParts([
    { type: "unchanged", value: oldWords.slice(0, prefix).join("") },
    ...changes,
    { type: "unchanged", value: oldWords.slice(oldWords.length - suffix).join("") },
  ].filter((part) => part.value) as DiffPart[]);
}

/** Bound work for entire manuscripts; retain exact text even for extensive rewrites. */
function boundedMyers(before: string[], after: string[]): DiffPart[] {
  const trace: Map<number, number>[] = [];
  const frontier = new Map<number, number>([[1, 0]]);
  let work = 0;
  for (let depth = 0; depth <= Math.min(before.length + after.length, 256); depth++) {
    trace.push(new Map(frontier));
    for (let diagonal = -depth; diagonal <= depth; diagonal += 2) {
      let x = diagonal === -depth || (diagonal !== depth && (frontier.get(diagonal - 1) ?? -1) < (frontier.get(diagonal + 1) ?? -1))
        ? frontier.get(diagonal + 1) ?? 0 : (frontier.get(diagonal - 1) ?? 0) + 1;
      let y = x - diagonal;
      while (x < before.length && y < after.length && before[x] === after[y]) { x++; y++; work++; }
      if (++work > 2_000_000) return replacement(before, after);
      frontier.set(diagonal, x);
      if (x >= before.length && y >= after.length) return backtrack(trace, before, after);
    }
  }
  return replacement(before, after);
}

function replacement(before: string[], after: string[]): DiffPart[] {
  return [{ type: "removed", value: before.join("") }, { type: "added", value: after.join("") }];
}

function backtrack(trace: Map<number, number>[], before: string[], after: string[]): DiffPart[] {
  let x = before.length, y = after.length;
  const reversed: DiffPart[] = [];
  for (let depth = trace.length - 1; depth >= 0; depth--) {
    const frontier = trace[depth], diagonal = x - y;
    const previousDiagonal = diagonal === -depth || (diagonal !== depth && (frontier.get(diagonal - 1) ?? -1) < (frontier.get(diagonal + 1) ?? -1))
      ? diagonal + 1 : diagonal - 1;
    const previousX = frontier.get(previousDiagonal) ?? 0, previousY = previousX - previousDiagonal;
    while (x > previousX && y > previousY) { reversed.push({ type: "unchanged", value: before[--x] }); y--; }
    if (depth > 0) {
      if (x === previousX) reversed.push({ type: "added", value: after[--y] });
      else reversed.push({ type: "removed", value: before[--x] });
    }
  }
  return reversed.reverse();
}

export function indexDiffChanges(parts: DiffPart[]): {
  parts: IndexedDiffPart[];
  totalChanges: number;
  additions: number;
  deletions: number;
} {
  let changeCount = 0;
  let additions = 0;
  let deletions = 0;

  const indexed: IndexedDiffPart[] = parts.map((part) => {
    if (part.type === "unchanged") return part;
    changeCount++;
    if (part.type === "added") additions++;
    if (part.type === "removed") deletions++;
    return { ...part, changeIndex: changeCount };
  });

  return { parts: indexed, totalChanges: changeCount, additions, deletions };
}

function tokenize(text: string): string[] {
  if (!text) return [];
  return text.match(/\s+|[^\s]+/g) || [];
}

function groupConsecutiveDiffParts(parts: DiffPart[]): DiffPart[] {
  if (parts.length === 0) return [];
  const grouped: DiffPart[] = [];
  let current = { ...parts[0] };

  for (let i = 1; i < parts.length; i++) {
    const next = parts[i];
    if (next.type === current.type) {
      current.value += next.value;
    } else {
      grouped.push(current);
      current = { ...next };
    }
  }
  grouped.push(current);
  return grouped;
}
