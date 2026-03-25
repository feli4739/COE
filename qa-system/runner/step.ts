import path from "node:path";
import type { Page } from "playwright";
import type { DataCollector } from "../collector/collector.js";
import type { QaTag, RunContext, StepResult } from "../types.js";
import { safeError } from "../utils/sanitize.js";

interface StepInput {
  name: string;
  tags: QaTag[];
  page: Page;
  collector: DataCollector;
  runContext: RunContext;
  retries: number;
  timeoutMs: number;
  fn: () => Promise<void>;
}

export async function executeStep(input: StepInput): Promise<StepResult> {
  const { name, tags, page, collector, runContext, retries, timeoutMs, fn } = input;
  const startedAt = new Date().toISOString();

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    const attemptStart = Date.now();
    try {
      await withTimeout(fn(), timeoutMs, `${name} timeout after ${timeoutMs}ms`);
      const screenshot = await saveStepShot(page, runContext, name, "ok", attempt);
      return {
        name,
        status: "passed",
        startedAt,
        endedAt: new Date().toISOString(),
        durationMs: Date.now() - attemptStart,
        attempt,
        tags,
        screenshot,
      };
    } catch (error) {
      const errorText = safeError(error);
      const screenshot = await saveStepShot(page, runContext, name, "fail", attempt);
      collector.pushError({
        timestamp: new Date().toISOString(),
        source: "step",
        message: errorText,
        step: name,
      });

      if (attempt > retries) {
        return {
          name,
          status: "failed",
          startedAt,
          endedAt: new Date().toISOString(),
          durationMs: Date.now() - attemptStart,
          attempt,
          tags,
          screenshot,
          error: errorText,
          message: `Failed after ${attempt} attempt(s)`,
        };
      }
    }
  }

  throw new Error("unreachable");
}

async function saveStepShot(
  page: Page,
  runContext: RunContext,
  stepName: string,
  status: "ok" | "fail",
  attempt: number
): Promise<string | undefined> {
  try {
    const clean = stepName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const fileName = `${Date.now()}-${clean}-${status}-a${attempt}.png`;
    const fullPath = path.join(runContext.screenshotsDir, fileName);
    await page.screenshot({ path: fullPath, fullPage: true });
    return `screenshots/${fileName}`;
  } catch {
    return undefined;
  }
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error(message)), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
