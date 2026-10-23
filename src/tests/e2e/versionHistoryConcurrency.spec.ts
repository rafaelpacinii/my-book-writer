import { test, expect } from "@/tests/e2e/fixtures";
import { mockUI } from "@/tests/e2e/uiMock";
import { book, chapter } from "@/tests/fixtures/book";
import { serializeChapterText } from "@/utils/chapterContent";

test("a slow version response cannot replace a newer selection", async ({ page }) => {
  await mockUI(page);
  await page.addInitScript(({ book, chapter, contents }) => {
    const runtime = window as unknown as {
      historyCompleted: string[];
      historyStarted: string[];
      __TAURI_INTERNALS__: { invoke: (command: string, args?: Record<string, unknown>) => Promise<unknown> };
    };
    const original = runtime.__TAURI_INTERNALS__.invoke;
    runtime.historyCompleted = [];
    runtime.historyStarted = [];
    const versions = [3, 2, 1].map((number) => ({
      id: `v${number}`, chapter_id: chapter.id, version_number: number, title: chapter.title,
      content_json: contents[number - 1], description: null, word_count: 3, created_at: "2026-10-23 12:00:00",
    }));
    runtime.__TAURI_INTERNALS__.invoke = async (command, args) => {
      if (command === "get_book_by_id") return book;
      if (command === "get_chapter_by_id") return chapter;
      if (command === "list_chapter_versions") return versions;
      if (command === "get_chapter_version") {
        runtime.historyStarted.push(String(args?.versionId));
        if (args?.versionId === "v2") await new Promise((resolve) => setTimeout(resolve, 600));
        runtime.historyCompleted.push(String(args?.versionId));
        return versions.find((v) => v.id === args?.versionId) ?? null;
      }
      return original(command, args);
    };
  }, { book, chapter, contents: [1, 2, 3].map((number) => serializeChapterText(`Texto versão ${number}`)) });
  await page.goto(`/books/versions?bookId=${book.id}&chapterId=${chapter.id}&versionId=v1`);
  const second = page.getByRole("button", { name: "Abrir versão #2", exact: true });
  const first = page.getByRole("button", { name: "Abrir versão #1", exact: true });
  await expect(first).toHaveAttribute("aria-pressed", "true");
  await second.click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { historyStarted: string[] }).historyStarted.includes("v2"))).toBe(true);
  await first.click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { historyCompleted: string[] }).historyCompleted.includes("v2"))).toBe(true);
  await expect(first).toHaveAttribute("aria-pressed", "true");
  await expect(page).toHaveURL(/versionId=v1/);
});

test("automatic checkpoints continue after typing stops and tracking survives reload", async ({ page }) => {
  await page.addInitScript(() => {
    const stored = localStorage.getItem("my_book_writer_chapters");
    const chapters = stored ? JSON.parse(stored) : [];
    if (!sessionStorage.getItem("checkpoint-seeded")) {
      chapters[0].content_json = JSON.stringify({ text: "Antes" });
      localStorage.setItem("my_book_writer_chapters", JSON.stringify(chapters));
      sessionStorage.setItem("checkpoint-seeded", "true");
    }
  });
  await page.clock.install({ time: new Date("2026-10-23T12:00:00Z") });
  await page.goto(`/books/editor?bookId=${book.id}&chapterId=${chapter.id}`);
  await page.getByRole("button", { name: "Abrir histórico de versões", exact: true }).click();
  const tracking = page.getByRole("switch", { name: "Rastrear alterações", exact: true });
  await tracking.click();
  await expect(tracking).toHaveAttribute("aria-checked", "true");
  await page.locator("[contenteditable=true]").fill("Pequena mudança depois");
  await page.clock.runFor(4_000);
  await expect(page.getByRole("button", { name: "Abrir versão #1", exact: true })).toBeVisible();
  await page.clock.fastForward(180_000);
  await expect(page.getByRole("button", { name: "Abrir versão #2", exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Abrir histórico de versões", exact: true }).click();
  await expect(tracking).toHaveAttribute("aria-checked", "true");
});
