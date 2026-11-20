import { DATASETS } from "@/constants/model";

export function getDatasetById(datasetId: string) {
  return DATASETS.find((dataset) => dataset.id === datasetId) ?? null;
}

// Normalized synthetic signals for reproducible lessons.
export function sampleDataset(datasetId: string, t: number) {
  switch (datasetId) {
    case "temperature": return 0.75 * Math.sin(t / 4);
    case "electricity": return 0.4 * Math.sin(t / 3) + 0.2 * Math.cos(t);
    case "traffic": return Math.sin(t / 3) ** 4 - 0.3;
    case "weather": return 0.5 * Math.sin(t / 7) + 0.25 * Math.cos(t / 2);
    case "stock": return 0.6 * Math.sin(t / 11) + 0.15 * Math.sin(t * 5);
    case "energy": return 0.55 * Math.cos(t / 4) + 0.15 * Math.sin(t / 2);
    case "ecg": return t % 8 === 2 ? 0.94 : 0.16 * Math.sin(t);
    case "sensor": return t % 11 === 5 ? -0.9 : 0.3 * Math.cos(t);
    default: return 0.6 * Math.sin(t * 1.3) + 0.25 * Math.cos(t * 2.17);
  }
}
