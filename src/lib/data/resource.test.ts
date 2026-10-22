import { describe, expect, it, vi } from "vitest";
import { createResource } from "@/lib/data/resource";

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}

describe("session resources", () => {
  it("deduplicates concurrent requests and reuses loaded data on navigation", async () => {
    const loader = vi.fn(async () => ["Livro"]);
    const resource = createResource(loader);
    await Promise.all([resource.load(), resource.load()]);
    await resource.load();
    expect(loader).toHaveBeenCalledTimes(1);
    expect(resource.getSnapshot().data).toEqual(["Livro"]);
  });

  it("keeps content during refresh and ignores responses invalidated by a restore", async () => {
    const old = deferred<string>();
    const restored = deferred<string>();
    const loader = vi.fn().mockResolvedValueOnce("Original").mockReturnValueOnce(old.promise)
      .mockReturnValueOnce(restored.promise);
    const resource = createResource<string>(loader);
    await resource.load();
    const refresh = resource.load(true);
    await Promise.resolve();
    expect(resource.getSnapshot()).toMatchObject({ data: "Original", isRefreshing: true });
    resource.invalidate(true);
    const restore = resource.load();
    await Promise.resolve();
    old.resolve("Resposta antiga");
    await refresh;
    expect(resource.getSnapshot().data).toBeUndefined();
    restored.resolve("Restaurado");
    await restore;
    expect(resource.getSnapshot().data).toBe("Restaurado");
  });

  it("finishes loading on failure and supports an explicit retry", async () => {
    const loader = vi.fn().mockRejectedValueOnce(new Error("SQLite indisponível"))
      .mockResolvedValueOnce([]);
    const resource = createResource<string[]>(loader);
    await resource.load();
    expect(resource.getSnapshot()).toEqual({ data: undefined, error: "SQLite indisponível", isRefreshing: false });
    await resource.load(true);
    expect(resource.getSnapshot()).toEqual({ data: [], error: null, isRefreshing: false });
  });

  it("revalidates observed resources after a persisted mutation", async () => {
    const loader = vi.fn().mockResolvedValueOnce(["Primeiro"]).mockResolvedValueOnce(["Segundo"]);
    const resource = createResource<string[]>(loader);
    const unsubscribe = resource.subscribe(() => {});
    await resource.load();
    resource.invalidate();
    expect(resource.getSnapshot().data).toEqual(["Primeiro"]);
    await resource.load();
    expect(resource.getSnapshot().data).toEqual(["Segundo"]);
    unsubscribe();
  });
});
