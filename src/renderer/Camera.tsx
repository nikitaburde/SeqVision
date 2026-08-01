export interface CameraPreset {
  mode: "free" | "orbit" | "exploded" | "section";
  fov: number;
}

export const defaultCameraPreset: CameraPreset = {
  mode: "orbit",
  fov: 50,
};
