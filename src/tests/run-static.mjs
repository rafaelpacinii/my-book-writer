import { spawn } from "node:child_process";
import { resolve } from "node:path";

// Exercise the export used by Tauri, including route assets, without dev-only HMR.
const build = spawn(process.execPath, [resolve("node_modules/next/dist/bin/next"), "build", "--webpack"], {
  stdio: "inherit", env: process.env,
});
let active = build;
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => active.kill(signal));
build.on("error", (error) => { console.error(error); process.exit(1); });
build.on("exit", (code) => {
  if (code !== 0) process.exit(code ?? 1);
  active = spawn(process.execPath, ["src/tests/serve-static.mjs"], { stdio: "inherit", env: process.env });
  active.on("error", (error) => { console.error(error); process.exit(1); });
  active.on("exit", (code) => process.exit(code ?? 0));
});
