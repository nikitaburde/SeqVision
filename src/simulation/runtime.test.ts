import { describe, expect, it } from "vitest";

import { DATASETS, MODELS } from "@/constants/model";
import { getChapterBeats, getLessonFrame, getLessonTensors, LESSON_DEFAULTS, LESSON_LIMITS } from "./runtime";

describe("sequence lessons", () => {
  for (const model of MODELS) {
    it(`keeps all ${model.name} chapters, equations, and tensor shapes synchronized`, () => {
      const options = { ...LESSON_LIMITS, dataset: DATASETS[0].id };
      for (const time of [0, 1, options.length - 1]) {
        const sceneTensors = getLessonTensors(model.id, time, options);
        for (const [phase, chapter] of model.chapters.entries()) {
          const position = time * model.chapters.length + phase;
          const { tensor, step, time: frameTime } = getLessonFrame(model.id, position, options);
          expect({ step, frameTime }).toEqual({ step: position, frameTime: time });
          expect(tensor.id).toBe(chapter.id);
          expect(sceneTensors[phase]).toEqual(tensor);
          const beats = getChapterBeats(model.id, phase, time, options);
          expect(beats.length).toBeGreaterThanOrEqual(3);
          expect(beats.at(-1)?.tensor).toMatchObject({ equation: tensor.equation, shape: tensor.shape, values: tensor.values });
          for (const beat of beats) {
            expect(beat.explanation.length).toBeGreaterThan(30);
            expect(beat.tensor.values.every(Number.isFinite)).toBe(true);
            expect(beat.tensor.values).toHaveLength(beat.tensor.shape[0] * beat.tensor.shape[1]);
          }
          expect(tensor.equation.length).toBeGreaterThan(0);
          expect(tensor.values.length).toBe(tensor.shape[0] * tensor.shape[1]);
          expect(tensor.values.every(Number.isFinite)).toBe(true);
          expect(tensor.stats.distribution.reduce((a, b) => a + b, 0)).toBe(tensor.values.length);
          expect(tensor.stats.memoryBytes).toBe(tensor.values.length * 4);
        }
      }
    });
  }

  it("computes the LSTM cell update from the displayed gates", () => {
    const forget = getLessonFrame("lstm", 11).tensor.values;
    const input = getLessonFrame("lstm", 12).tensor.values;
    const candidate = getLessonFrame("lstm", 13).tensor.values;
    const lastCell = getLessonFrame("lstm", 4).tensor.values;
    const cell = getLessonFrame("lstm", 14).tensor.values;
    for (const [index, value] of cell.entries()) {
      expect(value).toBeCloseTo(forget[index] * lastCell[index] + input[index] * candidate[index], 6);
    }
  });

  it("shows the actual preactivation and sigmoid result for the LSTM forget gate", () => {
    const beats = getChapterBeats("lstm", 1, 1);
    const previousHidden = getLessonFrame("lstm", 6).tensor.values;
    const preactivation = beats[2].tensor.values;
    for (const [index, input] of beats[0].tensor.values.entries()) {
      expect(preactivation[index]).toBeCloseTo(input + 0.5 * previousHidden[index] + 0.4, 6);
      expect(beats[3].tensor.values[index]).toBeCloseTo(1 / (1 + Math.exp(-preactivation[index])), 6);
    }
  });

  it("normalizes causal Transformer attention over visible tokens", () => {
    const frame = getLessonFrame("transformer", 2 * 7 + 2);
    expect(frame.tensor.values).toHaveLength(3);
    expect(frame.tensor.values.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 6);
  });

  it("bounds the playhead and produces reproducible, distinct datasets", () => {
    const options = { ...LESSON_DEFAULTS, dataset: "temperature" };
    expect(getLessonFrame("lstm", -1, options)).toEqual(getLessonFrame("lstm", 0, options));
    expect(getLessonFrame("lstm", 999, options).step).toBe(29);
    expect(getLessonFrame("lstm", 0, options).tensor.values).not.toEqual(
      getLessonFrame("lstm", 0, { ...options, dataset: "traffic" }).tensor.values
    );
  });
});
