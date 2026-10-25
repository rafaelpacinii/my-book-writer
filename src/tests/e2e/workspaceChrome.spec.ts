import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@/tests/e2e/fixtures";
import { book, chapter } from "@/tests/fixtures/book";
import { mockDesktopWindow } from "@/tests/e2e/windowMock";

const query = `?bookId=${book.id}`;

for (const theme of ["light", "dark"]) {
  test(`unified ${theme} chrome keeps its geometry and controls in narrow native windows`, async ({ page }) => {
    await mockDesktopWindow(page);
    await page.addInitScript((theme) => localStorage.setItem("mbw-theme-preference", theme), theme);
    await page.goto(`/books/settings${query}`);
    const bar = page.locator("[data-app-titlebar]");
    const sidebar = page.locator("[data-app-sidebar]");
    const color = await bar.evaluate((element) => getComputedStyle(element).backgroundColor);
    await expect(sidebar).toHaveCSS("background-color", color);
    await expect(page.locator(".workspace-content")).not.toHaveCSS("background-color", color);
    await expect(bar).toHaveCSS("border-bottom-width", "0px");
    await expect(sidebar).toHaveCSS("border-right-width", "0px");
    await expect(sidebar.locator(".sidebar-footer, .sidebar-preferences")).toHaveCount(2);
    for (const section of await sidebar.locator(".sidebar-footer, .sidebar-preferences").all()) {
      await expect(section).toHaveCSS("border-top-width", "0px");
    }
    await expect(page.locator(".workspace-content")).toHaveCSS("border-top-left-radius", "16px");
    expect((await sidebar.boundingBox())!.width).toBe((await bar.boundingBox())!.height);
    const brand = (await bar.locator(".titlebar-title").boundingBox())!;
    const toggle = (await bar.getByRole("button", { name: "Expandir menu", exact: true }).boundingBox())!;
    const history = (await bar.getByRole("group", { name: "Histórico de navegação" }).boundingBox())!;
    const crumbs = bar.getByRole("navigation", { name: "Caminho contextual" });
    expect(brand.x + brand.width).toBeLessThan(toggle.x);
    expect(toggle.x + toggle.width).toBeLessThan(history.x);
    expect(history.x + history.width).toBeLessThan((await crumbs.boundingBox())!.x);
    await bar.getByRole("button", { name: "Expandir menu", exact: true }).click();
    await expect(sidebar).toHaveCSS("width", "216px");
    await page.reload();
    await expect(sidebar).toHaveCSS("width", "216px");
    await bar.getByRole("button", { name: "Recolher menu", exact: true }).click();
    for (const width of [800, 540, 390, 320]) {
      await page.setViewportSize({ width, height: 800 });
      await expect(bar.getByRole("button", { name: "Fechar janela", exact: true })).toBeInViewport({ ratio: 1 });
      await expect(bar.getByRole("button", { name: "Voltar", exact: true })).toBeInViewport({ ratio: 1 });
      await expect(bar.getByRole("button", { name: "Avançar", exact: true })).toBeInViewport({ ratio: 1 });
      expect((await crumbs.boundingBox())!.x + (await crumbs.boundingBox())!.width)
        .toBeLessThanOrEqual((await bar.locator(".window-controls").boundingBox())!.x);
      if (width < 700) {
        await bar.getByRole("button", { name: "Abrir menu", exact: true }).click();
        await expect(page.getByRole("dialog", { name: "Menu principal" })).toBeVisible();
        await bar.getByRole("button", { name: "Fechar menu", exact: true }).click();
        await expect(page.getByRole("dialog", { name: "Menu principal" })).toHaveCount(0);
      }
    }
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
    await page.screenshot({ path: test.info().outputPath(`workspace-chrome-${theme}-320.png`) });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`/books/editor${query}&chapterId=${chapter.id}`);
    const chapters = page.getByRole("complementary").filter({ hasText: "Capítulos" });
    await expect(chapters).toBeVisible();
    await expect(chapters).not.toHaveCSS("background-color", color);
    await expect(sidebar).toHaveCSS("background-color", color);
    await bar.getByRole("button", { name: "Expandir menu", exact: true }).click();
    await expect(sidebar).toHaveCSS("background-color", color);
    await expect(chapters).not.toHaveCSS("background-color", color);
    expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
    await page.screenshot({ path: `/tmp/my-book-writer-chrome-editor-${theme}.png` });
  });
}

