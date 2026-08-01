export interface SceneNode {
  id: string;
  label: string;
  type: "tensor" | "gate" | "projection" | "state";
}
