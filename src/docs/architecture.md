# SeqVision Architecture

The dashboard uses Next.js and React. Explorer, comparison, and research screens all call the same deterministic lesson engine. The UI can play, seek, or step through a run locally.

- `src/constants/model.ts` defines model metadata, chapter order, and preset pairs.
- `src/data/datasets.ts` defines reproducible normalized synthetic signals.
- `src/simulation/lessons.ts` computes the operations for seven simplified teaching architectures using fixed coefficients.
- `src/simulation/runtime.ts` maps each timeline step to a chapter and time step, builds the displayed tensor, and computes statistics.
- `src/components/model` provides playback, tensor tables, and inspection. The explorer shows a selectable Three.js block for each operation and samples large tensors for the viewport. The inspector exposes the complete tensor. Each chapter has an independent timeline of intermediate tensors and explanatory steps emitted by the lesson engine. Opening a chapter keeps the current input selected and starts that chapter’s animation.
- `src/api/lesson.ts` validates options and manages bounded in-process API runs. Route handlers use the same lesson functions as the dashboard.

The teaching configurations use small input dimensions and show intermediate operations. Compare mode reports theoretical operation counts for causal attention and selective scan. Research exports carry the input options and exact frames used by the dashboard. The roadmap tracks broader training diagnostics, real dataset integration, and extensibility.
