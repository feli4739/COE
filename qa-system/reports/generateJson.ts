import path from "node:path";
import type { AiAnalysis, CollectorArtifacts, RunContext, RunReport, ScenarioResult } from "../types.js";
import { writeJson } from "../utils/fs.js";

interface BuildInput {
  runContext: RunContext;
  startedAt: Date;
  finishedAt: Date;
  scenarios: ScenarioResult[];
  artifacts: CollectorArtifacts;
  ai: AiAnalysis | undefined;
  videoPath?: string;
}

export async function generateJsonReport(input: BuildInput): Promise<RunReport> {
  const { runContext, startedAt, finishedAt, scenarios, ai, videoPath } = input;
  const passed = scenarios.filter((s) => s.status === "passed").length;
  const failed = scenarios.length - passed;
  const steps = scenarios.flatMap((s) => s.steps).length;

  const report: RunReport = {
    runId: runContext.runId,
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationMs: finishedAt.getTime() - startedAt.getTime(),
    baseUrl: runContext.config.baseUrl,
    env: runContext.config.qaEnv,
    tags: runContext.config.tags,
    totals: {
      scenarios: scenarios.length,
      passed,
      failed,
      steps,
    },
    scenarios,
    artifacts: {
      logs: "logs.json",
      errors: "errors.json",
      network: "network.json",
      screenshotsDir: "screenshots",
      video: videoPath,
    },
    ai,
  };

  await writeJson(path.join(runContext.runDir, "report.json"), report);
  return report;
}
