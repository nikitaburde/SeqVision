import type { AnimationEvent } from "@/types";

export interface TimelineState {
  playhead: number;
  events: AnimationEvent[];
}

export function getActiveEvents(state: TimelineState): AnimationEvent[] {
  return state.events.filter((event) => event.t <= state.playhead);
}
