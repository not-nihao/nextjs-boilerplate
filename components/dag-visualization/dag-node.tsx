"use client";

import { type DAGNode as DAGNodeType, type NodeStatus } from "./dag-data";

interface DAGNodeProps {
  node: DAGNodeType;
  status: NodeStatus;
}

const statusClasses: Record<NodeStatus, string> = {
  idle: "border-border bg-muted/50 text-muted-foreground",
  active: "border-primary bg-primary/20 text-primary animate-node-activate",
  parallel: "border-primary bg-primary/20 text-primary animate-parallel-pulse",
  completed: "border-success/50 bg-success/10 text-success animate-completed-glow",
};

export default function DAGNode({ node, status }: DAGNodeProps) {
  return (
    <div
      className={`absolute -translate-x-1/2 -translate-y-1/2 px-2.5 py-1
                  rounded-md border text-[9px] font-medium whitespace-nowrap
                  transition-colors duration-200 ${statusClasses[status]}`}
      style={{
        left: `${node.x}%`,
        top: `${node.y}%`,
      }}
    >
      {node.label}
    </div>
  );
}
