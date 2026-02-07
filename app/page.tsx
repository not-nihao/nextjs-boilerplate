"use client";

import { useState, useCallback, useRef } from "react";
import Header from "@/components/header";
import SimulationInput from "@/components/simulation-input";
import ExecutionFlow from "@/components/execution-flow";
import SimulationResults, {
  type PersonaResult,
} from "@/components/simulation-results";
import SimulationStatusBar from "@/components/simulation-status-bar";

interface PersonaFlowStatus {
  id: string;
  name: string;
  status: "waiting" | "processing" | "completed";
  statusText: string;
}

type SimulationPhase = "idle" | "running" | "completed" | "error";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([
    "orchestrator",
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<SimulationPhase>("idle");
  const [orchestratorStatus, setOrchestratorStatus] = useState("");
  const [personaStatuses, setPersonaStatuses] = useState<PersonaFlowStatus[]>(
    []
  );
  const [results, setResults] = useState<PersonaResult[]>([]);
  const [rawJson, setRawJson] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const clearTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  const addTimeout = (fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timeoutsRef.current.push(id);
    return id;
  };

  /**
   * Attempt to extract structured persona results from the raw API response.
   * The agent may return data in various shapes, so we try several strategies.
   */
  function parseApiResponse(data: unknown): {
    results: PersonaResult[];
    raw: string;
  } {
    const raw = JSON.stringify(data, null, 2);

    // If the response is already an array of PersonaResult-like objects
    if (Array.isArray(data)) {
      const mapped = data
        .map(mapToPersonaResult)
        .filter(Boolean) as PersonaResult[];
      if (mapped.length > 0) return { results: mapped, raw };
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
        if (mapped.length > 0) return { results: mapped, raw };
      }
      if (val && typeof val === "object" && !Array.isArray(val)) {
        const nested = val as Record<string, unknown>;
        // Could be { personaName: ..., purchaseProbability: ... }
        const single = mapToPersonaResult(nested);
        if (single) return { results: [single], raw };
      }
      // If the value is a string, try to parse it as JSON
      if (typeof val === "string") {
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) {
            const mapped = parsed
              .map(mapToPersonaResult)
              .filter(Boolean) as PersonaResult[];
            if (mapped.length > 0) return { results: mapped, raw };
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
        raw,
      };
    }

    return { results: [], raw };
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
    clearTimeouts();
    setIsRunning(true);
    setPhase("running");
    setResults([]);
    setRawJson("");
    setErrorMessage("");

    // Start the animated flow
    setOrchestratorStatus("Sending prompt to agent");
    setPersonaStatuses([]);

    // Animate orchestrator status while waiting
    addTimeout(() => {
      setOrchestratorStatus("Agent is analyzing promotion");
    }, 2000);

    addTimeout(() => {
      setOrchestratorStatus("Simulating persona responses");
      setPersonaStatuses([
        {
          id: "agent-1",
          name: "AI Persona Agent",
          status: "processing",
          statusText: "Evaluating promotion...",
        },
      ]);
    }, 4000);

    addTimeout(() => {
      setPersonaStatuses((prev) =>
        prev.map((p) => ({
          ...p,
          statusText: "Generating decision analysis...",
        }))
      );
    }, 6000);

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
      const { results: parsedResults, raw } = parseApiResponse(data);

      // Complete the flow animation
      setOrchestratorStatus("Simulation complete");
      setPersonaStatuses((prev) =>
        prev.map((p) => ({
          ...p,
          status: "completed" as const,
          statusText: "Decision made",
        }))
      );

      if (parsedResults.length > 0) {
        // Update persona flow cards with actual names
        setPersonaStatuses(
          parsedResults.map((r, i) => ({
            id: `result-${i}`,
            name: r.personaName,
            status: "completed" as const,
            statusText: "Decision made",
          }))
        );
        setResults(parsedResults);
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

      setRawJson(raw);
      setIsRunning(false);
      setPhase("completed");
    } catch (err) {
      clearTimeouts();
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
      setOrchestratorStatus("Error occurred");
      setPersonaStatuses((prev) =>
        prev.map((p) => ({
          ...p,
          status: "completed" as const,
          statusText: "Failed",
        }))
      );
      setIsRunning(false);
      setPhase("error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt]);

  const handleRunAnother = () => {
    clearTimeouts();
    setPhase("idle");
    setResults([]);
    setRawJson("");
    setPersonaStatuses([]);
    setOrchestratorStatus("");
    setErrorMessage("");
    setPrompt("");
    setSelectedPersonas(["orchestrator"]);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <Header />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-8">
        <SimulationStatusBar phase={phase} errorMessage={errorMessage} />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Left: Input Panel */}
          <div className="lg:col-span-2">
            <SimulationInput
              prompt={prompt}
              setPrompt={setPrompt}
              selectedPersonas={selectedPersonas}
              setSelectedPersonas={setSelectedPersonas}
              onRunSimulation={runSimulation}
              isRunning={isRunning}
            />
          </div>

          {/* Right: Execution Flow + Results */}
          <div className="flex flex-col gap-8 lg:col-span-3">
            <ExecutionFlow
              isRunning={isRunning}
              orchestratorStatus={orchestratorStatus}
              personaStatuses={personaStatuses}
              hasResults={results.length > 0}
            />

            <SimulationResults
              results={results}
              onRunAnother={handleRunAnother}
              rawJson={rawJson}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
