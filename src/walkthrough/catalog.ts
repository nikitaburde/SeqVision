import { MODEL_SPECS } from "@/constants/model";

export const WALKTHROUGH_CATALOG = Object.fromEntries(
  Object.entries(MODEL_SPECS).map(([modelId, model]) => [modelId, model.chapters]),
);
