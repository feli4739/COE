import { writeFile } from "node:fs/promises";
import path from "node:path";
import type { RunContext, RunReport } from "../types.js";

function esc(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function generateHtmlReport(runContext: RunContext, report: RunReport): Promise<void> {
  const scenarioRows = report.scenarios
    .map((scenario) => {
      const stepRows = scenario.steps
        .map((step) => {
          const statusClass = step.status === "passed" ? "ok" : "fail";
          const shot = step.screenshot
            ? `<a href="./${esc(step.screenshot)}" target="_blank">screenshot</a>`
            : "-";
          return `<tr>
            <td>${esc(step.name)}</td>
            <td><span class="badge ${statusClass}">${step.status}</span></td>
            <td>${step.durationMs}ms</td>
            <td>${shot}</td>
            <td>${step.error ? esc(step.error) : "-"}</td>
          </tr>`;
        })
        .join("");
      return `<section class="card">
        <h3>${esc(scenario.name)} <small>${scenario.tags.join(", ")}</small></h3>
        <table>
          <thead><tr><th>Step</th><th>Status</th><th>Duration</th><th>Evidence</th><th>Error</th></tr></thead>
          <tbody>${stepRows}</tbody>
        </table>
      </section>`;
    })
    .join("\n");

  const findings = (report.ai?.findings || [])
    .map(
      (f) => `<li><strong>${esc(f.title)}</strong> [${f.severity}]<br/>
      <em>Hypothesis:</em> ${esc(f.hypothesis)}<br/>
      <em>Suggested fix:</em> ${esc(f.suggestedFix)}</li>`
    )
    .join("");

  const videoBlock = report.artifacts.video
    ? `<video controls width="100%" src="./${esc(report.artifacts.video)}"></video>`
    : "<p>No video recorded.</p>";

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>FireBurst QA Report - ${esc(report.runId)}</title>
  <style>
    body { background:#0b0b0d; color:#f4f4f5; font-family: ui-sans-serif, system-ui; margin:0; padding:24px; }
    .wrap { max-width:1100px; margin:0 auto; }
    h1 { color:#ff3b30; margin:0 0 8px; }
    .meta { color:#a0a0ad; margin-bottom:18px; }
    .grid { display:grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap:12px; margin-bottom:20px; }
    .kpi { background:#121217; border:1px solid #242430; border-radius:12px; padding:12px; }
    .kpi .v { font-size:26px; font-weight:700; color:#fff; }
    .card { background:#121217; border:1px solid #242430; border-radius:12px; padding:14px; margin-bottom:14px; }
    table { width:100%; border-collapse: collapse; font-size:13px; }
    th, td { border-bottom:1px solid #232332; text-align:left; padding:8px 6px; vertical-align: top; }
    .badge { display:inline-block; padding:3px 8px; border-radius:999px; font-size:12px; text-transform:uppercase; font-weight:700; }
    .ok { background:#113b1d; color:#4ade80; }
    .fail { background:#421313; color:#f87171; }
    a { color:#ff5f57; }
    small { color:#aaa; font-weight: 400; }
    ul { margin:0; padding-left:20px; }
  </style>
</head>
<body>
<div class="wrap">
  <h1>FireBurst IT - QA Report</h1>
  <p class="meta">Run ${esc(report.runId)} | Base URL: ${esc(report.baseUrl)} | Env: ${esc(report.env)}</p>

  <div class="grid">
    <div class="kpi"><div>Total scenarios</div><div class="v">${report.totals.scenarios}</div></div>
    <div class="kpi"><div>Passed</div><div class="v">${report.totals.passed}</div></div>
    <div class="kpi"><div>Failed</div><div class="v">${report.totals.failed}</div></div>
    <div class="kpi"><div>Duration</div><div class="v">${Math.round(report.durationMs / 1000)}s</div></div>
  </div>

  <section class="card">
    <h3>Session Video</h3>
    ${videoBlock}
  </section>

  <section class="card">
    <h3>AI Analysis (${esc(report.ai?.model || "n/a")})</h3>
    <p>${esc(report.ai?.summary || "No AI summary")}</p>
    <ul>${findings || "<li>No findings</li>"}</ul>
  </section>

  ${scenarioRows}
</div>
</body>
</html>`;

  await writeFile(path.join(runContext.runDir, "report.html"), html, "utf8");
}
