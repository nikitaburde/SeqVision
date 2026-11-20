import type { ModelId } from "@/types";

export interface LessonBeat {
  title: string;
  explanation: string;
  equation: string;
  values: number[];
  shape?: [number, number];
}

export interface LessonOperation {
  equation: string;
  values: number[];
  shape?: [number, number];
  beats: LessonBeat[];
}

const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);
const beat = (title: string, equation: string, values: number[], explanation: string, shape?: [number, number]): LessonBeat =>
  ({ title, explanation, equation, values, shape });
const op = (equation: string, values: number[], beats: LessonBeat[], shape?: [number, number]): LessonOperation =>
  ({ equation, values, shape, beats });

function predictionBeats(values: number[], label: string) {
  return [
    beat("Read feature vector", label, values, "The readout receives one value per feature at the current time step. Positive and negative contributions may cancel."),
    beat("Sum the features", "s = Σⱼ featureⱼ", [sum(values)], "Add the feature values together. The final readout divides this sum by the number of features so its scale does not grow with feature width."),
  ];
}

export function computeLesson(model: ModelId, input: number[][], time: number): LessonOperation[] {
  const x = input[time];
  const width = x.length;

  switch (model) {
    case "lstm":
    case "gru":
    case "convlstm": {
      let h = x.map(() => 0);
      let c = x.map(() => 0);
      let dh = x.map(() => 0);
      let dc = x.map(() => 0);
      let operations: LessonOperation[] = [];
      const conv = (row: number[]) => row.map((v, j) => 0.6 * v + 0.2 * ((row[j - 1] ?? 0) + (row[j + 1] ?? 0)));

      for (let t = 0; t <= time; t++) {
        const raw = input[t];
        const previousH = h;
        const previousC = c;
        const u = model === "convlstm" ? conv(raw) : raw;
        const prev = model === "convlstm" ? conv(h) : h;
        const z = u.map((v, j) => v + 0.5 * prev[j]);
        const f = z.map(v => sigmoid(v + 0.4));
        const i = z.map(sigmoid);
        const inputBeat = beat("Read this input", "xₜ", raw, "Select the feature row for this time step. The recurrence combines it with a hidden state from the previous time step.");
        const recurrentBeat = beat("Weight the old hidden state", "0.5hₜ₋₁", previousH.map(v => 0.5 * v), "The teaching cell uses a shared recurrent coefficient of 0.5. At the first time step the previous hidden state starts at zero.");
        const preactivation = (bias: number) => beat("Form the preactivation", bias === 0 ? "z = xₜ + 0.5hₜ₋₁" : `z + b = xₜ + 0.5hₜ₋₁ + (${bias})`,
          z.map(v => v + bias), "Add the input and weighted previous state feature by feature. The gate applies its nonlinear function to this expression.");
        if (model === "gru") {
          const reset = f.map((v, j) => v * h[j]);
          const candidateInput = u.map((v, j) => v + 0.5 * reset[j]);
          const g = candidateInput.map(Math.tanh);
          h = g.map((v, j) => (1 - i[j]) * h[j] + i[j] * v);
          operations = [
            op("rₜ = σ(xₜ + 0.5hₜ₋₁ + 0.4)", f, [inputBeat, recurrentBeat, preactivation(0.4)]),
            op("zₜ = σ(xₜ + 0.5hₜ₋₁)", i, [inputBeat, recurrentBeat, preactivation(0)]),
            op("gₜ = tanh(xₜ + 0.5rₜ ⊙ hₜ₋₁)", g, [
              beat("Reset the history", "rₜ ⊙ hₜ₋₁", reset, "The reset gate scales each previous hidden feature. A small reset value suppresses its contribution to the candidate."),
              beat("Add the current input", "xₜ + 0.5rₜ ⊙ hₜ₋₁", candidateInput, "Weight the surviving history by 0.5 and add the new evidence. Tanh then maps the sum into the interval from −1 to 1."),
            ]),
            op("hₜ = (1 − zₜ) ⊙ hₜ₋₁ + zₜ ⊙ gₜ", h, [
              beat("Keep part of the old state", "(1 − zₜ) ⊙ hₜ₋₁", previousH.map((v, j) => (1 - i[j]) * v), "A small update gate gives the old hidden state a large weight. The retained contribution is computed separately for each feature."),
              beat("Admit the candidate", "zₜ ⊙ gₜ", g.map((v, j) => i[j] * v), "The candidate receives the complementary weight. Adding the two terms produces the hidden state carried forward."),
            ]),
            op("ŷₜ = mean(hₜ)", [sum(h) / width], predictionBeats(h, "hₜ")),
          ];
          continue;
        }

        const g = z.map(Math.tanh);
        const o = z.map(v => sigmoid(v - 0.2));
        const nextC = c.map((v, j) => f[j] * v + i[j] * g[j]);
        const nextH = nextC.map((v, j) => o[j] * Math.tanh(v));
        const prediction = sum(nextH) / width;
        const target = sum(raw) / width;
        const error = prediction - target;

        const previousDh = dh;
        if (model === "lstm") {
          // Propagate the derivative of the shared recurrent coefficient through every preceding step.
          const dz = h.map((v, j) => v + 0.5 * dh[j]);
          dc = dc.map((v, j) => f[j] * v + dz[j] * (
            f[j] * (1 - f[j]) * c[j] + i[j] * (1 - i[j]) * g[j] + i[j] * (1 - g[j] ** 2)
          ));
          dh = dh.map((_, j) => {
            const cell = Math.tanh(nextC[j]);
            return o[j] * (1 - o[j]) * dz[j] * cell + o[j] * (1 - cell ** 2) * dc[j];
          });
        }
        c = nextC;
        h = nextH;
        operations = model === "convlstm" ? [
          op("Xₜ = spatial input row", raw, [
            beat("Read the previous spatial state", "Hₜ₋₁", previousH, "The recurrent state has a value at each spatial position. It is all zero before the first frame."),
            beat("Select the current frame", "Xₜ", raw, "Neighboring entries belong to nearby spatial positions in the same frame. The convolution visits this row with a shared kernel."),
          ]),
          op("Zₜ = K ∗ Xₜ + 0.5(K ∗ Hₜ₋₁)", z, [
            beat("Filter the input", "K ∗ Xₜ", u, "The center contributes 0.6 and each neighbor contributes 0.2. The edges use zero for missing neighbors."),
            beat("Filter the hidden state", "0.5(K ∗ Hₜ₋₁)", prev.map(v => 0.5 * v), "Use the same spatial filter on the previous hidden row and halve its contribution before adding it to the input response."),
          ]),
          op("[Fₜ, Iₜ, Oₜ] = [σ(Zₜ + 0.4), σ(Zₜ), σ(Zₜ − 0.2)]", [...f, ...i, ...o], [
            beat("Forget gate", "σ(Zₜ + 0.4)", f, "This row determines the retention of old cell memory at each position. The positive offset raises its sigmoid output."),
            beat("Input gate", "σ(Zₜ)", i, "This row controls how much candidate memory can be added at each spatial position."),
            beat("Output gate", "σ(Zₜ − 0.2)", o, "This row controls the exposure of updated memory as hidden state. The final tensor stacks all three gate rows."),
          ], [3, width]),
          op("Cₜ = Fₜ ⊙ Cₜ₋₁ + Iₜ ⊙ tanh(Zₜ)", c, [
            beat("Retain old memory", "fₜ ⊙ cₜ₋₁", previousC.map((v, j) => f[j] * v), "Multiply each old cell value by its forget gate. With a zero initial cell state this term is zero on the first step."),
            beat("Write new memory", "iₜ ⊙ gₜ", g.map((v, j) => i[j] * v), "Multiply the candidate by the input gate. Adding it to the retained term makes the new cell state."),
          ]),
          op("Hₜ = Oₜ ⊙ tanh(Cₜ)", h, [
            beat("Squash the cell state", "tanh(cₜ)", c.map(Math.tanh), "Tanh maps the cell values into a bounded range. The cell state itself is retained separately for the next update."),
            beat("Read the output gate", "oₜ", o, "Each gate value controls how much of its corresponding squashed cell value appears in the hidden state."),
          ]),
        ] : [
          op("x = [x₁, …, xₙ]", input.flat(), [
            beat("Find the time axis", "shape(x) = [time, features]", [input.length, width], "Rows advance through time and columns identify features. Changing sequence length adds rows, while changing feature width adds columns."),
            inputBeat,
          ], [input.length, width]),
          op("fₜ = σ(xₜ + whₜ₋₁ + 0.4)", f, [inputBeat, recurrentBeat, preactivation(0.4)]),
          op("iₜ = σ(xₜ + whₜ₋₁)", i, [inputBeat, recurrentBeat, preactivation(0)]),
          op("gₜ = tanh(xₜ + whₜ₋₁)", g, [inputBeat, recurrentBeat, preactivation(0)]),
          op("cₜ = fₜ ⊙ cₜ₋₁ + iₜ ⊙ gₜ", c, [
            beat("Retain old memory", "fₜ ⊙ cₜ₋₁", previousC.map((v, j) => f[j] * v), "Multiply each old cell value by its forget gate. With a zero initial cell state this term is zero on the first step."),
            beat("Write new memory", "iₜ ⊙ gₜ", g.map((v, j) => i[j] * v), "Multiply the candidate by the input gate. Adding it to the retained term makes the new cell state."),
          ]),
          op("oₜ = σ(xₜ + whₜ₋₁ − 0.2)", o, [inputBeat, recurrentBeat, preactivation(-0.2)]),
          op("hₜ = oₜ ⊙ tanh(cₜ)", h, [
            beat("Squash the cell state", "tanh(cₜ)", c.map(Math.tanh), "Tanh maps the cell values into a bounded range. The cell state itself is retained separately for the next update."),
            beat("Read the output gate", "oₜ", o, "Each gate value controls how much of its corresponding squashed cell value appears in the hidden state."),
          ]),
          op("ŷₜ = mean(hₜ)", [prediction], predictionBeats(h, "hₜ")),
          op("Lₜ = ½(ŷₜ − mean(xₜ))²", [0.5 * error ** 2], [
            beat("Compare prediction and target", "[ŷₜ, mean(xₜ)]", [prediction, target], "The target in this teaching example is the mean of the current input. The prediction comes from the hidden state readout."),
            beat("Take the signed error", "e = ŷₜ − mean(xₜ)", [error], "A positive error is an overshoot and a negative error is an undershoot. Squaring makes both contribute a nonnegative loss."),
          ]),
          op("∂Lₜ / ∂w = (ŷₜ − mean(xₜ)) · mean(∂hₜ / ∂w), w = 0.5", [error * sum(dh) / width], [
            beat("Carry prior sensitivity", "∂hₜ₋₁ / ∂w", previousDh, "The same coefficient is reused at every time step. Its effect on the previous hidden state becomes part of the current derivative."),
            beat("Differentiate the current hidden state", "∂hₜ / ∂w", dh, "The derivatives of each gate and the carried cell state contribute to the sensitivity of each hidden feature."),
            beat("Apply the loss derivative", "∂Lₜ / ∂ŷₜ = ŷₜ − target", [error], "Multiply the error by the mean hidden-state sensitivity to obtain the scalar derivative. The animation computes this derivative without updating the fixed weight."),
          ]),
        ];
      }
      return operations;
    }
    case "tcn": {
      const filter = (sequence: number[][], t: number, dilation: number) =>
        sequence[t].map((v, j) => 0.55 * v + 0.3 * (sequence[t - dilation]?.[j] ?? 0) + 0.15 * (sequence[t - 2 * dilation]?.[j] ?? 0));
      const first = input.map((_, t) => filter(input, t, 1).map(Math.tanh));
      const tapBeats = (sequence: number[][], dilation: number) => [0.55, 0.3, 0.15].map((weight, tap) => {
        const offset = tap * dilation;
        return beat(offset ? `Read lag ${offset}` : "Read the current position", `${weight} × input[t − ${offset}]`,
          x.map((_, feature) => weight * (sequence[time - offset]?.[feature] ?? 0)),
          offset > time
            ? "This tap falls before the start of the sequence, so zero padding supplies every feature for the weighted contribution."
            : "The filter multiplies this time position by the tap weight. The weighted values of all three taps are added feature by feature.");
      });
      const dilated = filter(first, time, 2);
      const residual = x.map((v, j) => v + dilated[j]);
      return [
        op("aₜ = tanh(K ∗ x)ₜ", first[time], [
          ...tapBeats(input, 1),
          beat("Add the tap contributions", "(K ∗ x)ₜ", filter(input, time, 1), "Sum the three weighted inputs for each feature. Tanh then bounds each value before the next layer."),
        ]),
        op("bₜ = (K ∗₂ a)ₜ", dilated, tapBeats(first, 2)),
        op("hₜ = xₜ + bₜ", residual, [
          beat("Preserve a direct route", "xₜ", x, "The input bypasses both convolutions on the residual path so its features can reach the output directly."),
          beat("Bring in the filtered context", "bₜ", dilated, "The dilated branch incorporates earlier inputs. Add it to the unfiltered path at matching feature indices."),
        ]),
        op("Rₜ = [max(0, t − 6), …, t]", Array.from({ length: Math.min(time + 1, 7) }, (_, j) => Math.max(0, time - 6) + j), [
          beat("Reach back through layer two", "lags = [0, 2, 4]", [0, 2, 4], "The second layer reads the current position and positions two and four steps back. This gives the convolution its larger spacing."),
          beat("Expand each first-layer tap", "lags from first layer = [0, 1, 2]", [0, 1, 2], "Each second-layer read covers up to two further steps through layer one. Add lag combinations and discard indices before the start."),
        ]),
        op("ŷₜ = mean(hₜ)", [sum(residual) / width], predictionBeats(residual, "hₜ")),
      ];
    }
    case "transformer": {
      const tokens = input.slice(0, time + 1).map((row, t) => row.map((v, j) => v + 0.25 * Math.sin(t / (j + 1))));
      const positioned = tokens[time];
      const heads = [1, -1].map(sign => {
        const scores = tokens.map(row => sign * sum(row.map((v, j) => v * positioned[j])) / Math.sqrt(width));
        const peak = Math.max(...scores);
        const exp = scores.map(score => Math.exp(score - peak));
        const total = sum(exp);
        const weights = exp.map(v => v / total);
        return { scores, exp, weights, output: x.map((_, j) => sum(tokens.map((row, t) => weights[t] * row[j]))) };
      });
      const merged = x.map((_, j) => (heads[0].output[j] + heads[1].output[j]) / 2);
      const affine = merged.map(v => 1.2 * v - 0.1);
      const feed = affine.map(v => Math.max(0, v));
      const residual = feed.map((v, j) => v + positioned[j] + merged[j]);
      const mean = sum(residual) / width;
      const scale = Math.sqrt(sum(residual.map(v => (v - mean) ** 2)) / width + 1e-5);
      const normalized = residual.map(v => (v - mean) / scale);
      return [
        op("eₜ = xₜ", x, [
          beat("Select the token row", "xₜ", x, "The current token is represented by a numeric row at its position. Each entry is a feature used in later dot products."),
          beat("Read the feature count", "d = length(xₜ)", [width], "The vector width determines the number of terms in a dot product. Here the embedding is an identity mapping of the supplied row."),
        ]),
        op("pₜ,ⱼ = eₜ,ⱼ + 0.25 sin(t / (j + 1))", positioned, [
          beat("Read the unpositioned vector", "eₜ", x, "The embedding provides the content signal before any time information is applied."),
          beat("Compute the position signal", "0.25 sin(t / (j + 1))", x.map((_, j) => 0.25 * Math.sin(time / (j + 1))), "Feature indices have different sine scales. The input at the first position receives zero offset because its time index is zero."),
        ]),
        op("aₜ = softmax(pₜPᵀ / √d)", heads[0].weights, [
          beat("Form the current query", "q = pₜ", positioned, "The current position asks which earlier positions are relevant. The causal window includes itself and excludes future positions."),
          beat("Score every visible key", "sᵢ = q · pᵢ / √d", heads[0].scores, "Multiply matching features and add their products for each visible position. Divide by the square root of feature width."),
          beat("Exponentiate relative scores", "eᵢ = exp(sᵢ − max(s))", heads[0].exp, "Subtracting the largest score avoids unnecessarily large exponentials. Dividing by their sum gives the attention weights."),
        ]),
        op("H = [softmax(a logits)P; softmax(−a logits)P]", heads.flatMap(head => head.output), [
          beat("Mix values using head one", "Σᵢ a¹ᵢpᵢ", heads[0].output, "The first head forms a weighted average of positioned tokens using its normalized scores."),
          beat("Mix values using head two", "Σᵢ a²ᵢpᵢ", heads[1].output, "The teaching model reverses the score signs for the second head, so it can emphasize different tokens. Both outputs are retained as rows."),
        ], [2, width]),
        op("m = mean_heads(H); f = ReLU(1.2m − 0.1)", feed, [
          beat("Merge matching features", "m = mean_heads(H)", merged, "Take the mean of the two head outputs at each feature. This gives one vector with the original feature width."),
          beat("Apply the affine projection", "z = 1.2m − 0.1", affine, "Scale each merged feature and subtract a bias. ReLU then clears all negative values and retains positive values."),
        ]),
        op("h = LayerNorm(pₜ + m + f)", normalized, [
          beat("Join the residual paths", "r = pₜ + m + f", residual, "The positioned input, attention output and feed-forward output contribute to the same vector, feature by feature."),
          beat("Center the vector", "r − mean(r)", residual.map(v => v - mean), "The mean is calculated over features of this position. Subtract it from every feature before dividing by the scale."),
          beat("Compute the scale", "s = √(variance(r) + ε)", [scale], "A small epsilon keeps the divisor positive even if every feature is equal. Divide the centered vector by this scale."),
        ]),
        op("ŷₜ = hₜ,₀", [normalized[0]], [
          beat("Read the normalized features", "hₜ", normalized, "Layer normalization leaves one vector for the current position. Its entries are the values available to the readout."),
          beat("Select the readout index", "j = 0", [0], "The teaching readout selects the first feature as its scalar prediction. A language-model output head would instead project to vocabulary logits."),
        ]),
      ];
    }
    case "mamba": {
      let state = x.map(() => 0);
      const scan: number[][] = [];
      for (let t = 0; t <= time; t++) {
        const u = input[t].map(v => 0.8 * v);
        state = u.map((v, j) => {
          const a = Math.exp(-sigmoid(v));
          return a * state[j] + (1 - a) * v;
        });
        scan.push(state);
      }
      const u = x.map(v => 0.8 * v);
      const delta = u.map(sigmoid);
      const decay = delta.map(v => Math.exp(-v));
      const outputGate = u.map(sigmoid);
      const output = state.map((v, j) => v * outputGate[j]);
      const previous = scan[time - 1] ?? x.map(() => 0);
      const carry = previous.map((v, j) => decay[j] * v);
      const write = u.map((v, j) => (1 - decay[j]) * v);
      const carryBeat = beat("Decay the carried state", "Āₜ ⊙ hₜ₋₁", carry, "The input-dependent transition scales the old state. At the first step the state starts at zero.");
      const writeBeat = beat("Mix in the current drive", "(1 − Āₜ) ⊙ uₜ", write, "The complement gives the new input its weight. Adding this term to the carry produces the current state.");
      return [
        op("uₜ = 0.8xₜ", u, [
          beat("Read the incoming features", "xₜ", x, "The current input has one value per state channel in this reduced recurrence."),
          beat("Load the projection weight", "w = 0.8", [0.8], "This teaching projection scales all channels by the same coefficient. The result influences both the recurrence and its step sizes."),
        ]),
        op("A = −1", [-1], [
          beat("Start from the old state", "hₜ₋₁", previous, "Each channel keeps one carried value rather than a list of past tokens. A transition describes how that value evolves."),
          beat("Read the step size", "Δₜ", delta, "The step size sets how far to advance the continuous system. A negative continuous coefficient makes its exponential decay factor less than one."),
        ]),
        op("Āₜ = exp(−Δₜ)", decay, [
          beat("Choose time increments", "Δₜ", delta, "Each feature's projected input controls its step size. Two features can therefore retain different fractions of their histories."),
          beat("Scale the continuous coefficient", "AΔₜ = −Δₜ", delta.map(v => -v), "Multiply each step size by the negative transition coefficient. Taking the exponential turns the resulting negative values into decay factors."),
        ]),
        op("Δₜ = σ(uₜ)", delta, [
          beat("Read the projection", "uₜ", u, "The projected features provide the input-dependent signal that makes the recurrence selective."),
          beat("Exponentiate the negative projection", "exp(−uₜ)", u.map(v => Math.exp(-v)), "This is the denominator's variable term in sigmoid. Adding one and taking the reciprocal gives the bounded step size."),
        ]),
        op("hₜ = Āₜ ⊙ hₜ₋₁ + (1 − Āₜ) ⊙ uₜ", scan.flat(),
          [...scan.slice(0, -1).map((row, t) => beat(`Carry from input ${t + 1}`, "hₜ = decay ⊙ previous + write", row,
            "The scan writes one state per input. This row becomes the only state carried into the next update.")), carryBeat, writeBeat], [scan.length, width]),
        op("hₜ = scan(u₁, …, uₜ)ₜ", state, [carryBeat, writeBeat]),
        op("yₜ = hₜ ⊙ σ(uₜ)", output, [
          beat("Read the carried state", "hₜ", state, "This is the state after processing the current input. It is retained for the next recurrence even if some features are suppressed in the output."),
          beat("Compute the output gate", "σ(uₜ)", outputGate, "The projected input produces a separate mask for the visible output. Multiply the state and mask at each feature."),
        ]),
        op("ŷₜ = mean(yₜ)", [sum(output) / width], predictionBeats(output, "yₜ")),
        op("[causal attention score pairs, scan steps] = [n(n + 1)/2, n]", [(time + 1) * (time + 2) / 2, time + 1], [
          beat("Count causal comparisons by query", "pairs per query = [1, 2, …, n]", scan.map((_, t) => t + 1), "Each later query can compare with one more key. The total grows as the sum of this increasing sequence."),
          beat("Count state updates by input", "updates per input = [1, 1, …, 1]", scan.map(() => 1), "The selective scan updates one carried state per input. These are operation counts for two different computations, rather than timing measurements."),
        ]),
      ];
    }
    case "xlstm": {
      let matrix = x.flatMap(() => x.map(() => 0));
      let normalizer = x.map(() => 0);
      let scalar = x.map(() => 0);
      let count = x.map(() => 0);
      let gates = [1, 1];
      let output = x;
      let writeMatrix: number[] = [];
      let retainedMatrix: number[] = [];
      let retainedNormalizer: number[] = [];
      let writeNormalizer: number[] = [];
      let read: number[] = [];
      let divisor = 1;
      for (let t = 0; t <= time; t++) {
        const v = input[t];
        const key = v.map(value => value / Math.sqrt(width));
        const [i, f] = gates = [Math.exp(sum(v) / width), sigmoid(-sum(v) / width)];
        retainedMatrix = matrix.map(value => f * value);
        writeMatrix = matrix.map((_, j) => i * v[Math.floor(j / width)] * key[j % width]);
        matrix = retainedMatrix.map((value, j) => value + writeMatrix[j]);
        retainedNormalizer = normalizer.map(value => f * value);
        writeNormalizer = key.map(value => i * value);
        normalizer = retainedNormalizer.map((value, j) => value + writeNormalizer[j]);
        divisor = Math.max(1, Math.abs(sum(normalizer.map((value, j) => value * v[j]))));
        read = v.map((_, j) => sum(v.map((query, k) => matrix[j * width + k] * query)));
        output = v.map((value, j) => sigmoid(value) * read[j] / divisor);
        scalar = scalar.map((value, j) => f * value + i * Math.tanh(v[j]));
        count = count.map(value => f * value + i);
      }
      const forgetHistory = input.slice(1, time + 1).map(row => sigmoid(-sum(row) / width));
      return [
        op("Cₜ = fₜCₜ₋₁ + iₜvₜkₜᵀ", matrix, [
          beat("Decay the old matrix", "fₜCₜ₋₁", retainedMatrix, "Each entry in memory is scaled by the same forget gate. The matrix begins at zero before the first write.", [width, width]),
          beat("Write a value–key outer product", "iₜvₜkₜᵀ", writeMatrix, "Row j and column k receive value j times key k, scaled by the input gate. Adding this matrix to the retained matrix updates memory.", [width, width]),
        ], [width, width]),
        op("nₜ = fₜnₜ₋₁ + iₜkₜ", normalizer, [
          beat("Retain the normalizer", "fₜnₜ₋₁", retainedNormalizer, "The normalizer tracks the accumulated key signal. It forgets prior contributions using the same gate as matrix memory."),
          beat("Add the new key", "iₜkₜ", writeNormalizer, "Weight the key by the input gate. The sum with the retained key history later scales the matrix readout."),
        ]),
        op("hₜ = oₜ ⊙ Cₜqₜ / max(1, |nₜᵀqₜ|)", output, [
          beat("Query the stored associations", "Cₜqₜ", read, "Take the dot product of each matrix row with the current query. Each row contributes one feature of the readout."),
          beat("Find the normalization divisor", "d = max(1, |nₜᵀqₜ|)", [divisor], "The normalizer is also queried. A lower bound of one prevents a near-zero value from amplifying the output."),
          beat("Compute the output gate", "oₜ = σ(xₜ)", x.map(sigmoid), "Scale the normalized readout by a separate sigmoid gate at every feature to choose what is exposed."),
        ]),
        op("hˢₜ = σ(xₜ) ⊙ cˢₜ / nˢₜ", scalar.map((v, j) => sigmoid(x[j]) * v / count[j]), [
          beat("Accumulate scalar memory", "cˢₜ = fₜcˢₜ₋₁ + iₜ tanh(xₜ)", scalar, "Each feature keeps a separate scalar memory. A write adds a bounded candidate scaled by the input gate."),
          beat("Accumulate the normalizer", "nˢₜ = fₜnˢₜ₋₁ + iₜ", count, "The accumulator tracks the strength of retained writes. Divide the scalar memory by it, then apply the output gate."),
        ]),
        op("[iₜ, fₜ] = [exp(mean(xₜ)), σ(−mean(xₜ))]", gates, [
          beat("Pool the current features", "m = mean(xₜ)", [sum(x) / width], "The teaching cell derives both shared gate values from the average of the current features."),
          beat("Exponentiate the write gate", "iₜ = exp(m)", [gates[0]], "The exponential write scale is positive and can exceed one. The sigmoid forget gate stays below one and limits how much old state is retained."),
        ]),
        op("Carry from step 0 = ∏ⱼ₌₁ᵗ fⱼ", [forgetHistory.reduce((carry, f) => carry * f, 1)], [
          beat("Start from a unit contribution", "carry₀ = 1", [1], "Measure a contribution immediately after it is written at the first step. It has retained its entire original magnitude at that instant."),
          beat("Read the subsequent forget gates", time ? "f₁, …, fₜ" : "Empty product = 1", time ? forgetHistory : [1], time
            ? "Each later gate scales what survived the previous step. Multiplying them gives the total remaining fraction."
            : "There are no later inputs yet. The empty product is one, so the original contribution has not decayed."),
        ]),
        op("ŷₜ = mean(hₜ)", [sum(output) / width], predictionBeats(output, "hₜ")),
      ];
    }
  }
}
