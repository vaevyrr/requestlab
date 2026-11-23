import { readFile, writeFile } from "node:fs/promises";
import { runCollection } from "./runner.js";

const [collectionPath, ...args] = process.argv.slice(2);
if (!collectionPath) {
  console.error("Usage: node src/index.js collection.json [--env environment.json] [--report report.json]");
  process.exit(2);
}
function option(name) { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; }
try {
  const collection = JSON.parse(await readFile(collectionPath, "utf8"));
  if (!Array.isArray(collection.requests)) throw new Error("collection must contain a requests array");
  const envPath = option("--env");
  const environment = envPath ? JSON.parse(await readFile(envPath, "utf8")) : {};
  const results = await runCollection(collection, environment);
  for (const result of results) {
    console.log(`${result.passed ? "PASS" : "FAIL"}  ${result.name || "(unnamed)"}  ${result.status ?? ""}  ${result.durationMs ?? 0}ms`);
    if (result.error) console.log(`      ${result.error}`);
  }
  const report = { generatedAt: new Date().toISOString(), total: results.length,
    passed: results.filter(x => x.passed).length, failed: results.filter(x => !x.passed).length, results };
  const reportPath = option("--report");
  if (reportPath) await writeFile(reportPath, JSON.stringify(report, null, 2));
  process.exitCode = report.failed ? 1 : 0;
} catch (error) {
  console.error(`requestlab: ${error.message}`);
  process.exitCode = 2;
}
