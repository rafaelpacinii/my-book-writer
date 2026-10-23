import type { Chapter } from "@/types/chapter";

const CHAPTERS = "my_book_writer_chapters";

function chapters(): Chapter[] {
  let value: unknown;
  try { value = JSON.parse(localStorage.getItem(CHAPTERS) ?? "[]"); }
  catch { throw new Error("Não foi possível ler os capítulos locais. Seus dados foram preservados."); }
  if (!Array.isArray(value)) throw new Error("Não foi possível ler os capítulos locais. Seus dados foram preservados.");
  return value as Chapter[];
}

export function storedChapter(id: string): Chapter {
  const chapter = chapters().find((c) => c && c.id === id && !c.deleted_at);
  if (!chapter) throw new Error("Capítulo não encontrado.");
  return chapter;
}

export function storeChapter(chapter: Chapter): void {
  localStorage.setItem(CHAPTERS, JSON.stringify(chapters().map((c) => c.id === chapter.id ? chapter : c)));
}
