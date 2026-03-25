import "dotenv/config";
import path from "node:path";
import type { QaConfig, QaTag } from "../types.js";

const VALID_TAGS: QaTag[] = ["smoke", "regression", "api"];

function parseTags(raw: string | undefined): QaTag[] {
  if (!raw || raw.trim() === "") return ["smoke", "regression", "api"];
  const tags = raw
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean) as QaTag[];
  return tags.filter((t) => VALID_TAGS.includes(t));
}

function parseBoolean(raw: string | undefined, fallback: boolean): boolean {
  if (raw === undefined) return fallback;
  return ["1", "true", "yes", "on"].includes(raw.toLowerCase());
}

function parseIntSafe(raw: string | undefined, fallback: number): number {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function loadQaConfig(): QaConfig {
  const baseUrl = process.env.QA_BASE_URL;
  const email = process.env.QA_EMAIL;
  const password = process.env.QA_PASSWORD;

  if (!baseUrl) throw new Error("Missing QA_BASE_URL");
  if (!email) throw new Error("Missing QA_EMAIL");
  if (!password) throw new Error("Missing QA_PASSWORD");

  const qaEnv = (process.env.QA_ENV || "dev") as "dev" | "staging" | "prod";
  return {
    baseUrl,
    email,
    password,
    outputDir: path.resolve(process.env.QA_OUTPUT_DIR || "qa-runs"),
    ollamaModel: process.env.OLLAMA_MODEL || "llama3.1:8b",
    ollamaUrl: process.env.OLLAMA_URL || "http://127.0.0.1:11434",
    qaEnv,
    tags: parseTags(process.env.QA_TAGS),
    headless: parseBoolean(process.env.QA_HEADLESS, true),
    timeoutMs: parseIntSafe(process.env.QA_TIMEOUT_MS, 25_000),
    retries: parseIntSafe(process.env.QA_RETRIES, 1),
  };
}
