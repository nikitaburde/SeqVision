export type CameraMode =
  | "free"
  | "orbit"
  | "pan"
  | "zoom"
  | "autofocus"
  | "component-focus"
  | "exploded"
  | "section";

export interface CameraState {
  mode: CameraMode;
  zoom: number;
  target: [number, number, number];
}
