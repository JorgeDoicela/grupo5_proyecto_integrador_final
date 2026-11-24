"use client";

import { useMemo, useState } from "react";
import type { GraphNode, KnowledgeGraphData } from "@/domain/entities/types";

interface KnowledgeGraphViewProps {
  graph: KnowledgeGraphData;
  highlightedRuleIds?: string[];
  highlightedSymptomIds?: string[];
}

interface PositionedNode extends GraphNode {
  x: number;
  y: number;
}

export function KnowledgeGraphView({
  graph,
  highlightedRuleIds = [],
  highlightedSymptomIds = [],
}: KnowledgeGraphViewProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const layout = useMemo(() => {
    const symptoms = graph.nodes.filter((n) => n.type === "symptom");
    const rules = graph.nodes.filter((n) => n.type === "rule");
    const diseases = graph.nodes.filter((n) => n.type === "disease");

    const maxRows = Math.max(symptoms.length, rules.length, diseases.length, 1);
    const height = Math.max(460, maxRows * 84 + 80);
    const width = 980;

    const distributeY = (count: number, index: number): number => {
      if (count === 1) return height / 2;
      const padding = 68;
      const step = (height - padding * 2) / (count - 1);
      return padding + index * step;
    };

    const positioned = new Map<string, PositionedNode>();

    symptoms.forEach((n, idx) => {
      positioned.set(n.id, { ...n, x: 140, y: distributeY(symptoms.length, idx) });
    });
    rules.forEach((n, idx) => {
      positioned.set(n.id, { ...n, x: 490, y: distributeY(rules.length, idx) });
    });
    diseases.forEach((n, idx) => {
      positioned.set(n.id, { ...n, x: 840, y: distributeY(diseases.length, idx) });
    });

    return { width, height, positioned };
  }, [graph]);

  const activeNodeSet = useMemo(() => {
    const set = new Set<string>();
    for (const sid of highlightedSymptomIds) set.add(`symptom:${sid}`);
    for (const rid of highlightedRuleIds) set.add(`rule:${rid}`);

    if (selectedNodeId) {
      set.add(selectedNodeId);
      for (const edge of graph.edges) {
        if (edge.source === selectedNodeId) set.add(edge.target);
        if (edge.target === selectedNodeId) set.add(edge.source);
      }
    }
    return set;
  }, [graph.edges, highlightedRuleIds, highlightedSymptomIds, selectedNodeId]);

  const selectedNode = selectedNodeId
    ? layout.positioned.get(selectedNodeId) ?? null
    : null;

  return (
    <div className="clinical-surface p-6 sm:p-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-normal text-[#1f1f1f]">
            Grafo de Conocimiento (Red Semántica Dinámica)
          </h2>
          <p className="mt-0.5 text-sm text-[#444746]">
            Generado directamente desde PostgreSQL. Haga clic en cualquier nodo para
            resaltar sus relaciones deductivas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs text-[#444746]">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-500" /> Síntoma
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="h-2.5 w-2.5 rounded-sm bg-blue-600" /> Regla (AND)
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" /> Enfermedad
          </span>
          {selectedNodeId && (
            <button
              type="button"
              onClick={() => setSelectedNodeId(null)}
              className="btn-glass-secondary px-3 py-1"
            >
              Limpiar selección
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-[#f8fafc] p-3">
        <svg
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          className="h-auto w-full min-w-[740px]"
          role="img"
          aria-label="Grafo de conocimiento de síntomas, reglas y enfermedades respiratorias"
        >
          <defs>
            <marker
              id="arrow-default"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8" />
            </marker>
            <marker
              id="arrow-active"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#2563eb" />
            </marker>
          </defs>

          <text x="140" y="28" textAnchor="middle" fill="#64748b" fontSize="11" fontWeight="700">
            SÍNTOMAS (PREMISAS)
          </text>
          <text x="490" y="28" textAnchor="middle" fill="#64748b" fontSize="11" fontWeight="700">
            REGLAS DE PRODUCCIÓN
          </text>
          <text x="840" y="28" textAnchor="middle" fill="#64748b" fontSize="11" fontWeight="700">
            DIAGNÓSTICOS (CONSECUENTES)
          </text>

          {graph.edges.map((edge) => {
            const from = layout.positioned.get(edge.source);
            const to = layout.positioned.get(edge.target);
            if (!from || !to) return null;

            const startX = from.x + (from.type === "rule" ? 46 : 96);
            const endX = to.x - (to.type === "rule" ? 46 : 96);
            const midX = (startX + endX) / 2;

            const isHighlighted =
              selectedNodeId !== null
                ? edge.source === selectedNodeId || edge.target === selectedNodeId
                : activeNodeSet.has(edge.source) && activeNodeSet.has(edge.target);

            const strokeColor = isHighlighted
              ? "#2563eb"
              : edge.relation === "NEGATED_PREMISE"
                ? "#d97706"
                : "#cbd5e1";

            return (
              <path
                key={edge.id}
                d={`M ${startX} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${endX} ${to.y}`}
                fill="none"
                stroke={strokeColor}
                strokeWidth={isHighlighted ? 2.5 : 1.5}
                strokeDasharray={edge.relation === "NEGATED_PREMISE" ? "5 4" : undefined}
                opacity={selectedNodeId && !isHighlighted ? 0.25 : 0.95}
                markerEnd={isHighlighted ? "url(#arrow-active)" : "url(#arrow-default)"}
              />
            );
          })}

          {Array.from(layout.positioned.values()).map((node) => {
            const isSelected = selectedNodeId === node.id;
            const isHighlighted = activeNodeSet.has(node.id);
            const dimmed = selectedNodeId !== null && !isHighlighted;

            const fill =
              isSelected || isHighlighted
                ? node.type === "symptom"
                  ? "#ecfeff"
                  : node.type === "rule"
                    ? "#eff6ff"
                    : "#eef2ff"
                : "#ffffff";

            const stroke =
              node.type === "symptom"
                ? "#06b6d4"
                : node.type === "rule"
                  ? "#2563eb"
                  : "#6366f1";

            const rectWidth = node.type === "rule" ? 88 : 188;
            const rectHeight = 50;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() =>
                  setSelectedNodeId((prev) => (prev === node.id ? null : node.id))
                }
                className="cursor-pointer"
                opacity={dimmed ? 0.3 : 1}
              >
                <rect
                  x={-rectWidth / 2}
                  y={-rectHeight / 2}
                  width={rectWidth}
                  height={rectHeight}
                  rx={node.type === "rule" ? 12 : 25}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={isSelected || isHighlighted ? 2.4 : 1.3}
                />
                <text
                  y={-4}
                  textAnchor="middle"
                  fill="#0f172a"
                  fontSize="12"
                  fontWeight="600"
                >
                  {node.type === "rule" ? node.code : `${node.code} · ${node.label}`}
                </text>
                <text
                  y={13}
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="10"
                >
                  {node.type === "rule" ? "AND" : node.sublabel.slice(0, 24)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {selectedNode && (
        <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50/50 px-4 py-3 text-sm">
          <p className="font-semibold text-[#0b57d0]">
            Nodo seleccionado: {selectedNode.label} ({selectedNode.code})
          </p>
          <p className="text-xs text-[#444746]">{selectedNode.sublabel}</p>
        </div>
      )}
    </div>
  );
}
