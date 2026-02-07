"use client";

import { useState, useCallback } from "react";
import Header from "@/components/header";
import SimulationInput from "@/components/simulation-input";
import SimulationResults, {
  type PersonaResult,
} from "@/components/simulation-results";
import SimulationStatusBar from "@/components/simulation-status-bar";
import DAGVisualization from "@/components/dag-visualization";

type SimulationPhase = "idle" | "running" | "completed" | "error";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([
    "orchestrator",
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<SimulationPhase>("idle");
  const [results, setResults] = useState<PersonaResult[]>([]);
  const [summary, setSummary] = useState("");
  const [rawJson, setRawJson] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  /**
   * Attempt to extract structured persona results from the raw API response.
   * The agent may return data in various shapes, so we try several strategies.
   */
  function parseApiResponse(data: unknown): {
    results: PersonaResult[];
    summary: string;
    raw: string;
  } {
    const raw = JSON.stringify(data, null, 2);
    let summaryText = "";

    // Extract summary from response if present
    if (data && typeof data === "object") {
      const obj = data as Record<string, unknown>;
      // Check for summary in result object
      if (obj.result && typeof obj.result === "object") {
        const result = obj.result as Record<string, unknown>;
        if (typeof result.summary === "string") {
          summaryText = result.summary;
        }
      }
      // Also check top-level summary
      if (!summaryText && typeof obj.summary === "string") {
        summaryText = obj.summary;
      }
    }

    // If the response is already an array of PersonaResult-like objects
    if (Array.isArray(data)) {
      const mapped = data
        .map(mapToPersonaResult)
        .filter(Boolean) as PersonaResult[];
      if (mapped.length > 0) return { results: mapped, summary: summaryText, raw };
    }

    // If it has a result / results / output / data key
    const obj = data as Record<string, unknown>;
    for (const key of [
      "results",
      "result",
      "output",
      "data",
      "personas",
      "response",
    ]) {
      const val = obj?.[key];
      if (Array.isArray(val)) {
        const mapped = val
          .map(mapToPersonaResult)
          .filter(Boolean) as PersonaResult[];
        if (mapped.length > 0) return { results: mapped, summary: summaryText, raw };
      }
      if (val && typeof val === "object" && !Array.isArray(val)) {
        const nested = val as Record<string, unknown>;
        // Could be { personaName: ..., purchaseProbability: ... }
        const single = mapToPersonaResult(nested);
        if (single) return { results: [single], summary: summaryText, raw };
      }
      // If the value is a string, try to parse it as JSON
      if (typeof val === "string") {
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) {
            const mapped = parsed
              .map(mapToPersonaResult)
              .filter(Boolean) as PersonaResult[];
            if (mapped.length > 0) return { results: mapped, summary: summaryText, raw };
          }
        } catch {
          // not JSON — treat as plain text summary
        }
      }
    }

    // Fallback: treat the entire response as a single text result
    const textContent = extractTextContent(data);
    if (textContent) {
      return {
        results: [
          {
            personaName: "AI Agent Response",
            purchaseProbability: -1, // signals "no gauge"
            decisionSummary: textContent,
          },
        ],
        summary: summaryText,
        raw,
      };
    }

    return { results: [], summary: summaryText, raw };
  }

  function mapToPersonaResult(item: unknown): PersonaResult | null {
    if (!item || typeof item !== "object") return null;
    const obj = item as Record<string, unknown>;

    const name =
      (obj.personaName as string) ||
      (obj.persona_name as string) ||
      (obj.persona as string) ||
      (obj.name as string) ||
      "";

    const prob =
      typeof obj.purchaseProbability === "number"
        ? obj.purchaseProbability
        : typeof obj.purchase_probability === "number"
          ? obj.purchase_probability
          : typeof obj.probability === "number"
            ? obj.probability
            : typeof obj.score === "number"
              ? obj.score
              : -1;

    const summary =
      (obj.decisionSummary as string) ||
      (obj.decision_summary as string) ||
      (obj.summary as string) ||
      (obj.reasoning as string) ||
      (obj.explanation as string) ||
      (obj.text as string) ||
      (obj.message as string) ||
      "";

    if (!name && !summary) return null;

    return {
      personaName: name || "Persona",
      purchaseProbability: prob,
      decisionSummary: summary || "No summary provided.",
    };
  }

  function extractTextContent(data: unknown): string {
    if (typeof data === "string") return data;
    if (!data || typeof data !== "object") return "";
    const obj = data as Record<string, unknown>;
    for (const key of [
      "message",
      "text",
      "content",
      "output",
      "response",
      "result",
      "summary",
    ]) {
      if (typeof obj[key] === "string" && (obj[key] as string).length > 0) {
        return obj[key] as string;
      }
    }
    return "";
  }

  const runSimulation = useCallback(async () => {
    setIsRunning(true);
    setPhase("running");
    setResults([]);
    setSummary("");
    setRawJson("");
    setErrorMessage("");

    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `API returned ${res.status}`);
      }

      // Parse the agent response
      const { results: parsedResults, summary: parsedSummary, raw } = parseApiResponse(data);

      if (parsedResults.length > 0) {
        setResults(parsedResults);
      } else if (parsedSummary) {
        // No persona results but we have a summary
        setResults([]);
      } else {
        // No parseable results but we still have raw data
        setResults([
          {
            personaName: "Agent Response",
            purchaseProbability: -1,
            decisionSummary:
              "The agent returned data but it could not be parsed into persona results. Check the raw JSON below.",
          },
        ]);
      }

      setSummary(parsedSummary);
      setRawJson(raw);
      setIsRunning(false);
      setPhase("completed");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
      setIsRunning(false);
      setPhase("error");
    }
  }, [prompt]);

  const handleRunAnother = () => {
    setPhase("idle");
    setResults([]);
    setSummary("");
    setRawJson("");
    setErrorMessage("");
    setPrompt("");
    setSelectedPersonas(["orchestrator"]);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <Header />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-8 lg:px-8">
        <SimulationStatusBar phase={phase} errorMessage={errorMessage} />

        <SimulationInput
          prompt={prompt}
          setPrompt={setPrompt}
          selectedPersonas={selectedPersonas}
          setSelectedPersonas={setSelectedPersonas}
          onRunSimulation={runSimulation}
          isRunning={isRunning}
        />

        <SimulationResults
          results={results}
          summary={summary}
          onRunAnother={handleRunAnother}
          rawJson={rawJson}
        />
      </main>

      {/* DAG Visualization - shows AI agents processing during API call */}
      {phase === "running" && <DAGVisualization isActive={true} />}
    </div>
  );
}
