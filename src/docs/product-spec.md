# SeqVision Product and Engineering Specification

## 1. Product Requirements Document

### Vision
SeqVision is an open-source educational platform that shows how sequence models compute, frame by frame. It combines Bycroft-style 3D walkthroughs, Distill-style explanations, TensorFlow Playground-style controls, and research-grade tensor inspection for LSTM, xLSTM, GRU, Mamba, Transformer, ConvLSTM, and TCN architectures.

### Target users
- **Beginners:** need guided chapters, definitions, visual analogies, quizzes, and equation callouts.
- **Practitioners:** need real datasets, configurable hyperparameters, comparison mode, and exportable examples.
- **Researchers:** need hidden states, gradients, parameter statistics, activation distributions, loss landscapes, feature maps, and weight evolution.
- **Educators:** need bookmarks, progress tracking, classroom-ready demos, and embeddable walkthrough sections.

### Non-negotiable product principles
1. Every visible computation must be tied to the equation that drives it.
2. Every gate, projection, convolution, scan, residual path, and state update is independently animated.
3. Every rendered component is clickable and opens the live tensor inspector.
4. Mamba is visualized as selective continuous state propagation, not as attention-like boxes.
5. The main experience must remain interactive at 60 FPS on modern laptop GPUs, with graceful degradation.

### Success metrics
- A new learner can complete the LSTM walkthrough and correctly answer gate/state knowledge checks in under 25 minutes.
- A practitioner can compare Transformer and Mamba runtime growth from sequence length 10 to 10,000 without reading code.
- A researcher can inspect gradients, activation histograms, and state trajectories for any supported model.
- First contentful paint under 1.8 seconds for the homepage on a typical broadband connection.
- Main animation loop holds 60 FPS for default scenes and at least 30 FPS for research-mode heavy scenes.

## 2. Website Information Architecture

### Global navigation
- Home
- Models
- Compare
- Complexity Lab
- Datasets
- Research Mode
- Docs
- GitHub

### Homepage sections
1. **Interactive hero:** a compact sequence flows through selectable model cells. The hero defaults to Mamba continuous state propagation and can switch to LSTM gates, GRU blending, Transformer attention, ConvLSTM kernels, and TCN dilation.
2. **Architecture selector:** seven model cards: LSTM, xLSTM, GRU, Mamba, Transformer, ConvLSTM, TCN. Each card shows complexity, best use case, key state type, and a “Launch explorer” action.
3. **Quick demos:** one-click scenarios: temperature forecasting with LSTM, traffic forecasting with GRU, Transformer vs Mamba complexity, ECG anomaly detection with TCN, radar nowcasting with ConvLSTM.
4. **Latest additions:** changelog cards for new walkthrough chapters, datasets, model plugins, and research overlays.
5. **Worked examples:** guided notebooks and web-native examples for forecasting, classification, sequence-to-sequence prediction, and anomaly detection.
6. **Research mode entry point:** direct link to deep instrumentation with warnings about GPU/memory cost.
7. **Documentation links:** user guide, architecture guide, API reference, plugin authoring, contribution guide.
8. **GitHub link:** repository stats, license, contributing call-to-action, issue templates.

### Model Explorer pages
Each model has the same shell: left chapter sidebar, center 3D/2D synchronized canvas, right equation/tensor inspector panel, bottom timeline and playback controls.

#### LSTM Explorer chapters
1. Input sequence and embedding/preprocessing
2. Concatenating hidden state and input
3. Forget gate: `f_t = sigma(W_f[h_{t-1}, x_t] + b_f)`
4. Input gate: `i_t = sigma(W_i[h_{t-1}, x_t] + b_i)`
5. Candidate memory: `g_t = tanh(W_g[h_{t-1}, x_t] + b_g)`
6. Cell update: `c_t = f_t odot c_{t-1} + i_t odot g_t`
7. Output gate: `o_t = sigma(W_o[h_{t-1}, x_t] + b_o)`
8. Hidden state: `h_t = o_t odot tanh(c_t)`
9. Prediction head and loss
10. Backpropagation through time and gradient flow

#### xLSTM Explorer chapters
- Matrix memory and why it differs from scalar-vector LSTM memory
- State update with covariance-style memory growth
- mLSTM path: matrix memory, query/key/value-like interactions, normalization
- sLSTM path: scalar memory with stabilized exponential gates
- Exponential gates and numerical stabilization
- Long-context behavior and capacity comparison against classical LSTM
- Prediction head and state readout

