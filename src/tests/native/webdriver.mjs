import { setTimeout as delay } from "node:timers/promises";

const endpoint = "http://127.0.0.1:4444";
export async function request(path, body, method = body === undefined ? "GET" : "POST") {
  const response = await fetch(endpoint + path, {
    method,
    headers: { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  });
  const result = await response.json();
  if (!response.ok || result.value?.error) throw new Error(JSON.stringify(result.value));
  return result.value;
}

export async function waitUntil(action, description, timeout = 30_000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await action()) return;
    await delay(100);
  }
  throw new Error(`Timeout: ${description}`);
}

export function client(sessionId) {
  const path = `/session/${sessionId}`;
  const execute = (script, args = []) => request(path + "/execute/sync", { script, args });
  const click = async (selector) => {
    const element = await request(path + "/element", { using: "css selector", value: selector });
    await request(path + `/element/${element["element-6066-11e4-a52e-4f735466cecf"]}/click`, {});
  };
  return {
    execute,
    executeAsync: (script, args = []) => request(path + "/execute/async", { script, args }),
    click,
    async type(selector, text) {
      const element = await request(path + "/element", { using: "css selector", value: selector });
      const id = element["element-6066-11e4-a52e-4f735466cecf"];
      await request(path + `/element/${id}/value`, { text });
    },
    resize: (width, height) => request(path + "/window/rect", { width, height }),
    screenshot: () => request(path + "/screenshot"),
    close: () => request(path, undefined, "DELETE"),
  };
}
