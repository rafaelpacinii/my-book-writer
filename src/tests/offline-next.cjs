// Next's development version notice must not block offline UI tests.
// Application requests and all other fetch errors keep their normal behavior.
const originalFetch = globalThis.fetch;
globalThis.fetch = (input, init) => {
  const url = input instanceof Request ? input.url : String(input);
  if (url === "https://registry.npmjs.org/-/package/next/dist-tags") {
    return Promise.reject(new Error("Next version lookup is unavailable in offline UI tests."));
  }
  return originalFetch(input, init);
};