#### GRU Explorer chapters
- Input and previous hidden state
- Reset gate
- Update gate
- Candidate hidden state
- Hidden interpolation update
- Prediction and loss
- Gradient flow and parameter comparison with LSTM

#### Mamba Explorer chapters
- Sequence stream as continuous state propagation
- Input projection and channel expansion
- State space model intuition
- Discretization: continuous parameters to token-step update
- Selective parameters `Delta`, `B`, and `C` derived from input
- Selective scan carry operation
- Hidden state evolution across time
- Output projection and prediction
- Comparison against attention without using attention imagery
- Linear complexity lab and long-sequence stress test

#### Transformer Explorer chapters
- Token embedding
- Positional encoding
- Query, key, value projections
- Scaled dot-product attention
- Multi-head attention
- Feed-forward network
- Residual connections and layer normalization
- Prediction head
- Attention-map research overlays

#### ConvLSTM Explorer chapters
- Spatiotemporal input tensor
- Convolutional gates with visible kernels
- Cell state feature maps
- Hidden state feature maps
- Kernel receptive fields over time
- Prediction for video/weather/radar sequences

#### TCN Explorer chapters
- Causal convolution
- Dilated convolution
- Residual block
- Temporal filter banks
- Receptive field growth
- Prediction and comparison with recurrent state

## 3. UI/UX Specification

### Visual language
SeqVision uses a modern scientific interface inspired by Apple, Linear, Vercel, Figma, and Notion: neutral surfaces, precise typography, strong hierarchy, low-chroma semantic color, and luminous tensor heatmaps. Dark mode is optimized for long study sessions; light mode is optimized for classroom projection.

### Layout
- **Top bar:** architecture selector, dataset selector, research toggle, theme toggle, GitHub link.
- **Chapter sidebar:** collapsible; contains chapter progress, bookmarks, and quiz status.
- **Canvas:** Three.js/WebGL scene with optional split 2D equation overlay.
- **Inspector:** tensor details, equation step, charts, gradients, parameter statistics.
- **Timeline:** play, pause, step forward, step back, reset, speed, chapter scrubber, camera reset.

### Controls
- Architecture selection
- Layer count
- Hidden units
- Sequence length
- Batch size
- Learning rate
- Animation speed
- Play, pause, step forward, step back, reset
- Camera reset, zoom, pan, orbit, free camera, auto focus, component focus, exploded view, section view

### Accessibility
- Full keyboard navigation and shortcuts
- Reduced-motion mode with stepped diagrams instead of continuous animation
- Screen-reader summaries for every animation step
- Color palettes that pass WCAG AA contrast
- Text alternatives for heatmaps and histograms

### Educational features
- Tooltips for every symbol and component
- Definitions panel with searchable glossary
- Pop-up equations and derivations
- Visual analogies such as valves for gates and conveyor belts for Mamba scan carry
- Mini quizzes at chapter end
- Knowledge checks before research mode unlock suggestions
- Progress tracking and bookmarks stored locally, with optional signed-in sync later

## 4. System Architecture

### Frontend
- **Next.js App Router + React + TypeScript:** routing, SSR for docs, streaming model metadata.
- **React Three Fiber + Three.js:** 3D visualization layer.
- **Drei + postprocessing:** camera helpers, controls, bloom, outlines, depth-of-field.
- **Zustand:** low-latency UI, animation, camera, simulation, and inspector state.
- **TanStack Query:** async datasets, model manifests, walkthrough manifests, cached API state.
- **Framer Motion / GSAP:** DOM choreography and timeline authoring where WebGL is not needed.
- **KaTeX:** equation rendering synchronized with the animation timeline.
- **D3 / Observable Plot-style chart components:** histograms, loss curves, gradient charts, complexity curves.

### Backend
- **Next.js route handlers for MVP:** serve model manifests, walkthrough JSON, dataset metadata, and precomputed tensors.
- **Optional Python FastAPI service:** future live PyTorch/ONNX execution, dataset preprocessing, and model upload sandboxing.
- **Object storage/CDN:** datasets, walkthrough assets, optimized geometry, and precomputed trace files.

