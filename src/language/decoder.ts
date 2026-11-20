export const ALPHABET = ["A", "B", "C", "D", "E", "F"] as const;
export type Letter = (typeof ALPHABET)[number];
export type OutputToken = Letter | "EOS";
export const MAX_LETTERS = 8;
export const DEFAULT_PROMPT = "C A B A C";
export const MAX_CONTEXT = MAX_LETTERS * 2 + 1;

export const DECODER_STAGES = [
  { title: "Context", short: "Context", description: "The decoder reads the prompt, a separator, and every letter it has emitted so far. Each pass predicts exactly one token." },
  { title: "Value projection", short: "Values", description: "Each letter has its own channel. A prompt token contributes +1 to its channel, while an emitted token contributes −1. The separator contributes zeros." },
  { title: "Causal attention", short: "Attention", description: "The query at the last position can see every token in the current context. Query and key weights are zero in this decoder, so softmax gives each visible token the same weight." },
  { title: "Weighted sum", short: "Sum", description: "Attention scales each value row and adds the rows channel by channel. A positive sum means the prompt still contains an unused copy of that letter." },
  { title: "Feed-forward", short: "FFN", description: "Two ReLU branches convert each positive channel into an availability flag. The scale is based on the maximum context length, so even a single unmatched letter reaches one." },
  { title: "Output logits", short: "Logits", description: "Available letters receive a score boost. A small fixed bias favors earlier letters in the alphabet. EOS wins once every letter has been emitted." },
  { title: "Emit token", short: "Emit", description: "Greedy decoding chooses the highest logit. An emitted letter joins the context on the next pass and cancels one matching prompt token. EOS ends the run." },
] as const;

export const BLUEPRINTS = [
  { id: "gpt-small", label: "GPT-style · 12 layers", layers: 12, width: 768, heads: 12, context: 1024, vocab: 50257 },
  { id: "gpt-medium", label: "GPT-style · 24 layers", layers: 24, width: 1024, heads: 16, context: 1024, vocab: 50257 },
  { id: "gpt-xl", label: "GPT-style · 48 layers", layers: 48, width: 1600, heads: 25, context: 1024, vocab: 50257 },
] as const;

export interface DecoderPass {
  context: { text: Letter | "|"; segment: "prompt" | "separator" | "output" }[];
  values: number[][];
  attention: number[];
  contributions: number[][];
  pooled: number[];
  availability: number[];
  logits: number[];
  probabilities: number[];
  emitted: OutputToken;
}

export function parsePrompt(text: string): Letter[] | null {
  const tokens = text.toUpperCase().replace(/[\s,]/g, "");
  if (!/^[A-F]{1,8}$/.test(tokens)) return null;
  return Array.from(tokens) as Letter[];
}

function softmax(logits: number[]) {
  const peak = Math.max(...logits);
  const shifted = logits.map(logit => Math.exp(logit - peak));
  const total = shifted.reduce((sum, value) => sum + value, 0);
  return shifted.map(value => value / total);
}

function decodeNext(prompt: Letter[], output: Letter[]): DecoderPass {
  const context: DecoderPass["context"] = [
    ...prompt.map(text => ({ text, segment: "prompt" as const })),
    { text: "|", segment: "separator" },
    ...output.map(text => ({ text, segment: "output" as const })),
  ];
  const values = context.map(token =>
    ALPHABET.map(letter => token.text === letter ? token.segment === "output" ? -1 : 1 : 0)
  );
  // The final query attends to the visible prefix. Q and K are both zero.
  const attention = softmax(context.map(() => 0));
  const contributions = values.map((row, position) => row.map(value => value * attention[position]));
  const pooled = ALPHABET.map((_, channel) => contributions.reduce((sum, row) => sum + row[channel], 0));
  const relu = (value: number) => Math.max(0, value);
  const availability = pooled.map(value => relu(MAX_CONTEXT * value) - relu(MAX_CONTEXT * value - 1));
  const logits = [...availability.map((value, channel) => 4 * value + (ALPHABET.length - channel) / 20), 1];
  const winner = logits.reduce((best, value, index) => value > logits[best] ? index : best, 0);
  const emitted = ALPHABET[winner] ?? "EOS";
  return { context, values, attention, contributions, pooled, availability, logits, probabilities: softmax(logits), emitted };
}

export function runDecoder(prompt: Letter[]) {
  const prefix: Letter[] = [];
  const passes: DecoderPass[] = [];
  for (let position = 0; position <= prompt.length; position++) {
    const pass = decodeNext(prompt, prefix);
    passes.push(pass);
    if (pass.emitted === "EOS") break;
    prefix.push(pass.emitted);
  }
  return passes;
}
