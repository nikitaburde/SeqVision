import type { EquationAtom, EquationMapping } from "@/types";

export function createEquationMapping(modelId: string, equation: string, atoms: EquationAtom[]): EquationMapping {
  return {
    modelId,
    equation,
    atoms,
  };
}