### Core engines
- **Renderer engine:** scene graph, instanced tensor blocks, shader heatmaps, picking layer, camera controller.
- **Animation engine:** deterministic timeline of semantic compute events.
- **Tensor engine:** typed tensor values, shapes, statistics, heatmap textures, memory estimation.
- **Simulation engine:** model-specific forward passes and optional backprop traces.
- **Equation engine:** maps math expressions to ordered compute events.
- **Walkthrough engine:** chapters, steps, quizzes, state gates, and bookmarks.
- **Comparison engine:** synchronizes two simulations with shared dataset, timeline, and metrics.
- **Plugin system:** external model definitions, walkthroughs, datasets, render components, and equation traces.

## 5. Rendering Architecture

### Scene graph
- `SequenceStream`: time-indexed tokens/samples.
- `OperationNode`: matrix multiply, convolution, activation, normalization, scan update, residual add.
- `TensorVolume`: heatmap plane, 3D voxel grid, or matrix surface.
- `StateCarrier`: recurrent/carry path for LSTM, GRU, xLSTM, and Mamba.
- `EquationAnchor`: links rendered objects to equation tokens.
- `InspectorPickTarget`: invisible hit target with tensor metadata ID.

### GPU strategy
- Use instanced meshes for tokens, hidden units, kernels, and attention/state tiles.
- Encode tensor values in data textures consumed by shader materials.
- Use level-of-detail rules for long sequences.
- Use object pooling for frequently animated glyphs and particles.
- Use post-processing only when frame budget allows.
- Use OffscreenCanvas and workers for heavy trace preparation where supported.

### Camera system
- Modes: free, orbit, zoom, pan, auto focus, component focus, exploded view, section view, reset.
- Component focus animates bounding boxes and equation anchors together.
- Exploded view separates gates/projections/states while preserving data-flow edges.
- Section view clips model internals with shader clipping planes.

## 6. Animation Pipeline

### Event model
Every animation is a sequence of semantic events:
1. `readTensor`
2. `projectTensor`
3. `matrixMultiply` or `convolve`
4. `addBias`
5. `applyActivation`
6. `combineStates`
7. `writeTensor`
8. `emitPrediction`
9. `computeLoss`
10. `propagateGradient`

### Equation synchronization
For `f_t = sigma(W_f[h_{t-1}, x_t] + b_f)`, the equation engine emits:
1. Highlight `[h_{t-1}, x_t]`; animate concatenation.
2. Highlight `W_f`; animate weight matrix load.
3. Highlight `W_f[h_{t-1}, x_t]`; animate multiply and partial sums.
4. Highlight `+ b_f`; animate bias addition.
5. Highlight `sigma`; animate sigmoid curve and value squashing.
6. Highlight `f_t`; write gate tensor, update heatmap, and open inspector target.

### Timeline requirements
- Deterministic playback for reproducible teaching.
- Step forward/back at event granularity.
- Chapter-level and equation-token-level scrubbing.
- Shared clock for comparison mode.
- Pausable event queue that preserves partial animation state.

## 7. Tensor Computation Pipeline

### Tensor data structure
```ts
type TensorTrace = {
  id: string;
  name: string;
  role: 'input' | 'weight' | 'bias' | 'activation' | 'state' | 'gradient' | 'output';
  shape: number[];
  dtype: 'float32' | 'float16' | 'int32';
  valuesRef: string;
  stats: { mean: number; variance: number; min: number; max: number; sparsity: number };
  memoryBytes: number;
  activation?: 'sigmoid' | 'tanh' | 'relu' | 'gelu' | 'softmax' | 'identity';
  gradientRef?: string;
  heatmapTextureRef?: string;
  equationRefs: string[];
};
```

### Live tensor inspector
On click, the inspector shows tensor name, shape, dimensions, values, mean, variance, distribution, heatmap, memory usage, activation function, gradient, weight matrix, and bias. Large tensors are virtualized with sampled previews and progressive detail loading.

### Simulation modes
- **Pedagogical mode:** small deterministic tensors with rounded values.
- **Dataset mode:** real data with precomputed traces.
- **Research mode:** full instrumentation and gradients.
- **Performance mode:** statistical summaries only for long-sequence demos.

## 8. Dataset Support

Supported dataset categories:
- Temperature forecasting
- Electricity demand
- Traffic flow
- Weather
- Stock price
- Energy consumption
- ECG
- Sensor signals

