export type ModelId =
  | "lstm"
  | "xlstm"
  | "gru"
  | "mamba"
  | "transformer"
  | "convlstm"
  | "tcn";

export type Maturity = "mvp" | "beta" | "planned";

export interface WalkthroughChapter {
  id: string;
  title: string;
  summary: string;
  operationFocus: string[];
}

export interface ModelSpec {
  id: ModelId;
  name: string;
  shortDescription: string;
  complexity: "O(n)" | "O(n²)" | "O(k·n)";
  flagship?: boolean;
  status: Maturity;
  chapters: WalkthroughChapter[];
}

export interface ComparePreset {
  id: string;
  left: ModelId;
  right: ModelId;
  label: string;
}

export interface DatasetSpec {
  id: string;
  name: string;
  domain: string;
  target: string;
  windowRange: [number, number];
}
