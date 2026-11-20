import { MODEL_SPECS } from "@/constants/model";
import { sampleDataset } from "@/data/datasets";
import { OUTCOMES } from "@/walkthrough/explanations";
import { computeLesson, type LessonBeat, type LessonOperation } from "./lessons";
import type { ModelId, TensorDescriptor, WalkthroughChapter } from "@/types";

export interface RenderableTensor extends TensorDescriptor {
  equation: string;
}

const INPUT_VALUES = [0.12, -0.34, 0.56, 0.78, -0.9, 0.21, 0.43, -0.65, 0.87, -0.09, 0.31, 0.52];

function calculateStats(values: number[]) {
  const mean = values.reduce((total, value) => total + value, 0) / values.length;
  const variance = values.reduce((total, value) => total + (value - mean) ** 2, 0) / values.length;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const distribution = Array<number>(8).fill(0);
  for (const value of values) {
    distribution[Math.min(7, Math.floor(range ? 8 * (value - min) / range : 0))]++;
  }

  return {
    mean,
    variance,
    min,
    max,
    memoryBytes: values.length * Float32Array.BYTES_PER_ELEMENT,
    distribution,
  };
}

export const LESSON_DEFAULTS = { length: 3, width: 4, dataset: "" };
export const LESSON_LIMITS = { length: 24, width: 8 };

export function getLessonFrame(modelId: ModelId, step: number, options = LESSON_DEFAULTS) {
  const model = MODEL_SPECS[modelId];
  const lastStep = options.length * model.chapters.length - 1;
  const position = Math.max(0, Math.min(step, lastStep));
  const time = Math.floor(position / model.chapters.length);
  const chapter = model.chapters[position % model.chapters.length];
  const operations = lessonOperations(modelId, time, options);
  const tensor = renderTensor(chapter, operations[position % model.chapters.length]);
  return { chapter, tensor, time, step: position, lastStep };
}

export function getLessonTensors(modelId: ModelId, time: number, options = LESSON_DEFAULTS) {
  const operations = lessonOperations(modelId, time, options);
  return MODEL_SPECS[modelId].chapters.map((chapter, index) => renderTensor(chapter, operations[index]));
}

export function getLessonInput(time: number, options = LESSON_DEFAULTS) {
  return Array.from({ length: options.width }, (_, feature) => {
    const index = time * options.width + feature;
    return Math.fround(options.dataset
      ? sampleDataset(options.dataset, time + feature)
      : INPUT_VALUES[index] ?? sampleDataset("", index));
  });
}

function lessonOperations(modelId: ModelId, time: number, options: typeof LESSON_DEFAULTS) {
  const input = Array.from({ length: options.length }, (_, t) => getLessonInput(t, options));
  return computeLesson(modelId, input, time);
}

export function getChapterBeats(modelId: ModelId, phase: number, time: number, options = LESSON_DEFAULTS) {
  const chapter = MODEL_SPECS[modelId].chapters[phase];
  const operation = lessonOperations(modelId, time, options)[phase];
  const [title, explanation] = OUTCOMES[modelId][phase];
  const beats: LessonBeat[] = [...operation.beats, {
    title,
    equation: operation.equation,
    values: operation.values,
    shape: operation.shape,
    explanation,
  }];
  return beats.map((step, index) => ({
    explanation: step.explanation,
    tensor: renderTensor({ ...chapter, id: `${chapter.id}-beat-${index}`, title: step.title }, step),
  }));
}

function renderTensor(chapter: WalkthroughChapter, operation: Pick<LessonOperation, "values" | "shape" | "equation">): RenderableTensor {
  const values = operation.values.map(Math.fround);
  return {
    id: chapter.id,
    name: chapter.title,
    equation: operation.equation,
    shape: operation.shape ?? [1, values.length],
    dimensions: operation.shape ? ["rows", "columns"] : ["row", "values"],
    values,
    stats: calculateStats(values),
  };
}
