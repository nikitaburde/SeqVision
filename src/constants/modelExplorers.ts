export const modelExplorers = {
  convlstm: {
    name: "ConvLSTM",
    tagline:
      "Animate spatiotemporal tensors through convolutional gates, visible kernels, cell feature maps, hidden feature maps, and video/weather prediction heads.",
    equation: "C_t = f_t ⊙ C_{t-1} + i_t ⊙ tanh(W_xc * X_t + W_hc * H_{t-1} + b_c)",
    chapters: [
      "Spatiotemporal input tensor",
      "Convolution kernels",
      "Convolutional gates",
      "Cell-state feature maps",
      "Hidden-state feature maps",
      "Prediction head",
    ],
    inspectorTargets: ["input volume", "kernels", "gate maps", "cell maps", "hidden maps", "gradients"],
  },
  gru: {
    name: "GRU",
    tagline:
      "Step through reset gates, update gates, candidate hidden state, hidden interpolation, prediction, and gradient flow with fewer parameters than LSTM.",
    equation: "h_t = (1 - z_t) ⊙ n_t + z_t ⊙ h_{t-1}",
    chapters: [
      "Input and previous hidden state",
      "Reset gate",
      "Update gate",
      "Candidate hidden state",
      "Hidden interpolation update",
      "Prediction and loss",
      "Gradient flow",
    ],
    inspectorTargets: ["x_t", "r_t", "z_t", "n_t", "h_t", "weights"],
  },
  lstm: {
    name: "LSTM",
    tagline:
      "Walk through input preparation, every gate, cell-state arithmetic, hidden-state emission, prediction, loss, and backpropagation through time.",
    equation: "c_t = f_t ⊙ c_{t-1} + i_t ⊙ tanh(W_g[h_{t-1}, x_t] + b_g)",
    chapters: [
      "Input sequence",
      "Forget gate",
      "Input gate",
      "Candidate memory",
      "Cell-state update",
      "Output gate",
      "Hidden state",
      "Prediction and loss",
      "Backpropagation through time",
    ],
    inspectorTargets: ["x_t", "f_t", "i_t", "g_t", "c_t", "h_t"],
  },
  mamba: {
    name: "Mamba",
    tagline:
      "The flagship explorer shows selective scan as continuous state propagation with input-conditioned parameters, hidden-state carry, output projection, and linear complexity.",
    equation: "h_t = Ā(x_t)h_{t-1} + B̄(x_t)x_t; y_t = C(x_t)h_t + D x_t",
    chapters: [
      "Sequence stream as continuous state propagation",
      "Input projection",
      "State space model",
      "Discretization",
      "Selective Δ, B, and C parameters",
      "Selective scan carry",
      "Hidden-state evolution",
      "Output projection",
      "Prediction",
      "Linear complexity comparison",
    ],
    inspectorTargets: ["x_t", "Δ_t", "B_t", "C_t", "h_t", "y_t"],
  },
  tcn: {
    name: "TCN",
    tagline:
      "Animate causal dilated convolutions, residual blocks, temporal filters, receptive-field growth, and prediction without recurrent state.",
    equation: "y_t = F(x_t, x_{t-d}, x_{t-2d}, ...; W) + x_t",
    chapters: [
      "Causal convolution",
      "Dilated convolution",
      "Residual block",
      "Temporal filters",
      "Receptive-field growth",
      "Prediction",
    ],
    inspectorTargets: ["input window", "dilation", "kernels", "residual", "receptive field", "output"],
  },
  transformer: {
    name: "Transformer",
    tagline:
      "Trace embeddings, positional encodings, Q/K/V projections, attention, multi-head merging, feed-forward layers, residual paths, and prediction.",
    equation: "Attention(Q,K,V) = softmax(QKᵀ / √d_k)V",
    chapters: [
      "Embedding",
      "Positional encoding",
      "Q/K/V projections",
      "Scaled dot-product attention",
      "Multi-head attention",
      "Feed-forward network",
      "Residual connections",
      "Prediction",
    ],
    inspectorTargets: ["tokens", "Q", "K", "V", "attention map", "layer output"],
  },
  xlstm: {
    name: "xLSTM",
    tagline:
      "Explore matrix memory, mLSTM, sLSTM, exponential gates, stabilized updates, long-context behavior, and prediction readout.",
    equation: "M_t = f_t ⊙ M_{t-1} + i_t ⊙ v_t k_tᵀ",
    chapters: [
      "Matrix memory",
      "State update",
      "mLSTM path",
      "sLSTM path",
      "Exponential gates",
      "Long context",
      "Prediction readout",
    ],
    inspectorTargets: ["M_t", "s_t", "f_t", "i_t", "keys", "values"],
  },
} as const;
