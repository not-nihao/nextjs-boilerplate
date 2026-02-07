"use client";

import { useEffect, useState } from "react";

interface PersonaStatus {
  id: string;
  name: string;
  status: "waiting" | "processing" | "completed";
  statusText: string;
}

interface ExecutionFlowProps {
  isRunning: boolean;
  orchestratorStatus: string;
  personaStatuses: PersonaStatus[];
  hasResults: boolean;
}

function PulsingDot({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <span className="relative ml-2 inline-flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
    </span>
  );
}

function StatusBadge({
  status,
}: {
  status: "waiting" | "processing" | "completed";
}) {
  const styles = {
    waiting: "bg-muted text-muted-foreground",
    processing: "bg-primary/15 text-primary",
    completed: "bg-success/15 text-success",
  };

  const labels = {
    waiting: "Waiting",
    processing: "Processing",
    completed: "Completed",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

export default function ExecutionFlow({
  isRunning,
  orchestratorStatus,
  personaStatuses,
  hasResults,
}: ExecutionFlowProps) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    if (!isRunning) {
      setDots("");
      return;
    }
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, [isRunning]);

  if (!isRunning && !hasResults) return null;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        AI Execution Flow
      </h2>

      {/* Orchestrator Card */}
      <div
        className={`rounded-xl border p-5 transition-all ${
          isRunning
            ? "border-primary/40 bg-primary/5 shadow-[0_0_20px_rgba(6,182,212,0.08)]"
            : "border-border bg-card"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                isRunning ? "bg-primary/20" : "bg-muted"
              }`}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={isRunning ? "text-primary" : "text-muted-foreground"}
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Orchestrator Agent
              </h3>
              <p className="text-xs text-muted-foreground font-mono">
                {orchestratorStatus}
                {isRunning && dots}
              </p>
            </div>
          </div>
          <PulsingDot active={isRunning} />
        </div>
      </div>

      {/* Connection Line */}
      {personaStatuses.length > 0 && (
        <div className="flex justify-center">
          <div className="h-6 w-px bg-border" />
        </div>
      )}

      {/* Persona Cards */}
      {personaStatuses.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {personaStatuses.map((persona) => (
            <div
              key={persona.id}
              className={`rounded-xl border p-4 transition-all ${
                persona.status === "processing"
                  ? "border-primary/30 bg-primary/5"
                  : persona.status === "completed"
                    ? "border-success/30 bg-success/5"
                    : "border-border bg-card"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-foreground">
                  {persona.name}
                </h4>
                <StatusBadge status={persona.status} />
              </div>
              <p className="text-xs text-muted-foreground font-mono">
                {persona.statusText}
                {persona.status === "processing" && dots}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
