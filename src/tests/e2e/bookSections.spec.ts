import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@/tests/e2e/fixtures";
import { book, chapter } from "@/tests/fixtures/book";
import { editorURL, readSavedHtml } from "@/tests/e2e/pagedEditor";

const query = `?bookId=${book.id}`;
const frontMatterURL = `/books/front-matter${query}`;

test("book settings, front matter and export share the same content width, header and card geometry", async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  const geometry = [];
  for (const [route, title] of [["settings", "Configurações do livro"], ["front-matter", "Páginas iniciais"], ["export", "Exportar livro"]]) {
    await page.goto(`/books/${route}${query}`);
    await expect(page.locator("main").getByRole("heading", { level: 1, name: title, exact: true })).toBeVisible();
    await expect(page.locator("[data-book-section] section").first()).toBeVisible();
    geometry.push(await page.locator("[data-book-section]").evaluate((element) => {
      const card = element.querySelector("section");
      const title = element.querySelector("h1");
      if (!card || !title) throw new Error("Book section layout is incomplete");
      const style = getComputedStyle(card);
      return { width: element.getBoundingClientRect().width, x: element.getBoundingClientRect().x,
        titleSize: getComputedStyle(title).fontSize, titleY: title.getBoundingClientRect().y,
        cardWidth: card.getBoundingClientRect().width, cardY: card.getBoundingClientRect().y,
        padding: style.padding, radius: style.borderRadius };
    }));
    await expect(page.getByRole("navigation", { name: "Navegação principal" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Caminho contextual" }).getByRole("link", { name: book.title, exact: true })).toBeVisible();
  }
  expect(geometry[0].width).toBe(1390);
  expect(geometry[1]).toEqual(geometry[0]);
  expect(geometry[2]).toEqual(geometry[0]);
});

test("front matter is a full page, preserves edits across tabs and persists them into the book preview", async ({ page }) => {
  await page.goto(`/books/view${query}`);
  await expect(page.locator("main").getByRole("link", { name: "Ver livro completo", exact: true })).toHaveCount(0);
  await page.getByRole("link", { name: "Páginas iniciais", exact: true }).click();
  await expect(page).toHaveURL(frontMatterURL);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByLabel("Incluir Falsa Folha de Rosto", { exact: true }).uncheck();
  await page.getByRole("tab", { name: "Folha de rosto", exact: true }).click();
  await page.getByLabel("Subtítulo da obra (opcional)").fill("Uma aventura inesperada");
  await page.getByRole("tab", { name: "Copyright e créditos", exact: true }).click();
  await page.getByRole("tab", { name: "Folha de rosto", exact: true }).click();
  await expect(page.getByLabel("Subtítulo da obra (opcional)")).toHaveValue("Uma aventura inesperada");
  await page.getByRole("button", { name: "Salvar alterações", exact: true }).click();
  await expect(page).toHaveURL(`/books/view${query}`);
  await page.getByRole("link", { name: "Páginas iniciais", exact: true }).click();
  await page.getByRole("tab", { name: "Folha de rosto", exact: true }).click();
  await expect(page.getByLabel("Subtítulo da obra (opcional)")).toHaveValue("Uma aventura inesperada");
  await page.getByRole("link", { name: "Conferir livro completo", exact: true }).click();
  await expect(page.locator("main").getByText("Uma aventura inesperada", { exact: true })).toBeVisible();
});

test("front matter breadcrumbs and contextual preview links protect unsaved edits", async ({ page }) => {
  await page.goto(frontMatterURL);
  await page.getByRole("tab", { name: "Folha de rosto", exact: true }).click();
  await page.getByLabel("Subtítulo da obra (opcional)").fill("Rascunho pendente");
  await page.getByRole("link", { name: "Conferir livro completo", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Descartar alterações?" });
  await dialog.getByRole("button", { name: "Continuar editando" }).click();
  await expect(page.getByLabel("Subtítulo da obra (opcional)")).toHaveValue("Rascunho pendente");
  await page.getByRole("navigation", { name: "Caminho contextual" }).getByRole("link", { name: book.title, exact: true }).click();
  await dialog.getByRole("button", { name: "Descartar e voltar" }).click();
  await expect(page).toHaveURL(`/books/view${query}`);
});

test("front matter save failures keep the page and draft available for retry", async ({ page }) => {
  await page.goto(frontMatterURL);
  await page.getByRole("tab", { name: "Folha de rosto", exact: true }).click();
  await page.getByLabel("Subtítulo da obra (opcional)").fill("Texto preservado");
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    let fail = true;
    Storage.prototype.setItem = function (key, value) {
      if (key.startsWith("my_book_writer_front_matter_") && fail) { fail = false; throw new Error("Falha de gravação"); }
      original.call(this, key, value);
    };
  });
  await page.getByRole("button", { name: "Salvar alterações", exact: true }).click();
  await expect(page.locator("main").getByRole("alert")).toContainText("Suas alterações foram mantidas");
  await expect(page.getByLabel("Subtítulo da obra (opcional)")).toHaveValue("Texto preservado");
  await page.getByRole("button", { name: "Salvar alterações", exact: true }).click();
  await expect(page).toHaveURL(`/books/view${query}`);
});

test("editor preview navigation saves the latest draft and returns to the same chapter", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(editorURL);
  await page.locator('[contenteditable="true"]').fill("Texto antes de conferir o livro completo.");
  await page.getByRole("link", { name: "Ver livro completo", exact: true }).click();
  await expect(page).toHaveURL(`/books/preview${query}&chapterId=${chapter.id}`);
  expect(await readSavedHtml(page)).toContain("Texto antes de conferir o livro completo.");
  await expect(page.locator("main header")).toHaveCount(1);
  await expect(page.locator("[contenteditable]")).toHaveCount(0);
  await page.getByRole("link", { name: "Voltar ao editor", exact: true }).click();
  await expect(page).toHaveURL(editorURL);
  await expect(page.locator('[contenteditable="true"]')).toHaveText("Texto antes de conferir o livro completo.");
});

test("section tabs support keyboard navigation and export exposes the contextual preview", async ({ page }) => {
  await page.goto(frontMatterURL);
  await page.getByRole("tab", { name: "Falsa folha", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Folha de rosto", exact: true })).toBeFocused();
  await page.keyboard.press("End");
  await expect(page.getByRole("tab", { name: "Sumário", exact: true })).toHaveAttribute("aria-selected", "true");
  await page.goto(`/books/export${query}`);
  await page.getByRole("tab", { name: "PDF", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("button", { name: "Exportar EPUB", exact: true })).toBeVisible();
  await page.keyboard.press("End");
  await expect(page.getByRole("button", { name: "Exportar DOCX", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Ver livro completo", exact: true })).toHaveAttribute("href", `/books/preview${query}`);
});

test("front matter offers recovery after loading errors and handles missing books", async ({ page }) => {
  await page.addInitScript((id) => localStorage.setItem(`my_book_writer_front_matter_${id}`, "invalid-json"), book.id);
  await page.goto(frontMatterURL);
  await expect(page.locator("main").getByRole("alert")).toContainText("Não foi possível carregar");
  await page.evaluate((id) => localStorage.removeItem(`my_book_writer_front_matter_${id}`), book.id);
  await page.getByRole("button", { name: "Tentar novamente", exact: true }).click();
  await expect(page.getByLabel("Incluir Falsa Folha de Rosto", { exact: true })).toBeVisible();
  await page.goto("/books/front-matter?bookId=missing");
  await expect(page.getByRole("heading", { name: "Livro não encontrado", exact: true })).toBeVisible();
});

for (const theme of ["light", "dark"]) {
  test(`book sections remain accessible and fit narrow windows in ${theme} mode`, async ({ page }) => {
    await page.addInitScript((theme) => localStorage.setItem("mbw-theme-preference", theme), theme);
    for (const width of [800, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const route of ["front-matter", "export"]) {
        await page.goto(`/books/${route}${query}`);
        await expect(page.locator("[data-book-section] section").first()).toBeVisible();
        const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
        expect(result.violations, `${route} / ${width}`).toEqual([]);
        expect(await page.locator("main").evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
      }
    }
  });
}
