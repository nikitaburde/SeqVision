export interface LightingPreset {
  ambient: number;
  key: number;
  rim: number;
}

export const defaultLighting: LightingPreset = {
  ambient: 0.45,
  key: 0.75,
  rim: 0.35,
};
