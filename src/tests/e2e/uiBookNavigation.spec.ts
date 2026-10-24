import { test, expect } from "@/tests/e2e/fixtures";
import { book, chapter } from "@/tests/fixtures/book";
import { mockDesktopWindow } from "@/tests/e2e/windowMock";

const query = `?bookId=${book.id}`;
const chapterQuery = `${query}&chapterId=${chapter.id}`;

test("@ui book details share the library width and retain the global sidebar across routes", async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto("/library");
  await expect(page.locator("main").getByRole("heading", { name: book.title, exact: true })).toBeVisible();
  const libraryWidth = await page.locator("#main-content > div").evaluate((element) => element.getBoundingClientRect().width);
  await page.locator("[data-app-sidebar]").evaluate((element) => { element.dataset.persisted = "yes"; });
  await page.locator("main").getByRole("link", { name: book.title, exact: true }).click();
  await expect(page.getByRole("heading", { level: 1, name: book.title })).toBeVisible();
  expect(await page.locator("#main-content > div").evaluate((element) => element.getBoundingClientRect().width)).toBe(libraryWidth);
  await expect(page.locator('[data-app-sidebar][data-persisted="yes"]')).toHaveCount(1);
  await page.locator("main").getByRole("link", { name: "Configurações", exact: true }).click();
  const breadcrumbs = page.getByRole("navigation", { name: "Caminho contextual" });
  await expect(breadcrumbs.getByRole("link", { name: "Biblioteca" })).toHaveAttribute("href", "/library");
  await expect(breadcrumbs.getByRole("link", { name: book.title, exact: true })).toHaveAttribute("href", `/books/view${query}`);
  await expect(breadcrumbs.locator('[aria-current="page"]')).toHaveText("Configurações");
  await breadcrumbs.getByRole("link", { name: book.title, exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/books/view\\?bookId=${book.id}`));
  await expect(page.locator('[data-app-sidebar][data-persisted="yes"]')).toHaveCount(1);
});

test("@ui every book screen and missing-book state exposes one global menu and one main landmark", async ({ page }) => {
  for (const route of ["/books/new", `/books/view${query}`, `/books/settings${query}`, `/books/export${query}`, `/books/front-matter${query}`,
    `/books/editor${chapterQuery}`, `/books/preview${query}`, `/books/versions${chapterQuery}`]) {
    await page.goto(route);
    await expect(page.locator("[data-app-sidebar]")).toHaveCount(1);
    await expect(page.getByRole("navigation", { name: "Navegação principal" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Caminho contextual" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Caminho contextual" })).toHaveCount(1);
    await expect(page.locator("main nav[aria-label='Caminho contextual'], main nav[aria-label='Caminho de navegação']")).toHaveCount(0);
    await expect(page.getByRole("main")).toHaveCount(1);
  }
  await page.goto("/books/view?bookId=missing");
  await expect(page.getByRole("heading", { name: "Livro não encontrado" })).toBeVisible();
  await page.getByRole("navigation", { name: "Navegação principal" }).getByRole("link", { name: "Biblioteca", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Biblioteca", exact: true })).toBeVisible();
});

test("@ui titlebar keeps the only book path and native controls reachable in narrow windows", async ({ page }) => {
  const title = "Uma história com um título muito longo ".repeat(5);
  await mockDesktopWindow(page, { books: [{ ...book, title }] });
  for (const width of [800, 540, 390, 320]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto(`/books/settings${query}`);
    const bar = page.locator("[data-app-titlebar]");
    const navigation = bar.getByRole("navigation", { name: "Caminho contextual" });
    await expect(navigation.getByRole("link", { name: title.trim(), exact: true })).toBeVisible();
    await expect(navigation.locator('[aria-current="page"]')).toHaveText("Configurações");
    await expect(bar.getByRole("button", { name: "Fechar janela", exact: true })).toBeInViewport({ ratio: 1 });
    const pathBounds = (await navigation.boundingBox())!;
    const controls = (await bar.locator(".window-controls").boundingBox())!;
    expect(pathBounds.x + pathBounds.width).toBeLessThanOrEqual(controls.x);
    if (width === 390) await page.screenshot({ path: test.info().outputPath("titlebar-navigation-390.png") });
    await navigation.getByRole("link", { name: "Biblioteca", exact: true }).click();
    await expect(page).toHaveURL(/\/library$/);
  }
});

test("@ui history titlebar returns to the same chapter in the editor", async ({ page }) => {
  await page.goto(`/books/versions${chapterQuery}`);
  const navigation = page.locator("[data-app-titlebar]").getByRole("navigation", { name: "Caminho contextual" });
  await expect(navigation.locator('[aria-current="page"]')).toHaveText("Histórico");
  await navigation.getByRole("link", { name: "Editor", exact: true }).click();
  await expect(page).toHaveURL(`/books/editor${chapterQuery}`);
  await expect(page.locator("[contenteditable=true]")).toBeVisible();
});

test("@ui settings breadcrumbs and global links protect unsaved changes and keep the chosen destination", async ({ page }) => {
  await page.goto(`/books/settings${query}`);
  await page.getByLabel("Título do livro", { exact: true }).fill("Alteração não salva");
  await page.getByRole("navigation", { name: "Caminho contextual" }).getByRole("link", { name: book.title, exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Descartar alterações?" });
  await dialog.getByRole("button", { name: "Continuar editando" }).click();
  await expect(page.getByLabel("Título do livro", { exact: true })).toHaveValue("Alteração não salva");
  await page.getByRole("navigation", { name: "Navegação principal" }).getByRole("link", { name: "Biblioteca", exact: true }).click();
  await dialog.getByRole("button", { name: "Descartar e voltar" }).click();
  await expect(page).toHaveURL(/\/library$/);
  await expect(page.locator("main").getByRole("heading", { name: book.title, exact: true })).toBeVisible();
});

test("@ui editor saves the latest draft before leaving through the global menu and focus mode stays distraction-free", async ({ page }) => {
  await page.goto(`/books/editor${chapterQuery}`);
  await expect(page.locator("[contenteditable=true]")).toBeVisible();
  await page.getByRole("button", { name: "Modo foco", exact: true }).click();
  await expect(page.locator("[data-app-sidebar]")).toBeHidden();
  await page.getByRole("button", { name: /Sair do foco|Sair do modo foco/ }).click();
  await expect(page.locator("[data-app-sidebar]")).toBeVisible();
  await page.locator("[contenteditable=true]").fill("Rascunho antes de navegar pela lateral.");
  await page.getByRole("navigation", { name: "Navegação principal" }).getByRole("link", { name: "Biblioteca", exact: true }).click();
  await expect(page).toHaveURL(/\/library$/);
  const saved = await page.evaluate(() => localStorage.getItem("my_book_writer_chapters"));
  expect(saved).toContain("Rascunho antes de navegar pela lateral.");
});

test("@ui mobile global menu remains reachable in the editor", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/books/editor${chapterQuery}`);
  await expect(page.locator("[contenteditable=true]")).toBeVisible();
  await page.getByRole("button", { name: "Abrir menu", exact: true }).click();
  await page.getByRole("dialog", { name: "Menu principal" }).getByRole("link", { name: "Biblioteca", exact: true }).click();
  await expect(page).toHaveURL(/\/library$/);
  await expect(page.getByRole("dialog", { name: "Menu principal" })).toHaveCount(0);
});
