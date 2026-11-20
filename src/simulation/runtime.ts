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

const LSTM_INPUT_FEATURES = 4;
const LSTM_HIDDEN_UNITS = 4;
const LSTM_GATE_COUNT = 4;
const LSTM_INPUT_WEIGHT_SEED = 20260801;

function initializeLstmInputWeights(): number[] {
  const rows = LSTM_GATE_COUNT * LSTM_HIDDEN_UNITS;
  const limit = Math.sqrt((6 / (LSTM_INPUT_FEATURES + rows)));
  let state = LSTM_INPUT_WEIGHT_SEED;

  return Array.from({ length: rows * LSTM_INPUT_FEATURES }, () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return ((state / 0x1_0000_0000) * 2 - 1) * limit;
  });
}

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

  const rows = LSTM_GATE_COUNT * LSTM_HIDDEN_UNITS;
  const values = initializeLstmInputWeights();

  return {
    id: "lstm-input-weights",
    name: "LSTM input weight matrix Wₓ",
    shape: [rows, LSTM_INPUT_FEATURES],
    dimensions: ["gate × hidden units", "input features"],
    weightMatrix: "Wₓ",
    bias: "bₓ",
    equation: "zₜ = Wₓxₜ + bₓ,  Wₓ ∈ ℝ^{4H×D}",
    values,
    stats: calculateStats(values),
  };
}
