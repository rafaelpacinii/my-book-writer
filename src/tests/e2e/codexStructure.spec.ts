import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { test, expect } from "@/tests/e2e/fixtures";
import { seedUniverses } from "@/tests/e2e/universeFixtures";

async function openSheet(page: Page, name = "Ayla") {
  await seedUniverses(page);
  await page.goto("/codex?universeId=world");
  await page.getByRole("button", { name: "Nova ficha", exact: true }).click();
  await page.getByRole("dialog").getByLabel("Nome da ficha").fill(name);
  await page.getByRole("dialog").getByRole("button", { name: "Criar ficha", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1, name, exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/codex\/sheet\?/);
}

test("category tabs navigate with keyboard, create, rename, reorder and delete categories", async ({ page }) => {
  await openSheet(page);

  const tablist = page.getByRole("tablist", { name: "Categorias da ficha" });
  await expect(tablist.getByRole("tab", { name: "Dados gerais" })).toBeVisible();
  await expect(tablist.getByRole("tab", { name: "Características físicas" })).toBeVisible();

  // Switch tabs
  await tablist.getByRole("tab", { name: "Características físicas" }).click();
  await expect(page.getByRole("tabpanel")).toContainText("Características físicas");

  // Keyboard navigation
  await tablist.getByRole("tab", { name: "Características físicas" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tabpanel")).toContainText("Psicologia");

  // Create new category
  await page.getByRole("button", { name: "Nova categoria", exact: true }).click();
  const categoryDialog = page.getByRole("dialog", { name: "Nova categoria" });
  await categoryDialog.getByLabel("Nome da categoria").fill("Magia e Poderes");
  await categoryDialog.getByRole("button", { name: "Adicionar categoria" }).click();
  await expect(categoryDialog).toHaveCount(0);
  await expect(tablist.getByRole("tab", { name: "Magia e Poderes" })).toBeVisible();
  await expect(page.getByRole("tabpanel")).toContainText("Magia e Poderes");

  // Rename category
  await page.getByRole("button", { name: "Renomear categoria", exact: true }).click();
  const renameDialog = page.getByRole("dialog", { name: "Renomear categoria" });
  await renameDialog.getByLabel("Nome da categoria").fill("Sistema Mágico");
  await renameDialog.getByRole("button", { name: "Aplicar nome" }).click();
  await expect(tablist.getByRole("tab", { name: "Sistema Mágico" })).toBeVisible();

  // Delete category
  await page.getByRole("button", { name: "Excluir categoria", exact: true }).click();
  const deleteModal = page.getByRole("dialog", { name: "Excluir categoria?" });
  await deleteModal.getByRole("button", { name: "Confirmar" }).click();
  await expect(tablist.getByRole("tab", { name: "Sistema Mágico" })).toHaveCount(0);
});

test("dynamic fields support creation, type change, reordering, scale, tags and references", async ({ page }) => {
  await openSheet(page, "Protagonista");

  // Create a second entity (location) to test references
  await page.goto("/codex?universeId=world");
  await page.getByRole("tab", { name: /Lugares/ }).click();
  await page.getByRole("button", { name: "Nova ficha", exact: true }).click();
  await page.getByRole("dialog").getByLabel("Nome da ficha").fill("Cidade de Luz");
  await page.getByRole("dialog").getByRole("button", { name: "Criar ficha", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Cidade de Luz" })).toBeVisible();

  // Return to first entity
  await page.goto("/codex?universeId=world");
  await page.getByRole("tab", { name: /Personagens/ }).click();
  await page.getByRole("link", { name: "Ver ficha de Protagonista" }).click();

  // Add scale field
  await page.getByRole("button", { name: "Novo campo", exact: true }).click();
  const fieldDialog = page.getByRole("dialog", { name: "Novo campo" });
  await fieldDialog.getByLabel("Nome do campo").fill("Poder Arcano");
  await fieldDialog.getByLabel("Tipo de campo").selectOption("scale");
  await fieldDialog.getByRole("button", { name: "Adicionar campo" }).click();

  // Add reference field
  await page.getByRole("button", { name: "Novo campo", exact: true }).click();
  await fieldDialog.getByLabel("Nome do campo").fill("Local de Origem");
  await fieldDialog.getByLabel("Tipo de campo").selectOption("reference");
  await fieldDialog.getByRole("button", { name: "Adicionar campo" }).click();

  // Set field values
  await page.getByRole("textbox", { name: "Nome de nascimento", exact: true }).fill("Ayla Ventania");
  await page.getByLabel("Poder Arcano (valor)").fill("85");
  await expect(page.getByText("85 / 100")).toBeVisible();

  // Link reference
  await page.getByLabel("Vincular ficha em Local de Origem").selectOption({ label: "Cidade de Luz · Lugar" });
  await page.getByRole("button", { name: "Adicionar vínculo em Local de Origem" }).click();
  await expect(page.getByRole("link", { name: "Cidade de Luz" })).toBeVisible();

  // Save fields
  await page.getByRole("button", { name: "Salvar campos", exact: true }).click();
  await expect(page.getByText("Categorias e campos salvos.", { exact: true })).toBeVisible();

  // Reload and verify persistence
  await page.reload();
  await expect(page.getByRole("textbox", { name: "Nome de nascimento", exact: true })).toHaveValue("Ayla Ventania");
  await expect(page.getByText("85 / 100")).toBeVisible();
  await expect(page.getByRole("link", { name: "Cidade de Luz" })).toBeVisible();
});

test("templates save sheet structure and allow instantiating new sheets without content duplication", async ({ page }) => {
  await openSheet(page, "Template Base");

  // Add a custom category and field
  await page.getByRole("button", { name: "Nova categoria", exact: true }).click();
  const catDialog = page.getByRole("dialog", { name: "Nova categoria" });
  await catDialog.getByLabel("Nome da categoria").fill("Equipamentos");
  await catDialog.getByRole("button", { name: "Adicionar categoria" }).click();

  await page.getByRole("button", { name: "Novo campo", exact: true }).click();
  const fieldDialog = page.getByRole("dialog", { name: "Novo campo" });
  await fieldDialog.getByLabel("Nome do campo").fill("Artefatos Especiais");
  await fieldDialog.getByLabel("Tipo de campo").selectOption("tags");
  await fieldDialog.getByRole("button", { name: "Adicionar campo" }).click();

  // Fill personal content
  await page.getByRole("textbox", { name: "Artefatos Especiais", exact: true }).fill("Anel de Fogo, Cajado");
  await page.getByRole("button", { name: "Salvar campos", exact: true }).click();
  await expect(page.getByText("Categorias e campos salvos.")).toBeVisible();

  // Save template
  await page.getByRole("button", { name: "Salvar como modelo", exact: true }).click();
  const tplDialog = page.getByRole("dialog", { name: "Salvar como modelo" });
  await tplDialog.getByLabel("Nome do modelo").fill("Modelo Combatente");
  await tplDialog.getByRole("button", { name: "Salvar modelo" }).click();
  await expect(page.getByText("Modelo Modelo Combatente salvo.")).toBeVisible();

  // Create new entity from template
  await page.goto("/codex?universeId=world");
  await page.getByRole("button", { name: "Nova ficha", exact: true }).click();
  const createDialog = page.getByRole("dialog");
  await createDialog.getByLabel("Nome da ficha").fill("Guerreiro Novo");
  await createDialog.getByLabel("Modelo de ficha").selectOption({ label: "Modelo Combatente" });
  await createDialog.getByRole("button", { name: "Criar ficha" }).click();

  // Verify new entity has the template category and field, but empty content
  await expect(page.getByRole("heading", { level: 1, name: "Guerreiro Novo" })).toBeVisible();
  const tablist = page.getByRole("tablist", { name: "Categorias da ficha" });
  await tablist.getByRole("tab", { name: "Equipamentos" }).click();
  await expect(page.getByRole("textbox", { name: "Artefatos Especiais", exact: true })).toHaveValue("");
});

test("unsaved structure changes protect navigation and can be discarded", async ({ page }) => {
  await openSheet(page, "Teste Descarte");

  await page.getByRole("textbox", { name: "Nome de nascimento", exact: true }).fill("Alteração Pendente");
  await expect(page.getByText("Alterações não salvas nos campos.")).toBeVisible();

  // Try navigating away
  await page.getByRole("link", { name: "Voltar ao Códice" }).click();
  await expect(page.getByRole("dialog", { name: "Descartar alterações?" })).toBeVisible();
  await page.getByRole("button", { name: "Continuar editando" }).click();
  await expect(page.getByRole("textbox", { name: "Nome de nascimento", exact: true })).toHaveValue("Alteração Pendente");

  // Discard changes
  await page.getByRole("button", { name: "Descartar alterações nos campos" }).click();
  const discardModal = page.getByRole("dialog", { name: "Descartar alterações nos campos?" });
  await discardModal.getByRole("button", { name: "Confirmar" }).click();
  await expect(page.getByRole("textbox", { name: "Nome de nascimento", exact: true })).toHaveValue("");
});

for (const theme of ["light", "dark"]) {
  test(`structure controls and dialogs are accessible in ${theme}`, async ({ page }) => {
    await page.addInitScript((theme) => localStorage.setItem("mbw-theme-preference", theme), theme);
    await openSheet(page, `A11y ${theme}`);

    const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(result.violations).toEqual([]);

    await page.getByRole("button", { name: "Nova categoria", exact: true }).click();
    const catResult = await new AxeBuilder({ page }).include('[role="dialog"]').withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(catResult.violations).toEqual([]);
    await page.keyboard.press("Escape");
  });
}
