import { chromium } from "playwright";
import path from "node:path";
import { copyFile } from "node:fs/promises";
import type { DataCollector } from "../collector/collector.js";
import type {
  QaConfig,
  QaTag,
  RunContext,
  ScenarioDefinition,
  ScenarioResult,
  StepResult,
} from "../types.js";

function hasAnyTag(scenarioTags: QaTag[], selectedTags: QaTag[]): boolean {
  return scenarioTags.some((tag) => selectedTags.includes(tag));
}

export interface RunnerOutput {
  scenarios: ScenarioResult[];
  videoPath?: string;
}

export async function runScenarios(
  runContext: RunContext,
  config: QaConfig,
  collector: DataCollector,
  scenarios: ScenarioDefinition[]
): Promise<RunnerOutput> {
  const selected = scenarios.filter((s) => hasAnyTag(s.tags, config.tags));
  const browser = await chromium.launch({ headless: config.headless });
  const videoDir = path.join(runContext.runDir, "_raw-video");
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: videoDir, size: { width: 1440, height: 900 } },
  });
  const page = await context.newPage();
  collector.attach(context, page);

  const results: ScenarioResult[] = [];
  for (const scenario of selected) {
    const steps: StepResult[] = await scenario.run({
      page,
      context,
      collector,
      runContext,
      config,
    });
    const status = steps.every((s) => s.status === "passed") ? "passed" : "failed";
    results.push({
      name: scenario.name,
      tags: scenario.tags,
      status,
      steps,
    });

    if (status === "failed") {
      break;
    }
  }

  const pageVideo = page.video();
  await context.close();
  await browser.close();

  if (!pageVideo) {
    return { scenarios: results };
  }

  const finalVideo = path.join(runContext.runDir, "video.mp4");
  const sourcePath = await pageVideo.path();
  await copyFile(sourcePath, finalVideo);
  return {
    scenarios: results,
    videoPath: "video.mp4",
  };
}
