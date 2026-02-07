"use client";

type SimulationPhase = "idle" | "running" | "completed";

interface SimulationStatusBarProps {
  phase: SimulationPhase;
}

export default function SimulationStatusBar({
  phase,
}: SimulationStatusBarProps) {
  if (phase === "idle") return null;

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-5 py-3 text-sm font-medium transition-all ${
        phase === "running"
          ? "border-primary/30 bg-primary/5 text-primary"
          : "border-success/30 bg-success/5 text-success"
      }`}
    >
      {phase === "running" ? (
        <>
          <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
          Running simulation...
        </>
      ) : (
        <>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
          Results ready
        </>
      )}
    </div>
  );
}
