import { loadQaConfig } from "../qa-system/utils/config.js";
import { logger } from "../qa-system/utils/logger.js";
import { fireburstAdapter } from "../qa-system/runner/projectAdapter.js";
import { runQaPipeline } from "../qa-system/orchestrator/orchestrator.js";

function applyCliOverrides(): void {
  const args = process.argv.slice(2);
  for (const arg of args) {
    if (arg.startsWith("--tags=")) process.env.QA_TAGS = arg.slice("--tags=".length);
    if (arg.startsWith("--baseUrl=")) process.env.QA_BASE_URL = arg.slice("--baseUrl=".length);
    if (arg.startsWith("--env=")) process.env.QA_ENV = arg.slice("--env=".length);
    if (arg === "--headed") process.env.QA_HEADLESS = "false";
  }
}

async function main(): Promise<void> {
  applyCliOverrides();
  const config = loadQaConfig();
  const result = await runQaPipeline(config, fireburstAdapter);
  logger.info("Artifacts", result);
  if (!result.ok) process.exitCode = 1;
}

main().catch((error) => {
  logger.error("Fatal QA orchestrator failure", {
    message: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
