export interface PostProcessingConfig {
  bloom: boolean;
  outline: boolean;
  toneMapping: "neutral" | "aces";
}

export const defaultPostProcessing: PostProcessingConfig = {
  bloom: true,
  outline: true,
  toneMapping: "neutral",
};
