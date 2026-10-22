/** A book keeps its cover palette when the collection is filtered or reordered. */
export function bookCoverVariant(bookId: string): number {
  let hash = 0;
  for (const character of bookId) hash = (hash * 31 + character.charCodeAt(0)) | 0;
  return (hash >>> 0) % 6;
}
