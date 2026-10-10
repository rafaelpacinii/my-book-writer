const BLOCKED_TAGS = "script, style, iframe, object, embed, link, meta, base, form, input, button, textarea, select";
const URL_ATTRIBUTES = new Set(["href", "src", "xlink:href", "action", "formaction"]);
const UNSAFE_URL = /^(javascript:|vbscript:|data:text\/html)/;

/** Strips active content from saved chapter HTML before rendering it read-only. */
export function sanitizeHtml(html: string): string {
  if (typeof DOMParser === "undefined") return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.body.querySelectorAll(BLOCKED_TAGS).forEach((node) => node.remove());
  for (const element of doc.body.querySelectorAll("*")) {
    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.replace(/\s/g, "").toLowerCase();
      if (name.startsWith("on") || (URL_ATTRIBUTES.has(name) && UNSAFE_URL.test(value))) {
        element.removeAttribute(attribute.name);
      }
    }
  }
  return doc.body.innerHTML;
}
