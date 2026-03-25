import type { BrowserContext, Page, Request, Response } from "playwright";
import type { CollectorArtifacts, ErrorEntry, NetworkEntry, RunContext } from "../types.js";
import { sanitizeHeaders, sanitizeText } from "../utils/sanitize.js";

export class DataCollector {
  private artifacts: CollectorArtifacts = {
    logs: [],
    errors: [],
    network: [],
  };

  private requestStartMap = new Map<Request, number>();

  constructor(private readonly runContext: RunContext) {}

  attach(context: BrowserContext, page: Page): void {
    page.on("console", (msg) => {
      this.artifacts.logs.push({
        timestamp: new Date().toISOString(),
        type: msg.type(),
        text: sanitizeText(msg.text()),
      });
    });

    page.on("pageerror", (error) => {
      this.pushError({
        timestamp: new Date().toISOString(),
        source: "pageerror",
        message: sanitizeText(error.message),
        stack: error.stack ? sanitizeText(error.stack) : undefined,
      });
    });

    context.on("request", (request) => {
      this.requestStartMap.set(request, Date.now());
    });

    context.on("response", async (response) => {
      await this.captureResponse(response);
    });
  }

  pushError(entry: ErrorEntry): void {
    this.artifacts.errors.push({
      ...entry,
      message: sanitizeText(entry.message),
      stack: entry.stack ? sanitizeText(entry.stack) : undefined,
    });
  }

  getArtifacts(): CollectorArtifacts {
    return this.artifacts;
  }

  private async captureResponse(response: Response): Promise<void> {
    const request = response.request();
    const start = this.requestStartMap.get(request) ?? Date.now();
    const durationMs = Date.now() - start;
    this.requestStartMap.delete(request);

    let responseBody: string | undefined;
    try {
      const ct = response.headers()["content-type"] || "";
      if (ct.includes("application/json") || ct.includes("text/")) {
        responseBody = sanitizeText((await response.text()).slice(0, 4000));
      }
    } catch {
      responseBody = undefined;
    }

    const requestBody = request.postData();
    const entry: NetworkEntry = {
      timestamp: new Date().toISOString(),
      method: request.method(),
      url: request.url(),
      status: response.status(),
      requestHeaders: sanitizeHeaders(request.headers()),
      responseHeaders: sanitizeHeaders(response.headers()),
      requestBody: requestBody ? sanitizeText(requestBody.slice(0, 4000)) : undefined,
      responseBody,
      durationMs,
    };
    this.artifacts.network.push(entry);
  }
}
