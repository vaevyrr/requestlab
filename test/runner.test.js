import test from "node:test";
import assert from "node:assert/strict";
import { runCollection } from "../src/runner.js";

test("undefined variables fail clearly", async () => {
  const results = await runCollection({ requests: [{ name: "missing", url: "{{nope}}" }] });
  assert.equal(results[0].passed, false);
  assert.match(results[0].error, /undefined variable/);
});

test("unsupported methods are rejected", async () => {
  const results = await runCollection({ requests: [{ name: "bad method", method: "TRACE", url: "https://example.com" }] });
  assert.equal(results[0].passed, false);
  assert.match(results[0].error, /unsupported method/);
});
