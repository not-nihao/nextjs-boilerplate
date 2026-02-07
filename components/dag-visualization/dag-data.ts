export type NodeStatus = "idle" | "active" | "completed" | "parallel";

export interface DAGNode {
  id: string;
  label: string;
  x: number; // percentage position
  y: number; // percentage position
  tier: number; // depth level (0 = root)
  parallelGroup?: string; // nodes with same group pulse simultaneously
}

export interface DAGEdge {
  from: string;
  to: string;
}

export interface DAGStructure {
  nodes: DAGNode[];
  edges: DAGEdge[];
}

export const THINKING_DAG: DAGStructure = {
  nodes: [
    { id: "orchestrator", label: "Orchestrator", x: 50, y: 8, tier: 0 },
    { id: "parser", label: "Prompt Parser", x: 25, y: 24, tier: 1 },
    { id: "context", label: "Context Loader", x: 75, y: 24, tier: 1 },
    { id: "strategy", label: "Strategy Engine", x: 25, y: 44, tier: 2 },
    { id: "persona", label: "Persona Selector", x: 75, y: 44, tier: 2 },
    {
      id: "eval",
      label: "Evaluation Agent",
      x: 35,
      y: 64,
      tier: 3,
      parallelGroup: "analysis",
    },
    {
      id: "scorer",
      label: "Confidence Scorer",
      x: 65,
      y: 64,
      tier: 3,
      parallelGroup: "analysis",
    },
    { id: "builder", label: "Response Builder", x: 50, y: 84, tier: 4 },
  ],
  edges: [
    { from: "orchestrator", to: "parser" },
    { from: "orchestrator", to: "context" },
    { from: "parser", to: "strategy" },
    { from: "context", to: "persona" },
    { from: "strategy", to: "eval" },
    { from: "persona", to: "scorer" },
    { from: "eval", to: "builder" },
    { from: "scorer", to: "builder" },
  ],
};

export function getNodesByTier(nodes: DAGNode[]): Map<number, DAGNode[]> {
  const tiers = new Map<number, DAGNode[]>();
  for (const node of nodes) {
    const tierNodes = tiers.get(node.tier) || [];
    tierNodes.push(node);
    tiers.set(node.tier, tierNodes);
  }
  return tiers;
}

export function getMaxTier(nodes: DAGNode[]): number {
  return Math.max(...nodes.map((n) => n.tier));
}
