import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { test, expect } from "@/tests/e2e/fixtures";
import { seedUniverses, world } from "@/tests/e2e/universeFixtures";

async function openSheet(page: Page) {
  await seedUniverses(page);
  await page.goto("/codex?universeId=world");
  await page.getByRole("button", { name: "Nova ficha", exact: true }).click();
  await page.getByRole("dialog").getByLabel("Nome da ficha").fill("Ayla");
  await page.getByRole("dialog").getByRole("button", { name: "Criar ficha", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Ayla", exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/codex\/sheet\?/);
}
const gallery = (page: Page) => page.getByRole("region", { name: "Galeria da ficha" });
const thumbnails = (page: Page) => gallery(page).getByRole("button", { name: /^Ver imagem / });

test("identity, multiple images, captions, primary selection and removal persist and appear in hub cards", async ({ page }) => {
  await openSheet(page);
  await page.getByLabel("Nome da ficha", { exact: true }).fill("Ayla de Aurora");
  await page.getByLabel("Papel na história").fill("Protagonista");
  await page.getByLabel("Status", { exact: true }).fill("Em viagem");
  await page.getByLabel("Título ou arquétipo").fill("Guardiã");
  await page.getByLabel("Resumo", { exact: true }).fill("Uma viajante em busca de sua origem.");
  await page.getByLabel("Tags", { exact: true }).fill("coragem, magia");
  await page.getByRole("button", { name: "Salvar identidade", exact: true }).click();
  await expect(page.getByText("Identidade salva.", { exact: true })).toBeVisible();
  await gallery(page).getByLabel("Selecionar imagens da ficha").setInputFiles(["public/icon-192.png", "public/favicon-48.png"]);
  await expect(thumbnails(page)).toHaveCount(2);
  await expect(gallery(page).getByRole("button", { name: "Adicionar imagens" })).toBeEnabled();
  await gallery(page).getByRole("button", { name: "Ver imagem 2", exact: true }).click();
  await gallery(page).getByLabel("Legenda da imagem").fill("Retrato atual");
  await gallery(page).getByRole("button", { name: "Salvar legenda", exact: true }).click();
  await expect(gallery(page).getByText("Legenda salva.", { exact: true })).toBeAttached();
  await gallery(page).getByRole("button", { name: "Definir como principal" }).click();
  await expect(gallery(page).getByRole("button", { name: "Ver imagem 2 (principal)", exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Status", { exact: true })).toHaveValue("Em viagem");
  await expect(gallery(page).getByRole("img", { name: "Retrato atual" })).toBeVisible();
  const crumbs = page.getByRole("navigation", { name: "Caminho contextual" });
  await expect(crumbs).toContainText("CódiceAuroraAyla de Aurora");
  await page.getByRole("link", { name: "Voltar ao Códice" }).click();
  await expect(page.getByRole("img", { name: "Imagem principal de Ayla de Aurora" })).toBeVisible();
  await page.getByRole("link", { name: "Ver ficha de Ayla de Aurora" }).click();
  await gallery(page).getByRole("button", { name: "Remover imagem", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Cancelar", exact: true }).click();
  await expect(thumbnails(page)).toHaveCount(2);
  await gallery(page).getByRole("button", { name: "Remover imagem", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Confirmar remoção" }).click();
  await expect(thumbnails(page)).toHaveCount(1);
  await expect(gallery(page).getByRole("button", { name: "Ver imagem 1 (principal)", exact: true })).toBeVisible();
  await page.reload();
  await expect(thumbnails(page)).toHaveCount(1);
});

test("unsaved identity survives gallery refresh and navigation requires a discard decision", async ({ page }) => {
  await openSheet(page);
  await page.getByLabel("Status", { exact: true }).fill("Rascunho local");
  await page.getByRole("link", { name: "Voltar ao Códice" }).click();
  await expect(page.getByRole("dialog", { name: "Descartar alterações?" })).toBeVisible();
  await page.getByRole("button", { name: "Continuar editando" }).click();
  await gallery(page).getByLabel("Selecionar imagens da ficha").setInputFiles("public/icon-192.png");
  await expect(thumbnails(page)).toHaveCount(1);
  await expect(page.getByLabel("Status", { exact: true })).toHaveValue("Rascunho local");
  await page.getByRole("button", { name: "Salvar identidade", exact: true }).click();
  await expect(page.getByText("Identidade salva.", { exact: true })).toBeVisible();
  await page.getByLabel("Status", { exact: true }).fill("Deve ser descartado");
  await page.getByRole("link", { name: "Voltar ao Códice" }).click();
  await page.getByRole("button", { name: "Descartar e voltar" }).click();
  await page.getByRole("link", { name: "Ver ficha de Ayla" }).click();
  await expect(page.getByLabel("Status", { exact: true })).toHaveValue("Rascunho local");
});

test("storage failures preserve edits, invalid files fail safely and unavailable images can be retried", async ({ page }) => {
  await openSheet(page);
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    let failures = 1;
    Storage.prototype.setItem = function(key, value) {
      if (key === "my_book_writer_codex_v1" && failures-- > 0) throw new DOMException("quota", "QuotaExceededError");
      original.call(this, key, value);
    };
  });
  await page.getByLabel("Status", { exact: true }).fill("Viva");
  await page.getByRole("button", { name: "Salvar identidade", exact: true }).click();
  await expect(page.locator("main").getByRole("alert")).toContainText("Não foi possível salvar o Códice local");
  await expect(page.getByLabel("Status", { exact: true })).toHaveValue("Viva");
  await page.getByRole("button", { name: "Salvar identidade", exact: true }).click();
  await expect(page.getByText("Identidade salva.", { exact: true })).toBeVisible();
  await gallery(page).getByLabel("Selecionar imagens da ficha").setInputFiles({ name: "invalid.svg", mimeType: "image/svg+xml", buffer: Buffer.from("<svg/>") });
  await expect(gallery(page).getByRole("alert")).toContainText("PNG, JPEG ou WebP");
  await expect(thumbnails(page)).toHaveCount(0);
  await gallery(page).getByLabel("Selecionar imagens da ficha").setInputFiles("public/icon-192.png");
  await expect(thumbnails(page)).toHaveCount(1);
  await expect(gallery(page).getByRole("img", { name: "icon-192.png", exact: true })).toBeVisible();
  await page.evaluate(() => {
    const store = JSON.parse(localStorage.getItem("my_book_writer_codex_v1")!);
    sessionStorage.setItem("original-gallery-image", store.assets[0].data_url);
    store.assets[0].data_url = "data:image/png;base64,bad";
    localStorage.setItem("my_book_writer_codex_v1", JSON.stringify(store));
  });
  await page.reload();
  await expect(gallery(page).getByRole("button", { name: "Tentar carregar imagem novamente" })).toBeVisible();
  await page.evaluate(() => {
    const store = JSON.parse(localStorage.getItem("my_book_writer_codex_v1")!);
    store.assets[0].data_url = sessionStorage.getItem("original-gallery-image");
    localStorage.setItem("my_book_writer_codex_v1", JSON.stringify(store));
  });
  await gallery(page).getByRole("button", { name: "Tentar carregar imagem novamente" }).click();
  await expect(gallery(page).getByRole("img", { name: "icon-192.png", exact: true })).toBeVisible();
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    let failures = 1;
    Storage.prototype.setItem = function(key, value) {
      if (key === "my_book_writer_codex_v1" && failures-- > 0) throw new DOMException("quota", "QuotaExceededError");
      original.call(this, key, value);
    };
  });
  await gallery(page).getByRole("button", { name: "Remover imagem", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Confirmar remoção" }).click();
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText("Não foi possível salvar o Códice local");
  await expect(thumbnails(page)).toHaveCount(1);
  await page.getByRole("dialog").getByRole("button", { name: "Confirmar remoção" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(thumbnails(page)).toHaveCount(0);
});

test("archived sheets preserve gallery reads while identity and gallery actions are unavailable", async ({ page }) => {
  await openSheet(page);
  await gallery(page).getByLabel("Selecionar imagens da ficha").setInputFiles("public/icon-192.png");
  await expect(thumbnails(page)).toHaveCount(1);
  await page.evaluate((world) => localStorage.setItem("my_book_writer_universes", JSON.stringify([{ ...world, deleted_at: new Date().toISOString() }])), world);
  await page.reload();
  await expect(page.getByText("Códice arquivado. Esta ficha está disponível apenas para consulta.")).toBeVisible();
  await expect(page.getByLabel("Status", { exact: true })).toBeDisabled();
  await expect(gallery(page).getByRole("img", { name: "icon-192.png", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Adicionar imagens" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Salvar identidade" })).toHaveCount(0);
});

for (const theme of ["light", "dark"]) for (const width of [440, 1440]) {
  test(`sheet layout, gallery and accessibility in ${theme} at ${width}`, async ({ page }, testInfo) => {
    await page.addInitScript((theme) => localStorage.setItem("mbw-theme-preference", theme), theme);
    await page.setViewportSize({ width, height: 1000 });
    await openSheet(page);
    await gallery(page).getByLabel("Selecionar imagens da ficha").setInputFiles("public/icon-192.png");
    await expect(gallery(page).getByRole("img", { name: "icon-192.png", exact: true })).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(result.violations).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (testInfo.project.name === "chromium" && process.platform === "linux") {
      await expect(page).toHaveScreenshot(`codex-sheet-${theme}-${width}.png`, { fullPage: true, animations: "disabled", caret: "hide" });
    }
  });
}
