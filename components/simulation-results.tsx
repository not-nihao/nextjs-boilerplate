"use client";

import { useState } from "react";

export interface PersonaResult {
  personaName: string;
  purchaseProbability: number;
  decisionSummary: string;
}

interface SimulationResultsProps {
  results: PersonaResult[];
  onRunAnother: () => void;
  rawJson?: string;
}

function ProbabilityGauge({ value }: { value: number }) {
  const circumference = 2 * Math.PI * 36;
  const filled = (value / 100) * circumference;
  const color =
    value >= 70
      ? "text-success"
      : value >= 40
        ? "text-primary"
        : "text-muted-foreground";
  const strokeColor =
    value >= 70
      ? "stroke-success"
      : value >= 40
        ? "stroke-primary"
        : "stroke-muted-foreground";

  return (
    <div className="relative flex items-center justify-center">
      <svg width="88" height="88" viewBox="0 0 88 88" className="-rotate-90">
        <circle
          cx="44"
          cy="44"
          r="36"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-muted/60"
        />
        <circle
          cx="44"
          cy="44"
          r="36"
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - filled}
          className={`${strokeColor} transition-all duration-1000 ease-out`}
        />
      </svg>
      <span
        className={`absolute text-lg font-bold font-mono ${color}`}
      >
        {value}%
      </span>
    </div>
  );
}

export default function SimulationResults({
  results,
  onRunAnother,
  rawJson,
}: SimulationResultsProps) {
  const [showRawJson, setShowRawJson] = useState(false);
  const [copied, setCopied] = useState(false);

  if (results.length === 0) return null;

  const handleCopy = () => {
    const text = results
      .map(
        (r) =>
          `${r.personaName}: ${r.purchaseProbability}% - ${r.decisionSummary}`
      )
      .join("\n\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Simulation Results
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {copied ? "Copied!" : "Copy Results"}
          </button>
          <button
            onClick={onRunAnother}
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:brightness-110 transition-all"
          >
            Run Another
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {results.map((result) => {
          const isHigh = result.purchaseProbability >= 70;
          return (
            <div
              key={result.personaName}
              className={`rounded-xl border p-5 transition-all ${
                isHigh
                  ? "border-success/30 bg-success/5"
                  : "border-border bg-card"
              }`}
            >
              <div className="flex items-start gap-5">
                <ProbabilityGauge value={result.purchaseProbability} />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground">
                    {result.personaName}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">
                    Purchase Probability
                  </p>
                  <div className="mt-3 w-full rounded-full bg-muted h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-1000 ease-out ${
                        isHigh ? "bg-success" : result.purchaseProbability >= 40 ? "bg-primary" : "bg-muted-foreground"
                      }`}
                      style={{ width: `${result.purchaseProbability}%` }}
                    />
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                    {result.decisionSummary}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Raw JSON toggle */}
      {rawJson && (
        <div className="mt-2">
          <button
            onClick={() => setShowRawJson(!showRawJson)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showRawJson ? "Hide Raw JSON" : "View Raw JSON"}
          </button>
          {showRawJson && (
            <pre className="mt-2 max-h-64 overflow-auto rounded-lg border border-border bg-background p-4 text-xs text-muted-foreground font-mono leading-relaxed">
              {rawJson}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
