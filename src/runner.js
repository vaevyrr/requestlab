const METHODS = new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]);

function replaceVariables(value, vars) {
  if (typeof value === "string") {
    return value.replace(/\{\{([\w.-]+)\}\}/g, (match, key) => {
      if (!(key in vars)) throw new Error(`undefined variable: ${key}`);
      return String(vars[key]);
    });
  }
  if (Array.isArray(value)) return value.map(item => replaceVariables(item, vars));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, replaceVariables(v, vars)]));
  }
  return value;
}

export async function runRequest(request, variables = {}) {
  const started = Date.now();
  const method = (request.method || "GET").toUpperCase();
  if (!METHODS.has(method)) throw new Error(`unsupported method: ${method}`);
  const url = replaceVariables(request.url, variables);
  const headers = replaceVariables(request.headers || {}, variables);
  const bodyValue = replaceVariables(request.body, variables);
  const body = bodyValue === undefined ? undefined :
    (typeof bodyValue === "string" ? bodyValue : JSON.stringify(bodyValue));
  try {
    const response = await fetch(url, { method, headers, body,
      signal: AbortSignal.timeout(request.timeoutMs || 10000) });
    const text = await response.text();
    const expected = request.expectStatus ?? 200;
    return { name: request.name, method, url, status: response.status,
      expectedStatus: expected, passed: response.status === expected,
      durationMs: Date.now() - started, bodyPreview: text.slice(0, 500),
      error: null };
  } catch (error) {
    return { name: request.name, method, url, passed: false,
      durationMs: Date.now() - started, error: error.message };
  }
}

export async function runCollection(collection, environment = {}) {
  const variables = { ...(collection.variables || {}), ...environment };
  const results = [];
  for (const request of collection.requests || []) {
    try {
      results.push(await runRequest(request, variables));
    } catch (error) {
      results.push({ name: request.name, passed: false, error: error.message });
    }
  }
  return results;
}
