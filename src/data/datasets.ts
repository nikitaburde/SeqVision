import { DATASETS } from "@/constants/model";

export function getDatasetById(datasetId: string) {
  return DATASETS.find((dataset) => dataset.id === datasetId) ?? null;
}
