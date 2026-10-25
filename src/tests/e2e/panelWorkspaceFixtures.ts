import type { Page } from "@playwright/test";
import { seedUniverses, world } from "@/tests/e2e/universeFixtures";
import type { CodexEntity } from "@/types/codex";
import type { CodexStore } from "@/lib/codex/storage";

export async function seedDesktop(page: Page) {
  await seedUniverses(page);
  const entities: CodexEntity[] = Array.from({ length: 18 }, (_, index) => ({
    id: `desktop-person-${index}`, profile_id: world.profile_id, book_id: null, universe_id: world.id,
    kind: "character", name: `Personagem de Aurora ${index + 1}`, summary: "Uma história a desenvolver.",
    role: "Viajante", status: "Em jornada", archetype: null, tags_json: "[]", position: index,
    created_at: world.created_at, updated_at: world.updated_at, deleted_at: null,
  }));
  const store: CodexStore = { version: 1, entities, categories: [], fields: [], images: [],
    templates: [], contexts: [], assets: [] };
  await page.addInitScript((store) => {
    if (!localStorage.getItem("my_book_writer_codex_v1")) {
      localStorage.setItem("my_book_writer_codex_v1", JSON.stringify(store));
    }
  }, store);
}
