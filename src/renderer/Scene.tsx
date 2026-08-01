export interface SceneFrameInput {
  timeStep: number;
  activeChapterId: string | null;
  highlightedOpId: string | null;
}

export function createSceneFrame(input: SceneFrameInput) {
  return {
    ...input,
    updatedAt: Date.now(),
  };
}
