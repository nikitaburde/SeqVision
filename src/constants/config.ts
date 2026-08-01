import type { SimulationControls } from "@/types";

export const DEFAULT_CONTROLS: SimulationControls = {
  layers: 2,
  hiddenUnits: 128,
  sequenceLength: 128,
  batchSize: 8,
  learningRate: 0.001,
  animationSpeed: 1,
};

export const CONTROL_LIMITS = {
  layers: { min: 1, max: 24 },
  hiddenUnits: { min: 16, max: 2048 },
  sequenceLength: { min: 10, max: 10_000 },
  batchSize: { min: 1, max: 128 },
  learningRate: { min: 0.00001, max: 0.5 },
  animationSpeed: { min: 0.25, max: 3 },
};