test("history buttons traverse, survive reloads and clear the forward branch after a new navigation", async ({ page }) => {
  await page.goto("/library");
  const back = page.getByRole("button", { name: "Voltar", exact: true });
  const forward = page.getByRole("button", { name: "Avançar", exact: true });
  await expect(back).toBeDisabled();
  await expect(forward).toBeDisabled();
  await page.locator("main").getByRole("link", { name: book.title, exact: true }).click();
  await expect(page).toHaveURL(`/books/view${query}`);
  await expect(back).toBeEnabled();
  await page.reload();
  await expect(back).toBeEnabled();
  await back.click();
  await expect(page).toHaveURL(/\/library$/);
  await expect(back).toBeDisabled();
  await expect(forward).toBeEnabled();
  await page.reload();
  await expect(forward).toBeEnabled();
  await forward.click();
  await expect(page).toHaveURL(`/books/view${query}`);
  await expect(forward).toBeDisabled();
  await back.click();
  await expect(page).toHaveURL(/\/library$/);
  await page.getByRole("navigation", { name: "Navegação principal" }).getByRole("link", { name: "Início", exact: true }).click();
  await expect(page).toHaveURL(/\/home$/);
  await expect(forward).toBeDisabled();
  await back.click();
  await expect(page).toHaveURL(/\/library$/);
  await expect(back).toBeDisabled();
});

test("back and forward request confirmation for unsaved book settings without pushing another entry", async ({ page }) => {
  await page.goto(`/books/view${query}`);
  await page.locator("main").getByRole("link", { name: "Configurações", exact: true }).click();
  await page.getByLabel("Título do livro", { exact: true }).fill("Alteração não salva");
  const back = page.getByRole("button", { name: "Voltar", exact: true });
  const forward = page.getByRole("button", { name: "Avançar", exact: true });
  const dialog = page.getByRole("dialog", { name: "Descartar alterações?" });
  await back.click();
  await dialog.getByRole("button", { name: "Continuar editando" }).click();
  await expect(page).toHaveURL(`/books/settings${query}`);
  await expect(page.getByLabel("Título do livro", { exact: true })).toHaveValue("Alteração não salva");
  await back.click();
  await dialog.getByRole("button", { name: "Descartar e voltar" }).click();
  await expect(page).toHaveURL(`/books/view${query}`);
  await expect(back).toBeDisabled();
  await forward.click();
  await expect(page).toHaveURL(`/books/settings${query}`);
  await expect(page.getByLabel("Título do livro", { exact: true })).toHaveValue(book.title);
  await expect(forward).toBeDisabled();
});

test("the editor saves before traversing back and the same entry remains available forward", async ({ page }) => {
  await page.goto(`/books/view${query}`);
  await page.locator("main").getByRole("link").filter({ has: page.getByRole("heading", { name: chapter.title, exact: true }) }).click();
  const editor = page.locator("[contenteditable=true]");
  await expect(editor).toBeVisible();
  await editor.fill("Texto preservado ao voltar pela barra de título.");
  await page.getByRole("button", { name: "Voltar", exact: true }).click();
  await expect(page).toHaveURL(`/books/view${query}`);
  expect(await page.evaluate(() => localStorage.getItem("my_book_writer_chapters")))
    .toContain("Texto preservado ao voltar pela barra de título.");
  await page.getByRole("button", { name: "Avançar", exact: true }).click();
  await expect(editor).toHaveText("Texto preservado ao voltar pela barra de título.");
});
