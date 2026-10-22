import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import ts from "typescript";

const violations = [];
async function inspect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!["prototype", "test-results", "playwright-report"].includes(entry.name)) await inspect(path);
      continue;
    }
    if (!/\.tsx?$/.test(path)) continue;
    const source = await readFile(path, "utf8");
    if (path.endsWith(".tsx") && source.trimEnd().split("\n").length > 70) violations.push(`${path}: exceeds 70 TSX lines`);
    const tree = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true,
      path.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    function visit(node) {
      if (node.kind === ts.SyntaxKind.AnyKeyword) violations.push(`${path}: explicit any requires review`);
      if (entry.name === "page.tsx" && (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node))) {
        const tag = ts.isJsxElement(node) ? node.openingElement.tagName : node.tagName;
        if (ts.isIdentifier(tag) && /^[a-z]/.test(tag.text)) violations.push(`${path}: route files must only compose components`);
      }
      ts.forEachChild(node, visit);
    }
    visit(tree);
  }
}
await inspect("src");
if (violations.length) {
  console.error(violations.join("\n"));
  process.exitCode = 1;
} else console.log("UI structure checks passed: TSX size, explicit types and route composition.");
