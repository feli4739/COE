import type { ScenarioDefinition, ScenarioRunnerInput } from "../types.js";
import { executeStep } from "./step.js";
import { makePersonSeed } from "../utils/ids.js";

async function runAuthFlow(input: ScenarioRunnerInput) {
  const { page, collector, runContext, config } = input;
  const steps = [];

  steps.push(
    await executeStep({
      name: "Open login page",
      tags: ["smoke", "regression"],
      page,
      collector,
      runContext,
      retries: config.retries,
      timeoutMs: config.timeoutMs,
      fn: async () => {
        await page.goto(`${config.baseUrl}/login`, { waitUntil: "networkidle" });
        await page.getByRole("button", { name: "Ingresar" }).waitFor();
      },
    })
  );

  steps.push(
    await executeStep({
      name: "Submit credentials",
      tags: ["smoke", "regression", "api"],
      page,
      collector,
      runContext,
      retries: config.retries,
      timeoutMs: config.timeoutMs,
      fn: async () => {
        await page.locator('input[type="email"]').first().fill(config.email);
        await page.locator('input[type="password"]').first().fill(config.password);
        const loginResponse = page.waitForResponse((resp) => {
          return resp.url().includes("/auth/login") && resp.request().method() === "POST";
        });
        await page.getByRole("button", { name: "Ingresar" }).click();
        const resp = await loginResponse;
        if (resp.status() !== 200) throw new Error(`Login failed with status ${resp.status()}`);
        await page.waitForFunction(() => {
          const raw = localStorage.getItem("fireburst-auth");
          return Boolean(raw && raw.includes("token"));
        });
      },
    })
  );

  return steps;
}

async function runDashboardFlow(input: ScenarioRunnerInput) {
  const { page, collector, runContext, config } = input;
  const steps = [];
  steps.push(
    await executeStep({
      name: "Validate dashboard stats",
      tags: ["smoke", "regression", "api"],
      page,
      collector,
      runContext,
      retries: config.retries,
      timeoutMs: config.timeoutMs,
      fn: async () => {
        await page.goto(`${config.baseUrl}/`, { waitUntil: "networkidle" });
        await page.getByRole("heading", { name: "Dashboard" }).waitFor();
        await page.getByText("Total personas").waitFor();
        const statsResp = await page.waitForResponse((resp) => resp.url().includes("/stats"));
        if (statsResp.status() !== 200) throw new Error(`/stats returned ${statsResp.status()}`);
      },
    })
  );
  return steps;
}

async function runPeopleCrudFlow(input: ScenarioRunnerInput) {
  const { page, collector, runContext, config } = input;
  const steps = [];
  const seed = makePersonSeed();
  const dni = `${Date.now().toString().slice(-8)}`;

  steps.push(
    await executeStep({
      name: "Open people list",
      tags: ["smoke", "regression"],
      page,
      collector,
      runContext,
      retries: config.retries,
      timeoutMs: config.timeoutMs,
      fn: async () => {
        await page.goto(`${config.baseUrl}/people`, { waitUntil: "networkidle" });
        await page.getByRole("heading", { name: "Personas" }).waitFor();
      },
    })
  );

  steps.push(
    await executeStep({
      name: "Create person",
      tags: ["regression", "api"],
      page,
      collector,
      runContext,
      retries: config.retries,
      timeoutMs: config.timeoutMs,
      fn: async () => {
        await page.goto(`${config.baseUrl}/people/new`, { waitUntil: "networkidle" });
        await page.getByLabel("Apellido").fill(`AUTO-${seed}`);
        await page.getByLabel("Nombre").fill("QA");
        await page.getByLabel("DNI").fill(dni);
        await page.getByLabel("Fecha de nacimiento").fill("1990-01-01");
        const createResp = page.waitForResponse(
          (resp) => resp.url().includes("/people") && resp.request().method() === "POST"
        );
        await page.getByRole("button", { name: "Guardar" }).click();
        const resp = await createResp;
        if (resp.status() !== 201) throw new Error(`Create person failed with status ${resp.status()}`);
        await page.waitForURL(/\/people\/.+/);
      },
    })
  );

  steps.push(
    await executeStep({
      name: "Edit person",
      tags: ["regression", "api"],
      page,
      collector,
      runContext,
      retries: config.retries,
      timeoutMs: config.timeoutMs,
      fn: async () => {
        await page.getByRole("button", { name: "Editar" }).click();
        await page.waitForURL(/\/edit$/);
        await page.getByLabel("Nombre").fill("QA-EDIT");
        const updateResp = page.waitForResponse(
          (resp) => resp.url().includes("/people/") && resp.request().method() === "PUT"
        );
        await page.getByRole("button", { name: "Guardar" }).click();
        const resp = await updateResp;
        if (resp.status() !== 200) throw new Error(`Edit person failed with status ${resp.status()}`);
      },
    })
  );

  steps.push(
    await executeStep({
      name: "Soft delete person",
      tags: ["regression", "api"],
      page,
      collector,
      runContext,
      retries: config.retries,
      timeoutMs: config.timeoutMs,
      fn: async () => {
        page.once("dialog", async (dialog) => dialog.accept());
        const deleteResp = page.waitForResponse(
          (resp) => resp.url().includes("/people/") && resp.request().method() === "DELETE"
        );
        await page.getByRole("button", { name: "Dar de baja" }).click();
        const resp = await deleteResp;
        if (resp.status() !== 204) throw new Error(`Delete person failed with status ${resp.status()}`);
        await page.waitForURL(/\/people$/);
      },
    })
  );

  return steps;
}

export function buildFireburstScenarios(): ScenarioDefinition[] {
  return [
    {
      name: "auth-flow",
      tags: ["smoke", "regression", "api"],
      run: runAuthFlow,
    },
    {
      name: "dashboard-flow",
      tags: ["smoke", "regression", "api"],
      run: runDashboardFlow,
    },
    {
      name: "people-crud-flow",
      tags: ["regression", "api"],
      run: runPeopleCrudFlow,
    },
  ];
}
