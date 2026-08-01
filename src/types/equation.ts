export interface EquationAtom {
  opId: string;
  equationTermId: string;
  inputTensorIds: string[];
  outputTensorId: string;
  startFrame: number;
  endFrame: number;
}

export interface EquationMapping {
  modelId: string;
  equation: string;
  atoms: EquationAtom[];
}
