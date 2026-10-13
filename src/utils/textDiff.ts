import type { DiffPart } from "@/types/chapterVersion";

export interface IndexedDiffPart extends DiffPart {
  changeIndex?: number;
}

/**
 * Algoritmo Myers Diff simplificado para comparar duas sequências de palavras.
 * Retorna as partes marcadas como adicionadas, removidas ou inalteradas.
 */
export function computeWordDiff(oldText: string, newText: string): DiffPart[] {
  const oldWords = tokenize(oldText);
  const newWords = tokenize(newText);

  const n = oldWords.length;
  const m = newWords.length;

  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      if (oldWords[i] === newWords[j]) {
        dp[i + 1][j + 1] = dp[i][j] + 1;
      } else {
        dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  const parts: DiffPart[] = [];
  let i = n;
  let j = m;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldWords[i - 1] === newWords[j - 1]) {
      parts.unshift({ type: "unchanged", value: oldWords[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      parts.unshift({ type: "added", value: newWords[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      parts.unshift({ type: "removed", value: oldWords[i - 1] });
      i--;
    }
  }

  return groupConsecutiveDiffParts(parts);
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
