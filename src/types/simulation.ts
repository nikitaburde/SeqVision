import type { ModelId } from "./model";

export interface SimulationControls {
  layers: number;
  hiddenUnits: number;
  sequenceLength: number;
  batchSize: number;
  learningRate: number;
  animationSpeed: number;
}

export interface SimulationState {
  runId: string;
  modelId: ModelId;
  timeStep: number;
  playing: boolean;
  controls: SimulationControls;
}
