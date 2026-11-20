# SeqVision API

All requests and responses use JSON. Invalid inputs return HTTP 400, unknown resources return 404, and stale simulation steps return 409.

## Models and walkthroughs

| Method and path | Result |
| --- | --- |
| `GET /api/models` | Model catalog |
| `GET /api/models/:modelId/config` | Model metadata and chapters |
| `GET /api/walkthroughs/:modelId` | Chapters for a model |
| `GET /api/walkthroughs/:modelId/chapters/:chapterId` | One chapter |
| `GET /api/compare/pairs` | Available comparisons |

## Simulation

Send `POST /api/simulation/start` with an optional model ID and lesson options. The default is a three-step, four-feature LSTM example. The supported lesson ranges are 1–24 time steps and 1–8 features. Use a dataset ID for a synthetic signal or an empty string for the example input.

```json
{"modelId":"lstm","options":{"length":3,"width":4,"dataset":"temperature"}}
```

The response includes a run ID, the zero-based playhead, the current chapter, and its equation and tensor. Fetch that state with `GET /api/simulation/:runId/state`. To advance or rewind, send `POST /api/simulation/step` with the run ID and a direction of `forward` or `backward`. Include the last observed `currentStep` to detect stale updates. The playhead stops at each end of the timeline.

Runs are stored in one server process. The server retains the most recent 256 runs until restart.

## Tensors, equations, and events

| Method and path | Result |
| --- | --- |
| `GET /api/tensors/:runId/:tensorId` | Operation tensor at the run's current time step |
| `GET /api/tensors/:runId/:tensorId/stats` | Float32 size, mean, population variance, extrema, and eight histogram counts |
| `GET /api/equations/:modelId/:opId` | Teaching equation and its chapter-level timeline mapping |
| `GET /api/animations/events?runId=…&t=…` | Operation and tensor references for one timeline step, defaulting to the playhead |

Operation and tensor IDs use chapter IDs such as `lstm-2`. Chapter titles as lowercase slugs, such as `forget-gate`, are also accepted.

## Datasets, research, and progress

- `GET /api/datasets` lists normalized synthetic dataset presets.
- `GET /api/datasets/:datasetId/samples?start=0&length=24` returns a reproducible window. The default length is four and the maximum is the upper bound in the dataset catalog.
- `POST /api/research/query` takes a `runId` and optional `query` containing a chapter ID or slug. It returns that operation's frames across the run. The current chapter is used when the query is omitted.
- `POST /api/progress` takes `modelId`, `chapterId`, and `completed`. It stores completion in a client cookie. Send the cookie with `GET /api/progress` to retrieve completed chapter IDs. The explorer stores completion locally in the browser.
