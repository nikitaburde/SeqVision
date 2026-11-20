"use client";

import { useEffect, useState } from "react";

import { PLAYBACK_STEP_MS } from "@/constants/animations";

export function usePlayback(lastStep: number, speed = 1, stepMs = PLAYBACK_STEP_MS) {
  const [position, setPosition] = useState(0);
  const [mode, setMode] = useState<"idle" | "running" | "paused" | "complete">("idle");
  const [revision, setRevision] = useState(0);
  const step = Math.min(position, lastStep);
  const running = mode === "running";

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => {
      if (step === lastStep) {
        setMode("complete");
      } else {
        setPosition(step + 1);
      }
    }, stepMs / speed);
    return () => window.clearTimeout(timer);
  }, [running, step, lastStep, speed, stepMs, revision]);

  function seek(next: number) {
    setMode("idle");
    setPosition(Math.max(0, Math.min(lastStep, next)));
  }

  function toggle() {
    if (running) {
      setMode("paused");
      return;
    }
    if (step === lastStep && mode !== "paused") setPosition(0);
    setMode("running");
  }

  function restart() {
    setRevision(value => value + 1);
    setPosition(0);
    setMode("running");
  }

  return { step, running, completed: mode === "complete", seek, toggle, restart };
}

export function LessonControls({ player, lastStep }: {
  player: ReturnType<typeof usePlayback>;
  lastStep: number;
}) {
  const { step, running, seek, toggle } = player;
  const button = "rounded-md border px-3 py-2 text-sm hover:bg-accent disabled:opacity-40";
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button type="button" className={button} onClick={toggle}>{running ? "Pause" : "Play"}</button>
        <button type="button" className={button} disabled={step === 0} onClick={() => seek(step - 1)}>Step back</button>
        <button type="button" className={button} disabled={step === lastStep} onClick={() => seek(step + 1)}>Step forward</button>
        <button type="button" className={button} onClick={() => seek(0)}>Reset</button>
      </div>
      <label className="block text-sm">
        Timeline · {step + 1} / {lastStep + 1}
        <input type="range" className="block w-full" min={0} max={lastStep} value={step} onChange={event => seek(Number(event.target.value))} />
      </label>
    </div>
  );
}
