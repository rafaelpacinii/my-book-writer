import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { resolve } from "node:path";
import { request, waitUntil, client } from "./webdriver.mjs";

if (process.platform !== "win32") throw new Error("Execute esta suíte no Windows com WebView2 e msedgedriver.");
const config = JSON.parse(await readFile("src-tauri/tauri.ui-test.conf.json", "utf8"));
assert.equal(config.identifier, "com.rafael.my-book-writer.ui-tests");
// A separate Cargo output directory prevents launching the production-data binary.
const binary = resolve("src-tauri/target/ui-tests/release/my-book-writer.exe");
await access(binary);
const output = resolve("src/tests/test-results/native");
await mkdir(output, { recursive: true });
const driver = spawn("tauri-driver", process.env.MBW_EDGE_DRIVER ? ["--native-driver", process.env.MBW_EDGE_DRIVER] : [], { stdio: "inherit" });
let driverError;
driver.on("error", (error) => { driverError = error; });
let session;
async function start(resetSidebar = false) {
  const created = await request("/session", { capabilities: {
    alwaysMatch: { "tauri:options": { application: binary } },
  } });
  session = client(created.sessionId);
  await waitUntil(() => session.execute("return Boolean(document.body && window.__TAURI_INTERNALS__);"), "native app loaded");
  await session.execute('localStorage.setItem("my_book_writer_onboarding_completed", "true"); if (arguments[0]) localStorage.setItem("mbw_sidebar_collapsed", "false"); location.href = new URL("/home", location.href).href;', [resetSidebar]);
  await waitUntil(() => session.execute('return location.pathname === "/home" && Boolean(document.querySelector("h1")) && !document.querySelector("[aria-busy=true]");'), "home loaded");
}

try {
  await waitUntil(async () => {
    if (driverError) throw driverError;
    try { return Boolean(await request("/status")); }
    catch { return false; }
  }, "tauri-driver available");
  await start(true);
  const runtime = await session.execute("return { userAgent: navigator.userAgent, scale: devicePixelRatio, url: location.href };");
  assert.ok(!runtime.url.startsWith("http://localhost:"), "native tests must use production assets");
  await writeFile(output + "/runtime.json", JSON.stringify(runtime, null, 2));
  const stats = await session.executeAsync(`const done = arguments[arguments.length - 1];
    window.__TAURI_INTERNALS__.invoke("get_database_stats")
      .then(done, error => done({ error: String(error) }));`);
  assert.ok(stats.db_path?.includes(config.identifier), "refusing to write outside the isolated UI-test database");
  const title = `Teste de escrita ${Date.now()}`;
  await session.click('nav a[href="/books/new"]');
  await waitUntil(() => session.execute('return Boolean(document.querySelector("input[placeholder*=lugar]"));'), "new book form ready");
  await session.type('input[placeholder*="lugar"]', title);
  await session.click('button[type="submit"]');
  await waitUntil(() => session.execute("return document.body.textContent.includes(arguments[0]);", [title]), "book saved to SQLite");
  await session.execute('document.querySelector("[data-app-sidebar]").dataset.persisted = "yes";');
  for (const [width, height] of [[800, 600], [1280, 720], [1440, 1000]]) {
    await session.resize(width, height);
    for (const theme of ["light", "dark"]) {
      const current = await session.execute("return document.documentElement.dataset.theme;");
      if (current !== theme) await session.click('button[aria-label="Alternar tema"]');
      for (const [route, heading] of [["/library", "Biblioteca"], ["/books/new", "Novo livro"], ["/settings", "Configurações"], ["/home", "Início"]]) {
        await session.click(`nav a[href="${route}"]`);
        await waitUntil(() => session.execute('return (arguments[0] === "Início" ? location.pathname === "/home" && Boolean(document.querySelector("h1")) : document.querySelector("h1")?.textContent === arguments[0]) && !document.querySelector("[aria-busy=true]");', [heading]), heading);
        assert.equal(await session.execute('return document.querySelector("[data-app-sidebar]").dataset.persisted;'), "yes");
        assert.equal(await session.execute('const main = document.querySelector("main"); return main.scrollWidth <= main.clientWidth;'), true);
        const shot = await session.screenshot();
        await writeFile(`${output}/${route.slice(1).replaceAll("/", "-")}-${theme}-${width}.png`, Buffer.from(shot, "base64"));
      }
    }
  }
  await session.click('button[aria-label="Recolher menu"]');
  await session.close();
  session = undefined;
  await start();
  assert.equal(await session.execute("return document.documentElement.dataset.theme;"), "dark");
  assert.equal(await session.execute('return Math.round(document.querySelector("[data-app-sidebar]").getBoundingClientRect().width);'), 68);
  await session.click('nav a[href="/library"]');
  await waitUntil(() => session.execute("return document.body.textContent.includes(arguments[0]);", [title]), "book survives application restart");
  console.log("Native Windows UI checks passed. Actual DPI/runtime:", runtime);
} catch (error) {
  if (session) {
    try { await writeFile(output + "/failure.png", Buffer.from(await session.screenshot(), "base64")); }
    catch (captureError) { console.error("Could not capture native failure:", captureError); }
  }
  throw error;
} finally {
  try { if (session) await session.close(); }
  finally { driver.kill(); }
}
