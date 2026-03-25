import type { AiAnalysis, CollectorArtifacts, QaConfig, ScenarioResult } from "../types.js";

interface OllamaResponse {
  response?: string;
  message?: { content?: string };
}

function buildPrompt(scenarios: ScenarioResult[], artifacts: CollectorArtifacts): string {
  const failed = scenarios.filter((s) => s.status === "failed");
  const payload = {
    failedScenarios: failed,
    recentErrors: artifacts.errors.slice(-20),
    recentNetwork: artifacts.network.slice(-40),
  };
  return [
    "You are an expert QA failure analyzer.",
    "Analyze the failures and return JSON with schema:",
    "{ summary: string, findings: [{ title, severity: low|medium|high, hypothesis, suggestedFix, evidence: string[] }] }",
    "Be concise, technical, and actionable.",
    JSON.stringify(payload),
  ].join("\n");
}

function extractJson(text: string): { summary: string; findings: AiAnalysis["findings"] } | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  const slice = text.slice(start, end + 1);
  try {
    const parsed = JSON.parse(slice) as { summary: string; findings: AiAnalysis["findings"] };
    if (!parsed || !Array.isArray(parsed.findings)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function runOllamaAnalysis(
  config: QaConfig,
  scenarios: ScenarioResult[],
  artifacts: CollectorArtifacts
): Promise<AiAnalysis> {
  if (!scenarios.some((s) => s.status === "failed")) {
    return {
      model: config.ollamaModel,
      generatedAt: new Date().toISOString(),
      summary: "No failures detected. AI analysis skipped.",
      findings: [],
    };
  }

  try {
    const res = await fetch(`${config.ollamaUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: config.ollamaModel,
        prompt: buildPrompt(scenarios, artifacts),
        stream: false,
      }),
    });
    if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);

    const body = (await res.json()) as OllamaResponse;
    const raw = body.response || body.message?.content || "";
    const parsed = extractJson(raw);
    if (!parsed) {
      return {
        model: config.ollamaModel,
        generatedAt: new Date().toISOString(),
        summary: "AI returned non-JSON output. Check raw output.",
        findings: [],
        raw,
      };
    }

    return {
      model: config.ollamaModel,
      generatedAt: new Date().toISOString(),
      summary: parsed.summary,
      findings: parsed.findings,
      raw,
    };
  } catch (error) {
    return {
      model: config.ollamaModel,
      generatedAt: new Date().toISOString(),
      summary: "AI analysis unavailable",
      findings: [],
      unavailableReason: error instanceof Error ? error.message : String(error),
    };
  }
}
