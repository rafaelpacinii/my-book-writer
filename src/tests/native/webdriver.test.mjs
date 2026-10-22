import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";
import { request } from "./webdriver.mjs";

afterEach(() => mock.restoreAll());

test("session creation allows cold WebView2 startup without relaxing ordinary commands", async () => {
  const durations = [];
  mock.method(AbortSignal, "timeout", (duration) => {
    durations.push(duration);
    return new AbortController().signal;
  });
  const fetch = mock.method(globalThis, "fetch", async () => Response.json({ value: { sessionId: "test" } }));
  assert.deepEqual(await request("/session", { capabilities: {} }), { sessionId: "test" });
  await request("/status");
  await request("/session/test", undefined, "DELETE");
  assert.deepEqual(durations, [120_000, 15_000, 15_000]);
  assert.equal(fetch.mock.calls[0].arguments[1].method, "POST");
  assert.equal(fetch.mock.calls[2].arguments[1].method, "DELETE");
});

test("transport failure identifies the command and preserves its timeout cause", async () => {
  const cause = new DOMException("Timed out", "TimeoutError");
  mock.method(globalThis, "fetch", async () => { throw cause; });
  await assert.rejects(request("/session", {}), (error) => {
    assert.match(error.message, /POST \/session.*120000ms/);
    assert.equal(error.cause, cause);
    return true;
  });
});

test("WebDriver errors preserve the server's reason and HTTP status", async () => {
  mock.method(globalThis, "fetch", async () => Response.json({
    value: { error: "session not created", message: "WebView2 runtime mismatch" },
  }, { status: 500 }));
  await assert.rejects(request("/session", {}), /POST \/session.*HTTP 500.*WebView2 runtime mismatch/);
});

test("a malformed driver response identifies the failing endpoint", async () => {
  mock.method(globalThis, "fetch", async () => new Response("not JSON"));
  await assert.rejects(request("/status"), (error) => {
    assert.match(error.message, /GET \/status/);
    assert.ok(error.cause instanceof SyntaxError);
    return true;
  });
});
