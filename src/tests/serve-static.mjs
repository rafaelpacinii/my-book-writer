import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";

// With output: "export", Next uses a custom distDir as the exported site directory.
const root = resolve(process.env.MBW_STATIC_DIR || process.env.MBW_NEXT_DIST_DIR || "out");
const port = Number(process.env.MBW_STATIC_PORT ?? 3100);
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".ttf": "font/ttf", ".txt": "text/plain; charset=utf-8" };
await stat(root);
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname);
    const path = resolve(root, "." + pathname);
    if (path !== root && !path.startsWith(root + sep)) {
      response.writeHead(403).end();
      return;
    }
    for (const candidate of [path, path + ".html", resolve(path, "index.html")]) {
      try {
        if (!(await stat(candidate)).isFile()) continue;
        const body = await readFile(candidate);
        response.writeHead(200, { "content-type": types[extname(candidate)] ?? "application/octet-stream" });
        response.end(body);
        return;
      } catch (error) {
        if (!["ENOENT", "ENOTDIR"].includes(error.code)) throw error;
      }
    }
    response.writeHead(404).end("Not found");
  } catch (error) {
    console.error("Static preview request failed:", error);
    response.writeHead(500).end("Preview error");
  }
});
server.listen(port, "127.0.0.1", () => console.log(`Static export: http://127.0.0.1:${port}`));
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => server.close());