Dataset manifests include schema, normalization, splits, license, task type, recommended models, preview rows, and trace compatibility. MVP ships with small curated CSV/Parquet samples; production stores larger datasets in object storage with CDN caching.

## 9. Comparison and Complexity Modes

### Comparison pairs
- LSTM vs GRU
- LSTM vs xLSTM
- Transformer vs Mamba
- TCN vs LSTM
- ConvLSTM vs LSTM

### Surfaced metrics
- Memory footprint
- Latency
- Parameter count
- Computational complexity
- Inference speed
- Accuracy or task metric
- Gradient stability
- Effective receptive field/context length

### Transformer vs Mamba complexity lab
- Sequence length slider from 10 to 10,000.
- Transformer curve: O(n²) pairwise token interactions.
- Mamba curve: O(n) selective scan propagation.
- Runtime growth is animated with counters, graph traces, and compute-node expansion.
- Mamba view shows state carried forward continuously; Transformer view shows quadratic interaction growth only in the comparison panel.

## 10. API Specification

### Model APIs
- `GET /api/models` returns supported architecture manifests.
- `GET /api/models/:modelId` returns configuration schema, equations, chapters, render manifest, and defaults.
- `POST /api/models/:modelId/simulate` runs or retrieves a simulation trace for hyperparameters and dataset.

### Walkthrough APIs
- `GET /api/walkthroughs/:modelId` returns chapters, steps, quizzes, equation refs, and animation event refs.
- `GET /api/walkthroughs/:modelId/:chapterId` returns focused step details and assets.

### Tensor APIs
- `GET /api/tensors/:traceId/:tensorId` returns tensor metadata and sampled values.
- `GET /api/tensors/:traceId/:tensorId/values?offset=&limit=` returns paginated values.
- `GET /api/tensors/:traceId/:tensorId/gradient` returns gradient summary and samples.

### Animation APIs
- `GET /api/traces/:traceId/events` returns ordered animation events.
- `GET /api/traces/:traceId/state?time=` returns simulation state at a timestamp.
- `POST /api/traces/compare` returns synchronized traces and metrics for two models.

### Dataset APIs
- `GET /api/datasets` returns dataset manifests.
- `GET /api/datasets/:datasetId/preview` returns sampled rows and charts.
- `POST /api/datasets/:datasetId/trace` returns or schedules a model-specific trace.

## 11. Folder Structure

```txt
src/
  app/                    # Next.js routes and route handlers
  components/             # shared UI, inspector, controls, layout
  renderer/               # React Three Fiber scenes, materials, cameras
  animations/             # timelines, event interpreters, easing, choreography
  simulation/             # model forward passes and trace builders
  models/                 # LSTM, xLSTM, GRU, Mamba, Transformer, ConvLSTM, TCN manifests
  walkthrough/            # chapter manifests, quiz schemas, progress logic
  equations/              # equation ASTs, KaTeX mapping, token synchronization
  tensor/                 # tensor stores, statistics, heatmap generation, sampling
  hooks/                  # app hooks for controls, traces, cameras, shortcuts
  stores/                 # Zustand stores
  api/                    # typed API clients
  assets/                 # icons, shaders, sample data, static meshes
  math/                   # numerical utilities, complexity calculators
  utils/                  # general utilities
  tests/                  # unit, integration, animation, accessibility, performance
  docs/                   # product, architecture, API, roadmap, contribution docs
```

## 12. State Management

- `appStore`: feature flags, loaded manifests, global errors.
- `uiStore`: theme, panels, selected architecture, selected dataset.
- `cameraStore`: mode, target, bookmarks, clipping planes.
- `animationStore`: timeline status, current event, speed, chapter, scrubber.
- `simulationStore`: hyperparameters, trace ID, model output, metrics.
- `modelStore`: active model graph, equation refs, render nodes.
- `walkthroughStore`: progress, quiz results, bookmarks.
- `inspectorStore`: selected tensor/component, sampled values, charts.

## 13. Testing Strategy

- **Unit tests:** tensor stats, equation event generation, complexity calculators, model trace builders.
- **Integration tests:** API contracts, walkthrough loading, trace playback, dataset loading.
- **UI tests:** explorer controls, chapter sidebar, inspector, comparison mode, theme switching.
- **Animation tests:** deterministic event ordering, equation highlight synchronization, step forward/back correctness.
- **Performance tests:** FPS budget, memory ceiling, long-sequence progressive rendering, worker latency.
- **Cross-browser tests:** Chromium, Firefox, WebKit; WebGL capability fallbacks.
- **Accessibility tests:** keyboard navigation, focus states, ARIA labels, reduced motion, color contrast.

