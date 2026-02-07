"use client";

import { THINKING_DAG } from "./dag-data";
import { useDAGAnimation } from "./use-dag-animation";
import DAGNode from "./dag-node";
import DAGEdge from "./dag-edge";

interface DAGVisualizationProps {
  isActive: boolean;
}

export default function DAGVisualization({ isActive }: DAGVisualizationProps) {
  const { nodeStates, activeEdges } = useDAGAnimation(THINKING_DAG, isActive);

  return (
    <div
      className="fixed right-4 top-1/2 -translate-y-1/2 w-64 h-[420px]
                    bg-card/95 backdrop-blur-sm border border-border rounded-xl
                    p-4 animate-dag-fade-in z-50 hidden lg:block"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
        <span className="inline-block h-2 w-2 rounded-full bg-primary animate-pulse" />
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          AI Agents Processing
        </span>
      </div>

      {/* DAG Container */}
      <div className="relative w-full h-[calc(100%-2.5rem)]">
        {/* SVG layer for edges */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {THINKING_DAG.edges.map((edge) => {
            const fromNode = THINKING_DAG.nodes.find(
              (n) => n.id === edge.from
            )!;
            const toNode = THINKING_DAG.nodes.find((n) => n.id === edge.to)!;
            const edgeKey = `${edge.from}-${edge.to}`;

            return (
              <DAGEdge
                key={edgeKey}
                fromNode={fromNode}
                toNode={toNode}
                isActive={activeEdges.has(edgeKey)}
              />
            );
          })}
        </svg>

        {/* Nodes layer */}
        {THINKING_DAG.nodes.map((node) => (
          <DAGNode
            key={node.id}
            node={node}
            status={nodeStates.get(node.id) || "idle"}
          />
        ))}
      </div>
    </div>
  );
}
