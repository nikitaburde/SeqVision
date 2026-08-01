export interface CanvasCameraState {
  fov: number;
  near: number;
  far: number;
}

export const canvasCameraDefaults: CanvasCameraState = {
  fov: 50,
  near: 0.1,
  far: 2000,
};
