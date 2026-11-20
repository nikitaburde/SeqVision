# SeqVision explorer

The reference is Brendan Bycroft’s [LLM Visualization](https://bbycroft.net/llm). The desktop capture showed an illustrated chapter guide, a table of contents, chapter navigation, and a dedicated model viewport with model selection and view controls. The captured viewport did not contain the WebGL drawing, so its rendering and mobile behavior could not be assessed from that capture. Firecrawl identified a light surface, serif typography, a navy header, and pale blue selection states.

SeqVision adapts the split between viewport and guide. The model has the larger left pane, and the right pane contains an explanation, equation, chapter list, and tensor inspector. Playback and time-step controls live beside the stage. On narrower screens, the stage stacks above the guide. The model switcher keeps all seven architectures reachable inside the workspace.

The explorer uses a plum stage, a lavender guide, a sans-serif interface, and monospace equations. Stage surfaces range from `#171225` to `#2c2143`, the guide uses `#f8f5fb`, and the active node uses `#d9c8ff` for its label. Teal and coral distinguish nonnegative and negative tensor values. The 3D blocks are generated from SeqVision’s computed values, and the connections indicate walkthrough order. No reference imagery is required.
