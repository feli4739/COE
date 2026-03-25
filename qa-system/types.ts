export type QaTag = "smoke" | "regression" | "api";

export interface QaConfig {
  baseUrl: string;
  email: string;
  password: string;
  outputDir: string;
  ollamaModel: string;
  ollamaUrl: string;
  qaEnv: "dev" | "staging" | "prod";
  tags: QaTag[];
  headless: boolean;
  timeoutMs: number;
  retries: number;
}

export interface RunContext {
  runId: string;
  startedAt: string;
  runDir: string;
  screenshotsDir: string;
  config: QaConfig;
}

export type StepStatus = "passed" | "failed";

export interface StepResult {
  name: string;
  status: StepStatus;
  startedAt: string;
  endedAt: string;
  durationMs: number;
  attempt: number;
  tags: QaTag[];
  message?: string;
  screenshot?: string;
  error?: string;
}

export interface ScenarioResult {
  name: string;
  tags: QaTag[];
  status: StepStatus;
  steps: StepResult[];
}

export interface ConsoleLogEntry {
  timestamp: string;
  type: string;
  text: string;
}

export interface ErrorEntry {
  timestamp: string;
  source: "pageerror" | "step" | "runtime";
  message: string;
  stack?: string;
  step?: string;
}

export interface NetworkEntry {
  timestamp: string;
  method: string;
  url: string;
  status?: number;
  requestHeaders?: Record<string, string>;
  responseHeaders?: Record<string, string>;
  requestBody?: string;
  responseBody?: string;
  durationMs?: number;
}

export interface CollectorArtifacts {
  logs: ConsoleLogEntry[];
  errors: ErrorEntry[];
  network: NetworkEntry[];
}

export interface AiFinding {
  title: string;
  severity: "low" | "medium" | "high";
  hypothesis: string;
  suggestedFix: string;
  evidence?: string[];
}

export interface AiAnalysis {
  model: string;
  generatedAt: string;
  summary: string;
  findings: AiFinding[];
  raw?: string;
  unavailableReason?: string;
}

export interface RunReport {
  runId: string;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  baseUrl: string;
  env: string;
  tags: QaTag[];
  totals: {
    scenarios: number;
    passed: number;
    failed: number;
    steps: number;
  };
  scenarios: ScenarioResult[];
  artifacts: {
    logs: string;
    errors: string;
    network: string;
    screenshotsDir: string;
    video?: string;
  };
  ai?: AiAnalysis;
}

export interface ProjectAdapter {
  name: string;
  buildScenarios: () => ScenarioDefinition[];
}

export interface ScenarioDefinition {
  name: string;
  tags: QaTag[];
  run: ScenarioRunner;
}

export interface ScenarioRunnerInput {
  page: import("playwright").Page;
  context: import("playwright").BrowserContext;
  collector: import("./collector/collector").DataCollector;
  runContext: RunContext;
  config: QaConfig;
}

export type ScenarioRunner = (input: ScenarioRunnerInput) => Promise<StepResult[]>;
