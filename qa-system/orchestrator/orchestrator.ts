import path from "node:path";
import { DataCollector } from "../collector/collector.js";
import type { ProjectAdapter, QaConfig, RunContext } from "../types.js";
import { makeRunId } from "../utils/ids.js";
import { ensureDir, writeJson } from "../utils/fs.js";
import { logger } from "../utils/logger.js";
import { runScenarios } from "../runner/runner.js";
import { runOllamaAnalysis } from "../ai/ollama.js";
import { generateJsonReport } from "../reports/generateJson.js";
import { generateHtmlReport } from "../reports/generateHtml.js";

export interface OrchestratorOutput {
  runDir: string;
  reportPath: string;
  htmlPath: string;
  ok: boolean;
}

export async function runQaPipeline(
  config: QaConfig,
  adapter: ProjectAdapter
): Promise<OrchestratorOutput> {
  const startedAt = new Date();
  const runId = makeRunId(startedAt);
  const runDir = path.join(config.outputDir, runId);
  const screenshotsDir = path.join(runDir, "screenshots");

  const runContext: RunContext = {
    runId,
    startedAt: startedAt.toISOString(),
    runDir,
    screenshotsDir,
    config,
  };

  await ensureDir(runDir);
  await ensureDir(screenshotsDir);
  logger.info("QA run started", { runId, runDir, tags: config.tags, env: config.qaEnv });

  const collector = new DataCollector(runContext);
  const scenarios = adapter.buildScenarios();
  const runnerOut = await runScenarios(runContext, config, collector, scenarios);
  const artifacts = collector.getArtifacts();

  await writeJson(path.join(runDir, "logs.json"), artifacts.logs);
  await writeJson(path.join(runDir, "network.json"), artifacts.network);
  await writeJson(path.join(runDir, "errors.json"), artifacts.errors);

  const ai = await runOllamaAnalysis(config, runnerOut.scenarios, artifacts);
  const finishedAt = new Date();
  const report = await generateJsonReport({
    runContext,
    startedAt,
    finishedAt,
    scenarios: runnerOut.scenarios,
    artifacts,
    ai,
    videoPath: runnerOut.videoPath,
  });
  await generateHtmlReport(runContext, report);

  const ok = report.totals.failed === 0;
  logger.info("QA run finished", { runId, ok, failed: report.totals.failed });
  return {
    runDir,
    reportPath: path.join(runDir, "report.json"),
    htmlPath: path.join(runDir, "report.html"),
    ok,
  };
}
