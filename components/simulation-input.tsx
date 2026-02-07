"use client";

const PERSONAS = [
  {
    id: "orchestrator",
    name: "Let Orchestrator Decide",
    description: "AI selects the most relevant personas automatically",
  },
  {
    id: "price-sensitive",
    name: "Price-Sensitive Shopper",
    description: "Focused on deals, discounts, and value for money",
  },
  {
    id: "impulse-buyer",
    name: "Impulse Buyer",
    description: "Makes quick purchasing decisions based on appeal",
  },
  {
    id: "brand-loyal",
    name: "Brand-Loyal Customer",
    description: "Prefers trusted brands and consistent experiences",
  },
  {
    id: "value-skeptic",
    name: "Value-Conscious Skeptic",
    description: "Evaluates thoroughly and is hard to convince",
  },
];

interface SimulationInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  selectedPersonas: string[];
  setSelectedPersonas: (personas: string[]) => void;
  onRunSimulation: () => void;
  isRunning: boolean;
}

export default function SimulationInput({
  prompt,
  setPrompt,
  selectedPersonas,
  setSelectedPersonas,
  onRunSimulation,
  isRunning,
}: SimulationInputProps) {
  const togglePersona = (id: string) => {
    if (id === "orchestrator") {
      setSelectedPersonas(
        selectedPersonas.includes("orchestrator") ? [] : ["orchestrator"]
      );
      return;
    }
    if (selectedPersonas.includes("orchestrator")) {
      setSelectedPersonas([id]);
      return;
    }
    if (selectedPersonas.includes(id)) {
      setSelectedPersonas(selectedPersonas.filter((p) => p !== id));
    } else {
      setSelectedPersonas([...selectedPersonas, id]);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-border bg-card p-6">
        <label
          htmlFor="promotion-input"
          className="mb-2 block text-sm font-medium text-foreground"
        >
          Promotion or Product Description
        </label>
        <textarea
          id="promotion-input"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder='e.g. 15% off a $29/month subscription for online shoppers aged 18-30'
          className="w-full resize-none rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring font-sans leading-relaxed"
          rows={4}
          disabled={isRunning}
        />
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-4 text-sm font-medium text-foreground">
          Consumer Personas
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PERSONAS.map((persona) => {
            const isSelected = selectedPersonas.includes(persona.id);
            return (
              <button
                key={persona.id}
                onClick={() => togglePersona(persona.id)}
                disabled={isRunning}
                className={`flex flex-col items-start rounded-lg border p-4 text-left transition-all ${
                  isSelected
                    ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                    : "border-border bg-background hover:border-muted-foreground/30"
                } ${isRunning ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <span
                  className={`text-sm font-medium ${isSelected ? "text-primary" : "text-foreground"}`}
                >
                  {persona.name}
                </span>
                <span className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {persona.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={onRunSimulation}
        disabled={isRunning || !prompt.trim() || selectedPersonas.length === 0}
        className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isRunning ? (
          <>
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
            Running Simulation...
          </>
        ) : (
          "Run Simulation"
        )}
      </button>
    </div>
  );
}
