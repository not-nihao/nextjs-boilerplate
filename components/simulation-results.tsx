"use client";

import { useState } from "react";

function formatTextWithParagraphs(
  text: string,
  boldFirst: boolean = false
): { text: string; isBold: boolean }[] {
  // Split into sentences, then group into paragraphs (2-3 sentences each)
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const paragraphs: { text: string; isBold: boolean }[] = [];

  for (let i = 0; i < sentences.length; i += 2) {
    const chunk = sentences.slice(i, i + 2).join(" ").trim();
    if (chunk) {
      paragraphs.push({
        text: chunk,
        isBold: boldFirst && i === 0,
      });
    }
  }

  return paragraphs.length > 0 ? paragraphs : [{ text, isBold: boldFirst }];
}

export interface PersonaResult {
  personaName: string;
  purchaseProbability: number;
  decisionSummary: string;
}

interface SimulationResultsProps {
  results: PersonaResult[];
  summary?: string;
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
      <span className={`absolute text-lg font-bold font-mono ${color}`}>
        {value}%
      </span>
    </div>
  );
}

export default function SimulationResults({
  results,
  summary,
  onRunAnother,
  rawJson,
}: SimulationResultsProps) {
  const [showRawJson, setShowRawJson] = useState(false);
  const [copied, setCopied] = useState(false);

  if (results.length === 0 && !summary) return null;

  // Filter out duplicate persona results that match the summary
  const uniqueResults = results.filter(
    (r) => !summary || r.decisionSummary.trim() !== summary.trim()
  );

  const handleCopy = () => {
    let text = "";
    if (summary) {
      text = `Summary:\n${summary}\n\n`;
    }
    if (uniqueResults.length > 0) {
      text += uniqueResults
        .map(
          (r) =>
            `${r.personaName}: ${r.purchaseProbability >= 0 ? `${r.purchaseProbability}%` : "N/A"} - ${r.decisionSummary}`
        )
        .join("\n\n");
    }
    navigator.clipboard.writeText(text.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Simulation Results
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopy}
            className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {copied ? "Copied!" : "Copy Results"}
          </button>
          <button
            onClick={onRunAnother}
            className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:brightness-110 transition-all"
          >
            Run Another
          </button>
        </div>
      </div>

      {/* Summary Section - Hero Card */}
      {summary && (
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-primary/[0.02] to-transparent p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <svg
                className="h-5 w-5 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-foreground mb-4">
                Analysis Summary
              </h3>
              <div className="space-y-4">
                {formatTextWithParagraphs(summary, true).map((para, i) => (
                  <p
                    key={i}
                    className={
                      para.isBold
                        ? "text-base font-medium text-foreground leading-relaxed"
                        : "text-sm text-muted-foreground leading-loose"
                    }
                  >
                    {para.text}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Persona Results */}
      {uniqueResults.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {uniqueResults.map((result) => {
            const hasGauge = result.purchaseProbability >= 0;
            const isHigh = hasGauge && result.purchaseProbability >= 70;
            return (
              <div
                key={result.personaName}
                className={`rounded-xl border p-6 transition-all ${
                  isHigh
                    ? "border-success/30 bg-success/5"
                    : "border-border bg-card"
                } ${!hasGauge ? "sm:col-span-2 lg:col-span-3" : ""}`}
              >
                <div className="flex items-start gap-5">
                  {hasGauge && (
                    <ProbabilityGauge value={result.purchaseProbability} />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground">
                      {result.personaName}
                    </h3>
                    {hasGauge && (
                      <>
                        <p className="mt-1 text-xs font-medium text-muted-foreground">
                          Purchase Probability
                        </p>
                        <div className="mt-3 w-full rounded-full bg-muted h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-1000 ease-out ${
                              isHigh
                                ? "bg-success"
                                : result.purchaseProbability >= 40
                                  ? "bg-primary"
                                  : "bg-muted-foreground"
                            }`}
                            style={{ width: `${result.purchaseProbability}%` }}
                          />
                        </div>
                      </>
                    )}
                    <div
                      className={`${hasGauge ? "mt-4" : "mt-3"} space-y-3`}
                    >
                      {formatTextWithParagraphs(
                        result.decisionSummary,
                        true
                      ).map((para, i) => (
                        <p
                          key={i}
                          className={
                            para.isBold
                              ? "text-sm font-medium text-foreground leading-relaxed"
                              : "text-sm text-muted-foreground leading-loose"
                          }
                        >
                          {para.text}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Raw JSON toggle */}
      {rawJson && (
        <div className="mt-4">
          <button
            onClick={() => setShowRawJson(!showRawJson)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showRawJson ? "Hide Raw JSON" : "View Raw JSON"}
          </button>
          {showRawJson && (
            <pre className="mt-3 max-h-64 overflow-auto rounded-lg border border-border bg-background p-4 text-xs text-muted-foreground font-mono leading-relaxed">
              {rawJson}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
