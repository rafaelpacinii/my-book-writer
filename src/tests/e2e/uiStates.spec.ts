import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@/tests/e2e/fixtures";
import { mockUI } from "@/tests/e2e/uiMock";

test("@ui empty library is distinct from a filtered library", async ({ page }) => {
  await mockUI(page, { empty: true });
  await page.goto("/library");
  await expect(page.getByRole("heading", { name: "Sua biblioteca começa aqui." })).toBeVisible();
  await expect(page.locator("[data-loading-placeholder]")).toHaveCount(0);
  await page.locator("main").getByRole("link", { name: "Criar meu primeiro livro", exact: true }).click();
  await page.getByLabel("Título do livro").fill("Uma história");
  await page.getByRole("button", { name: "Criar livro", exact: true }).click();
  await page.getByRole("navigation", { name: "Navegação principal" }).getByRole("link", { name: "Biblioteca" }).click();
  await page.getByLabel("Buscar por título ou autor").fill("Inexistente");
  await expect(page.getByRole("heading", { name: "Nenhum livro encontrado." })).toBeVisible();
  await page.getByRole("button", { name: "Limpar filtros", exact: true }).last().click();
  await expect(page.getByRole("heading", { name: "Uma história" })).toBeVisible();
});

test("@ui profile dialog is prefilled, keeps keyboard focus and updates without reloading books", async ({ page }) => {
  await mockUI(page);
  await page.goto("/home");
  await expect(page.getByRole("heading", { name: "Livro de teste" })).toBeVisible();
  const trigger = page.getByRole("button", { name: "Abrir configurações do perfil" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Configurações do autor" });
  await expect(dialog.getByLabel("Nome ou pseudônimo de autor")).toHaveValue("Helena Duarte");
  await expect(dialog.getByRole("button", { name: "Fechar diálogo" })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(dialog.getByRole("button", { name: "Salvar alterações" })).toBeFocused();
  const result = await new AxeBuilder({ page }).include('[role="dialog"]').withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(result.violations).toEqual([]);
  await dialog.getByLabel("Nome ou pseudônimo de autor").fill("Ana Escritora");
  await dialog.getByRole("button", { name: "Salvar alterações" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await page.getByRole("button", { name: "Expandir menu", exact: true }).click();
  await expect(page.getByText("Ana Escritora", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { uiCalls: Record<string, number> }).uiCalls.list_books)).toBe(1);
});

test("@ui retrying cover import does not create a duplicate book", async ({ page }) => {
  await mockUI(page, { failCover: 1 });
  await page.goto("/books/new");
  await page.getByLabel("Título do livro").fill("Com capa");
  const data = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 10; canvas.height = 10;
    return canvas.toDataURL("image/png").split(",")[1];
  });
  await page.locator('input[type="file"]').setInputFiles({ name: "capa.png", mimeType: "image/png", buffer: Buffer.from(data, "base64") });
  await expect(page.getByRole("img", { name: "Capa do livro", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Criar livro", exact: true }).click();
  await expect(page.locator("main").getByRole("alert")).toContainText("O livro foi criado");
  await page.getByRole("button", { name: "Criar livro", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Com capa", exact: true })).toBeVisible();
  await expect(page.getByRole("img", { name: "Capa de Com capa" })).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { uiCalls: Record<string, number> }).uiCalls))
    .toMatchObject({ create_book: 1, update_book: 1, import_image_asset: 2 });
});

test("@ui editor preferences persist across routes and stay synchronized with theme controls", async ({ page }) => {
  await mockUI(page);
  await page.goto("/settings");
  await page.getByRole("button", { name: "Preferências", exact: true }).click();
  await page.getByLabel("Salvamento automático").uncheck();
  await page.getByRole("button", { name: "Escuro", exact: true }).click();
  await expect(page.getByRole("button", { name: "Escuro", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("navigation", { name: "Navegação principal" }).getByRole("link", { name: "Biblioteca" }).click();
  await page.getByRole("navigation", { name: "Navegação principal" }).getByRole("link", { name: "Configurações" }).click();
  await page.getByRole("button", { name: "Preferências", exact: true }).click();
  await expect(page.getByLabel("Salvamento automático")).not.toBeChecked();
  await page.getByRole("button", { name: "Alternar tema" }).click();
  await expect(page.getByRole("button", { name: "Claro", exact: true })).toHaveAttribute("aria-pressed", "true");
});
