"use client";

import { useState, useEffect, useCallback } from "react";
import {
  type DAGStructure,
  type NodeStatus,
  getNodesByTier,
  getMaxTier,
} from "./dag-data";

export interface AnimationState {
  nodeStates: Map<string, NodeStatus>;
  activeEdges: Set<string>;
}

function createInitialState(dag: DAGStructure): AnimationState {
  const nodeStates = new Map<string, NodeStatus>();
  dag.nodes.forEach((node) => nodeStates.set(node.id, "idle"));
  return { nodeStates, activeEdges: new Set() };
}

export function useDAGAnimation(
  dag: DAGStructure,
  isActive: boolean
): AnimationState {
  const [state, setState] = useState<AnimationState>(() =>
    createInitialState(dag)
  );

  const resetState = useCallback(() => {
    setState(createInitialState(dag));
  }, [dag]);

  useEffect(() => {
    if (!isActive) {
      resetState();
      return;
    }

    const tiers = getNodesByTier(dag.nodes);
    const maxTier = getMaxTier(dag.nodes);

    let currentTier = 0;
    let phase: "activate" | "complete" = "activate";

    // Start with initial state
    setState(createInitialState(dag));

    const interval = setInterval(() => {
      setState((prev) => {
        const newStates = new Map(prev.nodeStates);
        const newEdges = new Set(prev.activeEdges);

        if (phase === "activate") {
          // Activate current tier nodes
          const tierNodes = tiers.get(currentTier) || [];
          const hasParallelGroup = tierNodes.some((n) => n.parallelGroup);

          tierNodes.forEach((node) => {
            newStates.set(node.id, hasParallelGroup ? "parallel" : "active");
          });
          phase = "complete";
        } else {
          // Complete current tier, activate edges to next tier
          const tierNodes = tiers.get(currentTier) || [];
          tierNodes.forEach((node) => {
            newStates.set(node.id, "completed");
          });

          // Activate edges from completed nodes to next tier
          dag.edges.forEach((edge) => {
            if (tierNodes.some((n) => n.id === edge.from)) {
              newEdges.add(`${edge.from}-${edge.to}`);
            }
          });

          currentTier++;
          if (currentTier > maxTier) {
            // Reset for loop - clear everything and start over
            currentTier = 0;
            phase = "activate";
            return createInitialState(dag);
          }
          phase = "activate";
        }

        return { nodeStates: newStates, activeEdges: newEdges };
      });
    }, 400);

    return () => clearInterval(interval);
  }, [dag, isActive, resetState]);

  return state;
}
