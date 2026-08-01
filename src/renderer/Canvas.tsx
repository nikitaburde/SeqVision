import type { SceneFrameInput } from "./Scene";

export interface RenderSnapshot {
  fpsTarget: 60;
  frame: SceneFrameInput;
}

export function makeRenderSnapshot(frame: SceneFrameInput): RenderSnapshot {
  return {
    fpsTarget: 60,
    frame,
  };
}
