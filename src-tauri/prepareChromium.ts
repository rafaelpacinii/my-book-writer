import { chromium } from "@playwright/test";
import { cp, mkdir, readFile, rm, writeFile, access } from "node:fs/promises";
import { dirname, basename, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { createWriteStream } from "node:fs";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { homedir } from "node:os";

const execFileAsync = promisify(execFile);

const platformMap: Record<string, string> = {
  windows: "win32",
  win32: "win32",
  darwin: "darwin",
  macos: "darwin",
  linux: "linux",
};

const archMap: Record<string, string> = {
  x86_64: "x64",
  x64: "x64",
  aarch64: "arm64",
  arm64: "arm64",
};

const targetPlatform =
  (process.env.TAURI_ENV_PLATFORM && platformMap[process.env.TAURI_ENV_PLATFORM]) ||
  process.platform;

const targetArch =
  (process.env.TAURI_ENV_ARCH && archMap[process.env.TAURI_ENV_ARCH]) ||
  process.arch;

const isCrossCompiling =
  targetPlatform !== process.platform || targetArch !== process.arch;

if (isCrossCompiling && !(targetPlatform === "win32" && targetArch === "x64")) {
  throw new Error(
    `Compilação cruzada para ${targetPlatform}/${targetArch} ainda não é suportada. Prepare o Chromium em uma máquina com o mesmo sistema e arquitetura de destino.`
  );
}

let source: string;
let executableRel: string;
let version: string;

if (!isCrossCompiling) {
  // Build-time only. The installed desktop app starts Chromium directly from Rust.
  const executable = chromium.executablePath();
  try {
    await access(executable);
  } catch {
    throw new Error("Chromium não encontrado. Execute npm run pdf:install antes de preparar o aplicativo.");
  }

  source = dirname(executable);
  if (process.platform === "darwin") {
    while (!basename(source).endsWith(".app")) {
      const parent = dirname(source);
      if (parent === source) throw new Error("Estrutura do Chromium para macOS não reconhecida.");
      source = parent;
    }
    source = dirname(source);
  }

  const browser = await chromium.launch({ executablePath: executable, headless: true });
  try {
    version = `Chromium ${browser.version()}`;
  } finally {
    await browser.close();
  }
  executableRel = relative(source, executable).split(sep).join("/");
} else {
  // Cross-compiling for Windows x64
  const browsersJsonPath = fileURLToPath(
    new URL("../node_modules/playwright-core/browsers.json", import.meta.url)
  );
  let browserVersion = "153.0.8010.12";
  let revision = "1243";
  try {
    const browsersData = JSON.parse(await readFile(browsersJsonPath, "utf8"));
    const chromiumEntry = browsersData.browsers?.find(
      (b: { name: string }) => b.name === "chromium"
    );
    if (chromiumEntry?.browserVersion) {
      browserVersion = chromiumEntry.browserVersion;
    }
    if (chromiumEntry?.revision) {
      revision = chromiumEntry.revision;
    }
  } catch {
    // Defaults are used
  }

  version = `Chromium ${browserVersion}`;
  source = await ensureWindowsChromium(revision, browserVersion);
  executableRel = "chrome.exe";
}

const major = Number(version.match(/\b(\d+)\./)?.[1]);
if (!Number.isFinite(major) || major < 131) {
  throw new Error("A exportação requer Chromium 131 ou posterior para cabeçalhos e numeração em CSS.");
}

const root = fileURLToPath(new URL("./resources/chromium", import.meta.url));
const manifestPath = join(root, "manifest.json");
const manifest = {
  executable: executableRel,
  version,
  platform: targetPlatform,
  arch: targetArch,
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
console.log(`Chromium local preparado: ${version} (${manifest.platform}/${manifest.arch}).`);

async function ensureWindowsChromium(revision: string, browserVersion: string): Promise<string> {
  const cacheDir = process.env.PLAYWRIGHT_BROWSERS_PATH || join(homedir(), ".cache", "ms-playwright");
  const winDir = join(cacheDir, `chromium-${revision}`, "chrome-win64");
  const winExe = join(winDir, "chrome.exe");
  try {
    await access(winExe);
    return winDir;
  } catch {
    // Binary not present yet
  }

  const urls = [
    `https://cdn.playwright.dev/builds/cft/${browserVersion}/win64/chrome-win64.zip`,
    `https://storage.googleapis.com/chrome-for-testing-public/${browserVersion}/win64/chrome-win64.zip`,
  ];

  const parentDir = join(cacheDir, `chromium-${revision}`);
  await mkdir(parentDir, { recursive: true });
  const zipPath = join(parentDir, "chrome-win64.zip");

  console.log(`Baixando Chromium para Windows (${browserVersion})...`);
  let downloaded = false;
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok || !res.body) continue;
      const fileStream = createWriteStream(zipPath);
      await pipeline(Readable.fromWeb(res.body as any), fileStream);
      downloaded = true;
      break;
    } catch {
      // try next url
    }
  }

  if (!downloaded) {
    throw new Error(
      `Chromium para Windows não encontrado.\n` +
      `Não foi possível baixar automaticamente de:\n${urls.join("\n")}\n\n` +
      `Por favor, baixe o arquivo zip e extraia em:\n${winDir}`
    );
  }

  console.log(`Extraindo Chromium para Windows em ${parentDir}...`);
  try {
    await execFileAsync("unzip", ["-q", "-o", zipPath, "-d", parentDir]);
  } finally {
    await rm(zipPath, { force: true });
  }

  try {
    await access(winExe);
  } catch {
    throw new Error(`Falha ao extrair Chromium para Windows. ${winExe} não encontrado.`);
  }

  return winDir;
}
