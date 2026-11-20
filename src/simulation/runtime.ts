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

export interface LstmOperation {
  id: string;
  title: string;
  summary: string;
  timeStep: number;
  tensor: RenderableTensor;
  equation: string;
  inputTensorIds: string[];
}

const INPUT_FEATURES = 4;
const HIDDEN_UNITS = 4;
const GATE_COUNT = 4;

function seededUniform(count: number, seed: number, limit: number): number[] {
  let state = seed;
  return Array.from({ length: count }, () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return ((state / 0x1_0000_0000) * 2 - 1) * limit;
  });
}

function initializeWeights(inputSize: number, outputSize: number, seed: number): number[] {
  const limit = Math.sqrt(6 / (inputSize + outputSize));
  return seededUniform(inputSize * outputSize, seed, limit);
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

function tensor(
  id: string,
  name: string,
  values: number[],
  shape: number[],
  dimensions: string[],
  equation: string,
): RenderableTensor {
  return {
    id,
    name,
    shape,
    dimensions,
    equation,
    values,
    stats: calculateStats(values),
  };
}

function sigmoid(value: number): number {
  return 1 / (1 + Math.exp(-value));
}

function dotRow(weights: number[], row: number, columns: number, values: number[]): number {
  let result = 0;
  for (let column = 0; column < columns; column += 1) {
    result += weights[row * columns + column] * values[column];
  }
  return result;
}

function operation(
  id: string,
  title: string,
  summary: string,
  timeStep: number,
  result: RenderableTensor,
  inputTensorIds: string[],
): LstmOperation {
  return {
    id,
    title,
    summary,
    timeStep,
    tensor: result,
    equation: result.equation,
    inputTensorIds,
  };
}

export function runLstmForwardPass(inputSequence: number[][]): LstmOperation[] {
  const inputWeights = initializeWeights(INPUT_FEATURES, GATE_COUNT * HIDDEN_UNITS, 20260801);
  const recurrentWeights = initializeWeights(HIDDEN_UNITS, GATE_COUNT * HIDDEN_UNITS, 20260802);
  const outputWeights = initializeWeights(HIDDEN_UNITS, 1, 20260803);
  const biases = Array(GATE_COUNT * HIDDEN_UNITS).fill(0) as number[];
  const operations: LstmOperation[] = [
    operation(
      "weights-input",
      "Input weights",
      "The input-to-gate matrix is initialized deterministically with Xavier uniform values.",
      0,
      tensor("W_x", "Input weight matrix Wₓ", inputWeights, [GATE_COUNT * HIDDEN_UNITS, INPUT_FEATURES], ["gate × hidden units", "input features"], "Wₓ ∈ ℝ^{4H×D}"),
      [],
    ),
    operation(
      "weights-recurrent",
      "Recurrent weights",
      "The hidden-to-gate matrix carries information from the previous time step.",
      0,
      tensor("W_h", "Recurrent weight matrix Wₕ", recurrentWeights, [GATE_COUNT * HIDDEN_UNITS, HIDDEN_UNITS], ["gate × hidden units", "hidden units"], "Wₕ ∈ ℝ^{4H×H}"),
      [],
    ),
  ];

  let previousCell = Array(HIDDEN_UNITS).fill(0) as number[];
  let previousHidden = Array(HIDDEN_UNITS).fill(0) as number[];
  let previousHiddenId: string | null = null;
  let previousCellId: string | null = null;

  inputSequence.forEach((input, timeStep) => {
    const stepPrefix = `t${timeStep + 1}`;
    const inputId = `${stepPrefix}-input`;
    const inputTensor = tensor(
      inputId,
      `Input xₜ (step ${timeStep + 1})`,
      input,
      [1, INPUT_FEATURES],
      ["batch", "input features"],
      "xₜ ∈ ℝ^D",
    );
    operations.push(operation(inputId, `Input · step ${timeStep + 1}`, "The current feature vector enters the recurrent cell.", timeStep + 1, inputTensor, []));

    const preactivations = Array(GATE_COUNT * HIDDEN_UNITS).fill(0) as number[];
    for (let gateUnit = 0; gateUnit < GATE_COUNT * HIDDEN_UNITS; gateUnit += 1) {
      preactivations[gateUnit] =
        dotRow(inputWeights, gateUnit, INPUT_FEATURES, input) +
        dotRow(recurrentWeights, gateUnit, HIDDEN_UNITS, previousHidden) +
        biases[gateUnit];
    }

    const preactivationId = `${stepPrefix}-preactivation`;
    operations.push(
      operation(
        preactivationId,
        `Gate pre-activations · step ${timeStep + 1}`,
        "One fused matrix multiplication computes the four gate pre-activations.",
        timeStep + 1,
        tensor(preactivationId, "Gate pre-activations zₜ", preactivations, [GATE_COUNT, HIDDEN_UNITS], ["gates", "hidden units"], "zₜ = Wₓxₜ + Wₕhₜ₋₁ + b"),
        [inputId, "W_x", "W_h", ...(previousHiddenId ? [previousHiddenId] : [])],
      ),
    );

    const forget = preactivations.slice(0, HIDDEN_UNITS).map(sigmoid);
    const inputGate = preactivations.slice(HIDDEN_UNITS, 2 * HIDDEN_UNITS).map(sigmoid);
    const candidate = preactivations.slice(2 * HIDDEN_UNITS, 3 * HIDDEN_UNITS).map(Math.tanh);
    const outputGate = preactivations.slice(3 * HIDDEN_UNITS).map(sigmoid);
    const forgetId = `${stepPrefix}-forget`;
    const inputGateId = `${stepPrefix}-input-gate`;
    const candidateId = `${stepPrefix}-candidate`;
    const cellId = `${stepPrefix}-cell`;
    const outputGateId = `${stepPrefix}-output-gate`;
    const hiddenId = `${stepPrefix}-hidden`;
    const predictionId = `${stepPrefix}-prediction`;

    operations.push(operation(
      forgetId,
      `Forget gate · step ${timeStep + 1}`,
      "The sigmoid gate decides how much of the previous cell state to retain.",
      timeStep + 1,
      tensor(forgetId, "Forget gate fₜ", forget, [1, HIDDEN_UNITS], ["batch", "hidden units"], "fₜ = σ(z_f)"),
      [preactivationId],
    ));
    operations.push(operation(
      inputGateId,
      `Input gate · step ${timeStep + 1}`,
      "The sigmoid gate controls how much new candidate information enters memory.",
      timeStep + 1,
      tensor(inputGateId, "Input gate iₜ", inputGate, [1, HIDDEN_UNITS], ["batch", "hidden units"], "iₜ = σ(z_i)"),
      [preactivationId],
    ));
    operations.push(operation(
      candidateId,
      `Candidate memory · step ${timeStep + 1}`,
      "The tanh candidate supplies new information for the cell state.",
      timeStep + 1,
      tensor(candidateId, "Candidate memory gₜ", candidate, [1, HIDDEN_UNITS], ["batch", "hidden units"], "gₜ = tanh(z_g)"),
      [preactivationId],
    ));

    const cell = forget.map((value, index) => value * previousCell[index] + inputGate[index] * candidate[index]);
    operations.push(operation(
      cellId,
      `Cell state · step ${timeStep + 1}`,
      "The cell combines retained memory with the gated candidate.",
      timeStep + 1,
      tensor(cellId, "Cell state cₜ", cell, [1, HIDDEN_UNITS], ["batch", "hidden units"], "cₜ = fₜ ⊙ cₜ₋₁ + iₜ ⊙ gₜ"),
      [forgetId, inputGateId, candidateId, ...(previousCellId ? [previousCellId] : [])],
    ));

    operations.push(operation(
      outputGateId,
      `Output gate · step ${timeStep + 1}`,
      "The output gate selects which parts of the cell state become visible.",
      timeStep + 1,
      tensor(outputGateId, "Output gate oₜ", outputGate, [1, HIDDEN_UNITS], ["batch", "hidden units"], "oₜ = σ(z_o)"),
      [preactivationId],
    ));

    const hidden = outputGate.map((value, index) => value * Math.tanh(cell[index]));
    operations.push(operation(
      hiddenId,
      `Hidden state · step ${timeStep + 1}`,
      "The hidden state is the gated, squashed cell state passed to the next step.",
      timeStep + 1,
      tensor(hiddenId, "Hidden state hₜ", hidden, [1, HIDDEN_UNITS], ["batch", "hidden units"], "hₜ = oₜ ⊙ tanh(cₜ)"),
      [outputGateId, cellId],
    ));

    const prediction = hidden.reduce((sum, value, index) => sum + value * outputWeights[index], 0);
    operations.push(operation(
      predictionId,
      `Prediction · step ${timeStep + 1}`,
      "A linear readout maps the hidden state to a scalar prediction.",
      timeStep + 1,
      tensor(predictionId, "Prediction ŷₜ", [prediction], [1, 1], ["batch", "output"], "ŷₜ = W_yhₜ + b_y"),
      [hiddenId],
    ));

    previousCell = cell;
    previousHidden = hidden;
    previousCellId = cellId;
    previousHiddenId = hiddenId;
  });

  return operations;
}

export function createSimulationRun(modelId: ModelId, controls: SimulationControls): SimulationRun {
  return {
    runId: `${modelId}-${Date.now()}`,
    modelId,
    controls,
    step: 0,
  };
}
