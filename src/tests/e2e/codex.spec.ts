import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { test, expect } from "@/tests/e2e/fixtures";
import { seedUniverses, world } from "@/tests/e2e/universeFixtures";
import { mockCodex } from "@/tests/e2e/codexMock";

async function create(page: Page, name: string) {
  await page.getByRole("button", { name: "Nova ficha", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Nome da ficha").fill(name);
  await dialog.getByRole("button", { name: "Criar ficha", exact: true }).click();
  await expect(page.getByRole("heading", { level: 2, name, exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Voltar ao Códice" }).click();
  await expect(page.getByRole("link", { name: `Ver ficha de ${name}`, exact: true })).toBeVisible();
}

test("creates all three kinds with presets, persists them and isolates books from a shared universe", async ({ page }) => {
  await seedUniverses(page);
  await page.goto("/library");
  await page.getByRole("navigation", { name: "Navegação principal" }).getByRole("link", { name: "Códice", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Códice", exact: true })).toBeVisible();
  await expect(page.getByLabel("Universo ou livro")).toHaveValue("universe:world");
  await create(page, "Heroína de Aurora");
  await page.getByRole("tab", { name: "Lugares" }).click();
  await create(page, "Torre do Norte");
  await page.getByRole("tab", { name: "Conceitos" }).click();
  await create(page, "Cristal lunar");
  await page.reload();
  await expect(page.getByRole("tab", { name: "Conceitos" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("article")).toHaveCount(1);
  await page.getByRole("tab", { name: "Personagens" }).click();
  await page.getByLabel("Buscar fichas").fill("heroina");
  await expect(page.getByRole("article")).toHaveCount(1);
  await page.getByLabel("Buscar fichas").fill("ausente");
  await expect(page.getByRole("heading", { name: "Nenhuma ficha encontrada" })).toBeVisible();
  await page.getByRole("button", { name: "Limpar busca" }).click();
  await page.getByLabel("Universo ou livro").selectOption("book:free");
  await expect(page.getByRole("article")).toHaveCount(0);
  await create(page, "Pessoa do livro avulso");
  await page.goto("/codex?bookId=v1");
  await expect(page.getByLabel("Universo ou livro")).toHaveValue("universe:world");
  await expect(page.getByRole("link", { name: "Ver ficha de Heroína de Aurora" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Ver ficha de Pessoa do livro avulso" })).toHaveCount(0);
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("my_book_writer_codex_v1")!));
  expect(stored.entities).toHaveLength(4);
  expect(stored.fields.length).toBeGreaterThan(10);
  expect(stored.templates).toHaveLength(3);
});

test("keeps context and tab through repeated history traversal and reload", async ({ page }) => {
  await seedUniverses(page);
  await page.goto("/codex?universeId=world&kind=character");
  await page.getByRole("tab", { name: "Lugares" }).click();
  await expect(page).toHaveURL(/kind=location/);
  await page.getByLabel("Universo ou livro").selectOption("book:free");
  await expect(page).toHaveURL(/bookId=free/);
  await page.getByRole("tab", { name: "Conceitos" }).click();
  await expect(page).toHaveURL(/kind=lore/);
  for (let index = 0; index < 2; index++) {
    await page.goBack();
    await expect(page.getByRole("tab", { name: "Lugares" })).toHaveAttribute("aria-selected", "true");
    await page.goBack();
    await expect(page.getByLabel("Universo ou livro")).toHaveValue("universe:world");
    await page.goForward();
    await expect(page.getByLabel("Universo ou livro")).toHaveValue("book:free");
    await page.goForward();
    await expect(page.getByRole("tab", { name: "Conceitos" })).toHaveAttribute("aria-selected", "true");
  }
  await page.reload();
  await expect(page.getByLabel("Universo ou livro")).toHaveValue("book:free");
  await expect(page.getByRole("tab", { name: "Conceitos" })).toHaveAttribute("aria-selected", "true");
});

test("retries IPC failures, preserves form values and prevents duplicate submission or closing while saving", async ({ page }) => {
  await mockCodex(page);
  await page.goto("/codex");
  await expect(page.locator("main").getByRole("alert")).toContainText("Não foi possível carregar as fichas.");
  await page.getByRole("button", { name: "Tentar novamente" }).click();
  const trigger = page.getByRole("button", { name: "Nova ficha", exact: true });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Criar ficha", exact: true }).click();
  await expect(dialog.getByText("O nome deve conter entre 1 e 160 caracteres.")).toBeVisible();
  await dialog.getByLabel("Nome da ficha").fill("Pessoa persistente");
  await dialog.getByRole("button", { name: "Criar ficha", exact: true }).evaluate((button: HTMLButtonElement) => { button.click(); button.click(); });
  await expect(dialog.getByRole("button", { name: "Criando ficha…" })).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText("Não foi possível criar esta ficha. Tente novamente.")).toBeVisible();
  await expect(dialog.getByLabel("Nome da ficha")).toHaveValue("Pessoa persistente");
  await dialog.getByRole("button", { name: "Criar ficha", exact: true }).click();
  await expect(page.getByRole("heading", { level: 2, name: "Pessoa persistente", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Voltar ao Códice" }).click();
  await expect(page.getByRole("article")).toHaveCount(1);
  const count = await page.evaluate(() => (window as unknown as { codexCalls: Record<string, number> }).codexCalls.create_codex_entity);
  expect(count).toBe(2);
});

test("handles missing contexts, invalid deep links and corrupt storage without overwriting data", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("my_book_writer_books", "[]");
    localStorage.setItem("my_book_writer_universes", "[]");
  });
  await page.goto("/codex");
  await expect(page.getByRole("heading", { name: "Seu mundo começa com uma história" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Nova ficha", exact: true })).toBeDisabled();
  await expect(page.getByRole("link", { name: "Ir para a Biblioteca" })).toHaveAttribute("href", "/library");
  await page.goto("/codex?bookId=missing");
  await expect(page.locator("main").getByRole("alert")).toContainText("Livro ou Universo não encontrado neste perfil");
  await page.goto("/codex?bookId=missing&universeId=missing");
  await expect(page.locator("main").getByRole("alert")).toContainText("Escolha apenas um Livro ou Universo");
  await page.evaluate(() => localStorage.setItem("my_book_writer_codex_v1", "{corrupt"));
  await page.goto("/codex");
  await expect(page.locator("main").getByRole("alert")).toContainText("Seus dados foram preservados");
  expect(await page.evaluate(() => localStorage.getItem("my_book_writer_codex_v1"))).toBe("{corrupt");
  await page.evaluate(() => localStorage.removeItem("my_book_writer_codex_v1"));
  await page.getByRole("button", { name: "Tentar novamente" }).click();
  await expect(page.getByRole("heading", { name: "Seu mundo começa com uma história" })).toBeVisible();
});

test("archived universes retain readable sheets and disable creation", async ({ page }) => {
  await seedUniverses(page);
  await page.goto("/codex?universeId=world");
  await create(page, "Memória de Aurora");
  await page.evaluate((world) => localStorage.setItem("my_book_writer_universes", JSON.stringify([
    { ...world, deleted_at: new Date().toISOString() },
  ])), world);
  await page.reload();
  await expect(page.getByText("Códice arquivado. Suas fichas continuam disponíveis para consulta.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Nova ficha", exact: true })).toBeDisabled();
  await page.getByRole("link", { name: "Ver ficha de Memória de Aurora" }).click();
  await page.getByRole("tab", { name: "Psicologia", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Psicologia", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Salvar campos", exact: true })).toHaveCount(0);
});

for (const theme of ["light", "dark"]) {
  test(`keyboard navigation, focus, accessibility and narrow layout in ${theme}`, async ({ page }, testInfo) => {
    await seedUniverses(page);
    await page.addInitScript((theme) => localStorage.setItem("mbw-theme-preference", theme), theme);
    await page.setViewportSize({ width: 440, height: 850 });
    await page.goto("/codex");
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    const first = page.getByRole("tab", { name: "Personagens" });
    await first.focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: "Lugares" })).toBeFocused();
    await expect(page.getByRole("tab", { name: "Lugares" })).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("End");
    await expect(page.getByRole("tab", { name: "Conceitos" })).toBeFocused();
    const trigger = page.getByRole("button", { name: "Nova ficha", exact: true });
    await trigger.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("button", { name: "Fechar diálogo" })).toBeFocused();
    await expect(dialog.getByRole("button", { name: "Criar ficha", exact: true })).toBeEnabled();
    await page.keyboard.press("Shift+Tab");
    await expect(dialog.getByRole("button", { name: "Criar ficha", exact: true })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await create(page, "Relíquia de Aurora");
    const violations = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(violations.violations).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `/tmp/my-book-writer-codex-${theme}.png`, fullPage: true });
    if (testInfo.project.name === "chromium" && process.platform === "linux") {
      await expect(page).toHaveScreenshot(`codex-${theme}-narrow.png`, { animations: "disabled", caret: "hide" });
    }
  });
}
