import type { ModelId, SimulationControls, TensorDescriptor } from "@/types";

export interface SimulationRun {
  runId: string;
  modelId: ModelId;
  controls: SimulationControls;
  step: number;
}

export interface RenderableTensor extends TensorDescriptor {
  equation: string;
}

const INPUT_VALUES = [0.12, -0.34, 0.56, 0.78, -0.9, 0.21, 0.43, -0.65, 0.87, -0.09, 0.31, 0.52];

function calculateStats(values: number[]) {
  const mean = values.reduce((total, value) => total + value, 0) / values.length;
  const variance = values.reduce((total, value) => total + (value - mean) ** 2, 0) / values.length;

  return {
    mean,
    variance,
    min: Math.min(...values),
    max: Math.max(...values),
    memoryBytes: values.length * Float32Array.BYTES_PER_ELEMENT,
    distribution: values,
  };
}

export function createSimulationRun(modelId: ModelId, controls: SimulationControls): SimulationRun {
  return {
    runId: `${modelId}-${Date.now()}`,
    modelId,
    controls,
    step: 0,
  };
}

export function getPhaseATensor(modelId: ModelId): RenderableTensor | null {
  if (modelId !== "lstm") {
    return null;
  }

  return {
    id: "lstm-input-sequence",
    name: "Input sequence x",
    shape: [3, 4],
    dimensions: ["time steps", "input features"],
    equation: "x = [x₁, x₂, x₃] ∈ ℝ^{3×4}",
    values: INPUT_VALUES,
    stats: calculateStats(INPUT_VALUES),
  };
}
