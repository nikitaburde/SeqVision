# SeqVision API Specification

## Models
- `GET /api/models` — list supported model metadata.
- `GET /api/models/:modelId/config` — fetch model configuration and chapter definitions.

## Walkthroughs
- `GET /api/walkthroughs/:modelId` — list chapters for a model.
- `GET /api/walkthroughs/:modelId/chapters/:chapterId` — fetch chapter details.

## Simulation
- `POST /api/simulation/start` — start a run with model + controls.
- `POST /api/simulation/step` — step forward/backward.
- `GET /api/simulation/:runId/state` — fetch active state snapshot.

## Tensors
- `GET /api/tensors/:runId/:tensorId` — tensor values and metadata.
- `GET /api/tensors/:runId/:tensorId/stats` — tensor stats/distribution/memory profile.

## Equations and Animation Events
- `GET /api/equations/:modelId/:opId` — equation and atomic mapping.
- `GET /api/animations/events?runId=&t=` — timeline event stream.

## Datasets
- `GET /api/datasets` — dataset catalog.
- `GET /api/datasets/:datasetId/samples` — sample time windows.

## Learning Progress and Advanced Features
- `POST /api/progress` — persist chapter completion/bookmarks.
- `GET /api/compare/pairs` — available comparison presets.
- `POST /api/research/query` — research panel query and trace request.

## Event Schema
Each animation event includes:
- `eventId`
- `t`
- `opId`
- `tensorIds[]`
- `equationTermIds[]`
- `cameraCue`
- `chapterId`
