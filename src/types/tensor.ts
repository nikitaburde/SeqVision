export interface TensorStats {
  mean: number;
  variance: number;
  min: number;
  max: number;
  memoryBytes: number;
  distribution: number[];
}

export interface TensorDescriptor {
  id: string;
  name: string;
  shape: number[];
  dimensions: string[];
  activation?: string;
  weightMatrix?: string;
  bias?: string;
  gradient?: number[];
  values: number[];
  stats: TensorStats;
}
