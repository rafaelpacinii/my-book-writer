import type { Page } from "@playwright/test";
import { test, expect } from "@/tests/e2e/fixtures";
import { book, chapter } from "@/tests/fixtures/book";
import type { CreateCommentInput, ReviewComment } from "@/types/review";

const second = { ...chapter, id: "review-second", title: "Segundo capítulo", position: 1 };
const url = `/books/editor?bookId=${book.id}&chapterId=${chapter.id}`;
const panel = (page: Page) => page.getByRole("complementary", { name: "Revisão do capítulo", exact: true });
const chapters = (page: Page) => page.getByRole("complementary").filter({ hasText: "Capítulos" });

interface AuditWindow {
  __TAURI_INTERNALS__: { invoke: (command: string, args: Record<string, unknown>) => Promise<unknown> };
  reviewAudit: { fail: boolean; releaseList?: () => void; releaseCreate?: () => void; releaseChapter?: () => void; saves: number };
}

async function setup(page: Page, mode: "list" | "create" | "error" | "chapter") {
  await page.addInitScript(({ chapter, second }) => {
    localStorage.setItem("my_book_writer_chapters", JSON.stringify([chapter, second]));
  }, { chapter, second });
  await page.goto(url);
  await expect(page.locator(".editor-content")).toBeVisible();
  await page.keyboard.press("Control+Shift+r");
  await expect(panel(page).getByLabel("Novo comentário", { exact: true })).toBeVisible();
  await page.evaluate(({ book, chapter, second, mode }) => {
    const target = window as unknown as AuditWindow;
    const state: AuditWindow["reviewAudit"] = { fail: mode === "error", saves: 0 };
    target.reviewAudit = state;
    const note = (chapterId: string, body: string): ReviewComment => ({
      id: "note-" + chapterId, chapter_id: chapterId, author_profile_id: "local-default-id", body,
      original_excerpt: "Capítulo", anchor_json: null, anchor_revision: 1, anchor_state: "removed", status: "open",
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(), resolved_at: null,
    });
    target.__TAURI_INTERNALS__ = { invoke: async (command, args) => {
      if (command === "get_book_by_id") return book;
      if (command === "list_chapters") return [chapter, second];
      if (command === "get_chapter_by_id") {
        if (mode === "chapter" && args.id === second.id) return new Promise((resolve) => {
          state.releaseChapter = () => resolve(second);
        });
        return [chapter, second].find((c) => c.id === args.id);
      }
      if (command === "save_chapter_content") { state.saves++; throw new Error("Tentativa de salvar durante carregamento"); }
      if (command === "list_chapter_versions") return [];
      if (command === "get_review_progress") return null;
      if (command === "get_profile") return { id: "local-default-id", display_name: "Teste" };
      if (command === "list_review_comments") {
        if (state.fail) throw new Error("Não foi possível carregar a revisão.");
        if (mode === "list" && args.chapterId === second.id) return new Promise((resolve) => {
          state.releaseList = () => resolve([note(second.id, "Comentário atrasado do segundo")]);
        });
        return mode === "list" ? [note(chapter.id, "Comentário correto do primeiro")] : [];
      }
      if (command === "create_review_comment") return new Promise((resolve) => {
        const input = args.input as CreateCommentInput;
        state.releaseCreate = () => resolve({ ...note(input.chapter_id, input.body), ...input });
      });
      throw new Error("Comando inesperado no teste: " + command);
    } };
  }, { book, chapter, second, mode });
}

test("late chapter loads cannot replace the current chapter's review", async ({ page }) => {
  await setup(page, "list");
  await chapters(page).getByText(second.title, { exact: true }).click();
  await expect.poll(() => page.evaluate(() => typeof (window as unknown as AuditWindow).reviewAudit.releaseList)).toBe("function");
  await expect(panel(page).getByRole("status")).toHaveText("Carregando revisão");
  await chapters(page).getByText(chapter.title, { exact: true }).click();
  await expect(panel(page).getByText("Comentário correto do primeiro", { exact: true })).toBeVisible();
  await page.evaluate(async () => {
    (window as unknown as AuditWindow).reviewAudit.releaseList?.();
    await new Promise(requestAnimationFrame);
  });
  await expect(panel(page).getByText("Comentário correto do primeiro", { exact: true })).toBeVisible();
  await expect(panel(page).getByText("Comentário atrasado do segundo", { exact: true })).toHaveCount(0);
});

test("a late comment stays associated with its original chapter", async ({ page }) => {
  await setup(page, "create");
  await panel(page).getByLabel("Novo comentário", { exact: true }).fill("Comentário sendo salvo no primeiro");
  await panel(page).getByRole("button", { name: "Comentar", exact: true }).click();
  await expect.poll(() => page.evaluate(() => typeof (window as unknown as AuditWindow).reviewAudit.releaseCreate)).toBe("function");
  await chapters(page).getByText(second.title, { exact: true }).click();
  await expect(page).toHaveURL(new RegExp("chapterId=" + second.id));
  await expect(panel(page).getByLabel("Novo comentário", { exact: true })).toHaveValue("");
  await page.evaluate(async () => {
    (window as unknown as AuditWindow).reviewAudit.releaseCreate?.();
    await new Promise(requestAnimationFrame);
  });
  await expect(panel(page).getByText("Comentário sendo salvo no primeiro", { exact: true })).toHaveCount(0);
  await expect(panel(page).getByLabel("Novo comentário", { exact: true })).toHaveValue("");
});

test("a failed native load has an explicit retry instead of pretending the chapter has no comments", async ({ page }) => {
  await setup(page, "error");
  await chapters(page).getByText(second.title, { exact: true }).click();
  await expect(panel(page).getByRole("alert")).toContainText("Não foi possível carregar");
  await expect(panel(page).getByText("Nenhum comentário nesta lista.", { exact: true })).toHaveCount(0);
  await page.evaluate(() => { (window as unknown as AuditWindow).reviewAudit.fail = false; });
  await panel(page).getByRole("button", { name: "Tentar novamente", exact: true }).click();
  await expect(panel(page).getByLabel("Novo comentário", { exact: true })).toBeVisible();
});

test("loading another chapter blocks review and save actions until its actual draft is ready", async ({ page }) => {
  await setup(page, "chapter");
  await chapters(page).getByText(second.title, { exact: true }).click();
  await expect.poll(() => page.evaluate(() => typeof (window as unknown as AuditWindow).reviewAudit.releaseChapter)).toBe("function");
  await expect(panel(page)).toHaveCount(0);
  await page.keyboard.press("Control+s");
  expect(await page.evaluate(() => (window as unknown as AuditWindow).reviewAudit.saves)).toBe(0);
  await page.evaluate(() => (window as unknown as AuditWindow).reviewAudit.releaseChapter?.());
  await expect(panel(page).getByLabel("Novo comentário", { exact: true })).toBeVisible();
  await expect(page.locator('input[placeholder="Título do capítulo..."]')).toHaveValue(second.title);
});