## 14. Performance Strategy

- Lazy load model explorers, research overlays, and heavy charts.
- Split each architecture into route-level and component-level chunks.
- Progressive-load trace detail: metadata first, stats second, values on inspection.
- Cache model manifests, walkthroughs, and datasets with TanStack Query and CDN headers.
- Use Web Workers for simulation trace generation and tensor statistics.
- Use OffscreenCanvas for compatible background rendering/precomputation.
- Use instancing, data textures, shader heatmaps, and pooled geometry.
- Virtualize large tensor tables, logs, chapter lists, and dataset previews.
- Degrade post-processing and particle density when frame budget drops.
- Keep memory bounded with trace windowing and explicit disposal of geometries/materials/textures.

## 15. Deployment and Operations

- **Docker:** reproducible local and CI builds.
- **GitHub Actions:** lint, typecheck, unit tests, Playwright smoke tests, build, bundle analysis.
- **Vercel:** primary frontend deployment with preview environments per PR.
- **Cloudflare:** CDN caching for static assets, trace files, datasets, and docs.
- **Monitoring:** Web Vitals, client error reporting, route latency, animation FPS telemetry.
- **Analytics:** privacy-conscious event analytics for chapter completion, control usage, and failed loads.
- **Release process:** semantic versioning, changelog, model manifest compatibility checks.

## 16. Documentation Plan

- Developer setup guide
- Architecture guide
- API reference
- Walkthrough authoring guide
- Model plugin guide
- Dataset contribution guide
- Rendering and shader guide
- Testing guide
- End-user tutorials for each architecture
- Educator guide with classroom flows and quiz usage

## 17. Phased Roadmap

### Phase 1: MVP LSTM
- Homepage shell and architecture selector
- LSTM explorer with full gate walkthrough
- Equation-synchronized animation engine
- Basic tensor inspector
- Pedagogical toy dataset

### Phase 2: GRU and Transformer
- GRU explorer and comparison against LSTM
- Transformer explorer with attention maps
- Shared controls, timeline, and chapter framework
- Initial complexity visualizations

### Phase 3: Mamba, xLSTM, and research mode
- Flagship Mamba selective scan visualization
- xLSTM mLSTM/sLSTM walkthroughs
- Research mode overlays for hidden states, gradients, histograms, and parameter statistics
- Transformer vs Mamba O(n²) vs O(n) lab

### Phase 4: Tensor inspector and dataset support
- Full live tensor inspector
- Dataset catalog and preprocessing manifests
- Real-data traces for temperature, electricity, traffic, weather, stock, energy, ECG, and sensors
- Exportable charts and snapshots

### Phase 5: Community and marketplace
- Plugin API
- Community model/walkthrough marketplace
- Contribution validation tools
- Moderated dataset and walkthrough submissions

### Stretch goals
- Live PyTorch model visualization
- Custom model upload
- ONNX support
- Hugging Face integration
- Real-time inference
- Explainable AI overlays
- Educational courses
- Notebook integration
- Citation generator
- Animation export
- VR and AR modes
- Collaborative classroom mode

## 18. Risk Analysis

| Risk | Impact | Mitigation |
| --- | --- | --- |
| WebGL scenes become too heavy | Poor FPS and unusable teaching experience | Instancing, LOD, trace windowing, reduced effects, performance mode |
| Equations drift from animation | Loss of educational trust | Equation AST as source of event timeline truth, synchronization tests |
| Research mode overwhelms beginners | Cognitive overload | Beginner/research mode separation, progressive disclosure, glossary |
| Dataset licensing issues | Cannot ship examples | Use permissively licensed datasets, manifest license checks |
| Browser/GPU differences | Broken visuals | Capability detection, fallbacks, cross-browser tests |
| Plugin quality variance | Poor community content | Validation CLI, schema checks, review workflow, marketplace moderation |

## 19. Build Definition of Done

A feature is complete when it has a typed manifest, equation mapping, animation events, renderer representation, inspector metadata, keyboard access, tests, documentation, and performance behavior under the default FPS/memory budget.
