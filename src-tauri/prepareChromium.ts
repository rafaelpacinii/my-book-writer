import { chromium } from "@playwright/test";
import { cp, mkdir, readFile, rm, writeFile, access } from "node:fs/promises";
import { dirname, basename, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

// Build-time only. The installed desktop app starts Chromium directly from Rust.
const executable = chromium.executablePath();
try {
  await access(executable);
} catch {
  throw new Error("Chromium não encontrado. Execute npm run pdf:install antes de preparar o aplicativo.");
}

let source = dirname(executable);
if (process.platform === "darwin") {
  while (!basename(source).endsWith(".app")) {
    const parent = dirname(source);
    if (parent === source) throw new Error("Estrutura do Chromium para macOS não reconhecida.");
    source = parent;
  }
  source = dirname(source);
}

const platformNames: Record<string, string> = { win32: "windows", darwin: "darwin", linux: "linux" };
const archNames: Record<string, string> = { x64: "x86_64", arm64: "aarch64" };
if ((process.env.TAURI_ENV_PLATFORM && process.env.TAURI_ENV_PLATFORM !== platformNames[process.platform])
  || (process.env.TAURI_ENV_ARCH && process.env.TAURI_ENV_ARCH !== archNames[process.arch])) {
  throw new Error("Prepare o Chromium em uma máquina com o mesmo sistema e arquitetura do aplicativo de destino.");
}
const browser = await chromium.launch({ executablePath: executable, headless: true });
let version: string;
try {
  version = `Chromium ${browser.version()}`;
} finally {
  await browser.close();
}
const major = Number(version.match(/\b(\d+)\./)?.[1]);
if (!Number.isFinite(major) || major < 131) {
  throw new Error("A exportação requer Chromium 131 ou posterior para cabeçalhos e numeração em CSS.");
}

const root = fileURLToPath(new URL("./resources/chromium", import.meta.url));
const manifestPath = join(root, "manifest.json");
const manifest = {
  executable: relative(source, executable).split(sep).join("/"),
  version,
  platform: process.platform,
  arch: process.arch,
};
let previous: unknown;
try {
  previous = JSON.parse(await readFile(manifestPath, "utf8"));
} catch (error) {
  if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) throw error;
}
let runtimeExists = true;
try {
  await access(join(root, "runtime", manifest.executable));
} catch (error) {
  if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) throw error;
  runtimeExists = false;
}
if (!runtimeExists || JSON.stringify(previous) !== JSON.stringify(manifest)) {
  await mkdir(root, { recursive: true });
  await rm(join(root, "runtime"), { recursive: true, force: true });
  await cp(source, join(root, "runtime"), { recursive: true, dereference: false });
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
}
await access(join(root, "runtime", manifest.executable));
console.log(`Chromium local preparado: ${version} (${process.platform}/${process.arch}).`);
