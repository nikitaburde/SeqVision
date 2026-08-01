import type { ModelId, SimulationControls } from "@/types";

export interface SimulationRun {
  runId: string;
  modelId: ModelId;
  controls: SimulationControls;
  step: number;
}

export function createSimulationRun(modelId: ModelId, controls: SimulationControls): SimulationRun {
  return {
    runId: `${modelId}-${Date.now()}`,
    modelId,
    controls,
    step: 0,
  };
}
