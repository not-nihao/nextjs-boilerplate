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

const PERSONA_NAMES: Record<string, string> = {
  "price-sensitive": "Price-Sensitive Shopper",
  "impulse-buyer": "Impulse Buyer",
  "brand-loyal": "Brand-Loyal Customer",
  "value-skeptic": "Value-Conscious Skeptic",
};

const MOCK_RESULTS: Record<string, PersonaResult> = {
  "price-sensitive": {
    personaName: "Price-Sensitive Shopper",
    purchaseProbability: 78,
    decisionSummary:
      "The 15% discount is a strong motivator. This shopper perceives high value relative to the discounted price point and is likely to convert, especially with a clear savings comparison.",
  },
  "impulse-buyer": {
    personaName: "Impulse Buyer",
    purchaseProbability: 65,
    decisionSummary:
      "The promotion creates enough urgency to trigger an impulse purchase, but the subscription model introduces hesitation around long-term commitment. A free trial could push conversion higher.",
  },
  "brand-loyal": {
    personaName: "Brand-Loyal Customer",
    purchaseProbability: 42,
    decisionSummary:
      "Without existing brand familiarity, this customer is unlikely to switch from their current provider. The discount alone is insufficient to overcome brand inertia and switching costs.",
  },
  "value-skeptic": {
    personaName: "Value-Conscious Skeptic",
    purchaseProbability: 28,
    decisionSummary:
      "This persona requires extensive proof of value before committing. The promotion lacks social proof, detailed feature comparisons, and a satisfaction guarantee that would reduce perceived risk.",
  },
};

function getStatusMessages(personaId: string): string[] {
  const messages: Record<string, string[]> = {
    "price-sensitive": [
      "Evaluating price sensitivity...",
      "Analyzing discount impact...",
      "Calculating purchase likelihood...",
    ],
    "impulse-buyer": [
      "Assessing emotional triggers...",
      "Evaluating urgency factors...",
      "Modeling impulse response...",
    ],
    "brand-loyal": [
      "Checking brand familiarity...",
      "Assessing loyalty factors...",
      "Evaluating switching cost...",
    ],
    "value-skeptic": [
      "Analyzing value proposition...",
      "Evaluating proof points...",
      "Assessing risk tolerance...",
    ],
  };
  return messages[personaId] || ["Processing...", "Analyzing...", "Deciding..."];
}

type SimulationPhase = "idle" | "running" | "completed";

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

  const runSimulation = useCallback(() => {
    clearTimeouts();
    setIsRunning(true);
    setPhase("running");
    setResults([]);
    setRawJson("");

    // Determine which personas to simulate
    let personaIds: string[];
    if (selectedPersonas.includes("orchestrator")) {
      personaIds = [
        "price-sensitive",
        "impulse-buyer",
        "brand-loyal",
        "value-skeptic",
      ];
    } else {
      personaIds = [...selectedPersonas];
    }

    // Phase 1: Orchestrator analyzing
    setOrchestratorStatus("Analyzing promotion");
    setPersonaStatuses([]);

    // Phase 2: Orchestrator selecting personas
    addTimeout(() => {
      setOrchestratorStatus("Selecting relevant personas");
    }, 1500);

    // Phase 3: Initialize persona cards
    addTimeout(() => {
      setOrchestratorStatus("Dispatching to persona agents");
      setPersonaStatuses(
        personaIds.map((id) => ({
          id,
          name: PERSONA_NAMES[id] || id,
          status: "waiting",
          statusText: "Queued",
        }))
      );
    }, 3000);

    // Phase 4: Process each persona sequentially with status updates
    personaIds.forEach((personaId, index) => {
      const baseDelay = 4000 + index * 2500;
      const messages = getStatusMessages(personaId);

      // Start processing
      addTimeout(() => {
        setPersonaStatuses((prev) =>
          prev.map((p) =>
            p.id === personaId
              ? { ...p, status: "processing", statusText: messages[0] }
              : p
          )
        );
      }, baseDelay);

      // Mid-processing status update
      addTimeout(() => {
        setPersonaStatuses((prev) =>
          prev.map((p) =>
            p.id === personaId ? { ...p, statusText: messages[1] } : p
          )
        );
      }, baseDelay + 800);

      // Final processing status
      addTimeout(() => {
        setPersonaStatuses((prev) =>
          prev.map((p) =>
            p.id === personaId ? { ...p, statusText: messages[2] } : p
          )
        );
      }, baseDelay + 1600);

      // Complete
      addTimeout(() => {
        setPersonaStatuses((prev) =>
          prev.map((p) =>
            p.id === personaId
              ? { ...p, status: "completed", statusText: "Decision made" }
              : p
          )
        );
      }, baseDelay + 2200);
    });

    // Phase 5: Show results
    const totalTime = 4000 + personaIds.length * 2500 + 500;
    addTimeout(() => {
      setOrchestratorStatus("Simulation complete");
      const simulationResults = personaIds.map(
        (id) => MOCK_RESULTS[id] || MOCK_RESULTS["price-sensitive"]
      );
      setResults(simulationResults);
      setRawJson(JSON.stringify(simulationResults, null, 2));
      setIsRunning(false);
      setPhase("completed");
    }, totalTime);
  }, [selectedPersonas]);

  const handleRunAnother = () => {
    clearTimeouts();
    setPhase("idle");
    setResults([]);
    setRawJson("");
    setPersonaStatuses([]);
    setOrchestratorStatus("");
    setPrompt("");
    setSelectedPersonas(["orchestrator"]);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <Header />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-8">
        <SimulationStatusBar phase={phase} />

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
