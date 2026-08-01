import type { TensorDescriptor } from "@/types";

export function summarizeTensor(tensor: TensorDescriptor) {
  return {
    id: tensor.id,
    shape: tensor.shape,
    mean: tensor.stats.mean,
    variance: tensor.stats.variance,
    memoryBytes: tensor.stats.memoryBytes,
  };
}
