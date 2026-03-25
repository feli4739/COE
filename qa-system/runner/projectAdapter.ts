import type { ProjectAdapter } from "../types.js";
import { buildFireburstScenarios } from "./fireburstAdapter.js";

export const fireburstAdapter: ProjectAdapter = {
  name: "fireburst-coe",
  buildScenarios: () => buildFireburstScenarios(),
};
