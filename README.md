# SeqVision

SeqVision is an interactive guide to LSTM, GRU, Transformer, Mamba, xLSTM, ConvLSTM, and temporal convolutional networks. Each walkthrough links an equation to the values it produces for a small, fixed-weight example.

- Step through an operation at a time, adjust the input sequence, inspect tensor values and distributions, and view small tensors in 3D.
- Compare two architectures at the same time step and explore how causal attention and selective scan operation counts grow.
- Follow an operation in Research Mode and download the trace as JSON.

The examples use deterministic teaching models and synthetic signals. Chapter completion stays in the browser. API runs are held in the server process.

## Development

```bash
npm ci
npm run dev
```

Open [SeqVision locally](http://localhost:3000).

## Language Model Lab

Open [Language Model Lab](http://localhost:3000/language) after starting the dev server. Enter one to eight letters from A to F, then select **Run prompt**. Use the 3D blocks or timeline to inspect signed embeddings, causal attention, weighted sums, logits, and emitted tokens for each pass. The tiny decoder uses fixed weights designed for sorting and runs entirely in the browser.

The 12-, 24-, and 48-layer GPT-style previews show decoder topology and layer dimensions without loading checkpoints. Link to `/language` from a personal site to open the lab directly.

## Verification

```bash
npm run lint
npm test
npm run build
```

## Documentation

- [Architecture](src/docs/architecture.md)
- [API reference](src/docs/api.md)
- [Roadmap](src/docs/roadmap.md)
- [Contributing](src/docs/contributing.md)
