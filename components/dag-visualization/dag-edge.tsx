"use client";

import { type DAGNode } from "./dag-data";

interface DAGEdgeProps {
  fromNode: DAGNode;
  toNode: DAGNode;
  isActive: boolean;
}

export default function DAGEdge({ fromNode, toNode, isActive }: DAGEdgeProps) {
  // Calculate positions (with small offset for node height)
  const x1 = fromNode.x;
  const y1 = fromNode.y + 4;
  const x2 = toNode.x;
  const y2 = toNode.y - 4;

  // Control points for smooth bezier curve
  const midY = (y1 + y2) / 2;

  const path = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;

  return (
    <>
      {/* Base edge line */}
      <path
        d={path}
        className={`transition-all duration-300 ${
          isActive ? "stroke-primary" : "stroke-border"
        }`}
        strokeWidth="1.5"
        fill="none"
        strokeDasharray={isActive ? "6 3" : "none"}
        style={
          isActive
            ? {
                animation: "edge-flow 0.6s linear infinite",
              }
            : undefined
        }
      />
      {/* Glow effect when active */}
      {isActive && (
        <path
          d={path}
          className="stroke-primary/30"
          strokeWidth="4"
          fill="none"
          strokeDasharray="6 3"
          style={{
            animation: "edge-flow 0.6s linear infinite",
            filter: "blur(2px)",
          }}
        />
      )}
    </>
  );
}
