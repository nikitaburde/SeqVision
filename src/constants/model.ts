import type { ComparePreset, DatasetSpec, ModelId, ModelSpec } from "@/types";

export const MODEL_SPECS: Record<ModelId, ModelSpec> = {
  lstm: {
    id: "lstm",
    name: "LSTM",
    shortDescription: "Gate-level recurrent memory with explicit cell state.",
    complexity: "O(k·n)",
    status: "mvp",
    chapters: [
      "Input Weights",
      "Recurrent Weights",
      "Input",
      "Gate Pre-activations",
      "Forget Gate",
      "Input Gate",
      "Candidate Memory",
      "Cell State",
      "Output Gate",
      "Hidden State",
      "Prediction",
    ].map((title, index) => ({
      id: `lstm-${index + 1}`,
      title,
      summary: `Inspect the computed ${title.toLowerCase()} in the LSTM forward pass.`,
      operationFocus: ["matmul", "activation", "state-update"],
    })),
  },
  xlstm: {
    id: "xlstm",
    name: "xLSTM",
    shortDescription: "Long-context recurrent model with matrix memory and exponential gating.",
    complexity: "O(k·n)",
    status: "planned",
    chapters: [
      "Matrix Memory",
      "State Update",
      "mLSTM",
      "sLSTM",
      "Exponential Gates",
      "Long Context",
      "Prediction",
    ].map((title, index) => ({
      id: `xlstm-${index + 1}`,
      title,
      summary: `xLSTM chapter for ${title.toLowerCase()} behavior and evolution.`,
      operationFocus: ["projection", "exp-gate", "state-update"],
    })),
  },
  gru: {
    id: "gru",
    name: "GRU",
    shortDescription: "Compact gated recurrence with reset and update pathways.",
    complexity: "O(k·n)",
    status: "planned",
    chapters: ["Reset Gate", "Update Gate", "Candidate", "Hidden State", "Prediction"].map(
      (title, index) => ({
        id: `gru-${index + 1}`,
        title,
        summary: `GRU walkthrough chapter for ${title.toLowerCase()} mechanics.`,
        operationFocus: ["matmul", "add", "sigmoid", "tanh"],
      }),
    ),
  },
  mamba: {
    id: "mamba",
    name: "Mamba",
    shortDescription: "Selective state-space sequence model with linear-time selective scan.",
    complexity: "O(n)",
    flagship: true,
    status: "planned",
    chapters: [
      "Input Projection",
      "State Space",
      "Discretization",
      "Selective Parameters",
      "Selective Scan",
      "State Update",
      "Output Projection",
      "Prediction",
      "Attention Comparison",
    ].map((title, index) => ({
      id: `mamba-${index + 1}`,
      title,
      summary: `Mamba selective propagation chapter for ${title.toLowerCase()} mechanics.`,
      operationFocus: ["ssm", "carry", "scan"],
    })),
  },
  transformer: {
    id: "transformer",
    name: "Transformer",
    shortDescription: "Attention-based parallel sequence processing baseline.",
    complexity: "O(n²)",
    status: "planned",
    chapters: [
      "Embedding",
      "Positional Encoding",
      "Attention",
      "Multi-Head Attention",
      "Feed Forward",
      "Residual + Norm",
      "Prediction",
    ].map((title, index) => ({
      id: `transformer-${index + 1}`,
      title,
      summary: `Transformer chapter covering ${title.toLowerCase()} internals.`,
      operationFocus: ["projection", "attention", "residual"],
    })),
  },
  convlstm: {
    id: "convlstm",
    name: "ConvLSTM",
    shortDescription: "Spatiotemporal recurrence with convolutional gates.",
    complexity: "O(k·n)",
    status: "planned",
    chapters: ["Input Tensor", "Convolution", "Gates", "Cell State", "Hidden State"].map(
      (title, index) => ({
        id: `convlstm-${index + 1}`,
        title,
        summary: `ConvLSTM chapter for ${title.toLowerCase()} flow.`,
        operationFocus: ["conv2d", "gate", "state-update"],
      }),
    ),
  },
  tcn: {
    id: "tcn",
    name: "TCN",
    shortDescription: "Dilated temporal convolutions with residual stacks.",
    complexity: "O(k·n)",
    status: "planned",
    chapters: [
      "Temporal Convolution",
      "Dilated Convolution",
      "Residual Blocks",
      "Receptive Field",
      "Prediction",
    ].map((title, index) => ({
      id: `tcn-${index + 1}`,
      title,
      summary: `TCN chapter for ${title.toLowerCase()} mechanics.`,
      operationFocus: ["dilation", "filter", "residual"],
    })),
  },
};

export const MODELS = Object.values(MODEL_SPECS);

export const COMPARE_PRESETS: ComparePreset[] = [
  { id: "lstm-gru", left: "lstm", right: "gru", label: "LSTM vs GRU" },
  { id: "lstm-xlstm", left: "lstm", right: "xlstm", label: "LSTM vs xLSTM" },
  {
    id: "transformer-mamba",
    left: "transformer",
    right: "mamba",
    label: "Transformer vs Mamba",
  },
  { id: "tcn-lstm", left: "tcn", right: "lstm", label: "TCN vs LSTM" },
  { id: "convlstm-lstm", left: "convlstm", right: "lstm", label: "ConvLSTM vs LSTM" },
];

export const DATASETS: DatasetSpec[] = [
  { id: "temperature", name: "Temperature Forecasting", domain: "Climate", target: "°C", windowRange: [24, 720] },
  { id: "electricity", name: "Electricity Demand", domain: "Energy", target: "MW", windowRange: [24, 336] },
  { id: "traffic", name: "Traffic Flow", domain: "Mobility", target: "Volume", windowRange: [24, 336] },
  { id: "weather", name: "Weather Multi-variate", domain: "Climate", target: "Composite", windowRange: [24, 720] },
  { id: "stock", name: "Stock Price", domain: "Finance", target: "Price", windowRange: [10, 252] },
  { id: "energy", name: "Energy Consumption", domain: "Energy", target: "kWh", windowRange: [24, 720] },
  { id: "ecg", name: "ECG Signals", domain: "Healthcare", target: "Class", windowRange: [60, 1000] },
  { id: "sensor", name: "Sensor Streams", domain: "IoT", target: "Anomaly", windowRange: [30, 2000] },
];
