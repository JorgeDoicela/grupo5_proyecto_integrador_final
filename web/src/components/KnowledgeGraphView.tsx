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
    const width = 960;

    const distributeY = (count: number, index: number): number => {
      if (count === 1) return height / 2;
      const padding = 68;
      const step = (height - padding * 2) / (count - 1);
      return padding + index * step;
    };

    const positioned = new Map<string, PositionedNode>();

    symptoms.forEach((n, idx) => {
      positioned.set(n.id, { ...n, x: 130, y: distributeY(symptoms.length, idx) });
    });
    rules.forEach((n, idx) => {
      positioned.set(n.id, { ...n, x: 480, y: distributeY(rules.length, idx) });
    });
    diseases.forEach((n, idx) => {
      positioned.set(n.id, { ...n, x: 830, y: distributeY(diseases.length, idx) });
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
    <div className="surface-card p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">
            Grafo de Conocimiento (Red Semántica Dinámica)
          </h2>
          <p className="text-sm text-slate-400">
            Generado directamente desde PostgreSQL. Haga clic en cualquier nodo para
            inspeccionar sus relaciones causales.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-sky-400" /> Síntoma
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-amber-400" /> Regla (AND)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-rose-400" /> Enfermedad
          </span>
          {selectedNodeId && (
            <button
              type="button"
              onClick={() => setSelectedNodeId(null)}
              className="cursor-pointer rounded border border-slate-700 px-2 py-0.5 text-slate-300 hover:border-slate-500"
            >
              Limpiar selección
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/70 p-2">
        <svg
          viewBox={`0 0 ${layout.width} ${layout.height}`}
          className="h-auto min-w-[720px] w-full"
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
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#475569" />
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
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
            </marker>
          </defs>

          <text x="130" y="28" textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="600">
            SÍNTOMAS (PREMISAS)
          </text>
          <text x="480" y="28" textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="600">
            REGLAS DE PRODUCCIÓN
          </text>
          <text x="830" y="28" textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="600">
            DIAGNÓSTICOS (CONSECUENTES)
          </text>

          {graph.edges.map((edge) => {
            const from = layout.positioned.get(edge.source);
            const to = layout.positioned.get(edge.target);
            if (!from || !to) return null;

            const startX = from.x + (from.type === "rule" ? 44 : 92);
            const endX = to.x - (to.type === "rule" ? 44 : 92);
            const midX = (startX + endX) / 2;

            const isHighlighted =
              selectedNodeId !== null
                ? edge.source === selectedNodeId || edge.target === selectedNodeId
                : activeNodeSet.has(edge.source) && activeNodeSet.has(edge.target);

            const strokeColor = isHighlighted
              ? "#38bdf8"
              : edge.relation === "NEGATED_PREMISE"
                ? "#f59e0b"
                : "#334155";

            return (
              <path
                key={edge.id}
                d={`M ${startX} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${endX} ${to.y}`}
                fill="none"
                stroke={strokeColor}
                strokeWidth={isHighlighted ? 2.5 : 1.4}
                strokeDasharray={edge.relation === "NEGATED_PREMISE" ? "5 4" : undefined}
                opacity={selectedNodeId && !isHighlighted ? 0.2 : 0.9}
                markerEnd={isHighlighted ? "url(#arrow-active)" : "url(#arrow-default)"}
              />
            );
          })}

          {Array.from(layout.positioned.values()).map((node) => {
            const isSelected = selectedNodeId === node.id;
            const isHighlighted = activeNodeSet.has(node.id);
            const dimmed = selectedNodeId !== null && !isHighlighted;

            const fill =
              node.type === "symptom"
                ? "#0f172a"
                : node.type === "rule"
                  ? "#1e1b10"
                  : "#1f1218";

            const stroke = isSelected
              ? "#38bdf8"
              : node.type === "symptom"
                ? "#38bdf8"
                : node.type === "rule"
                  ? "#f59e0b"
                  : "#fb7185";

            const rectWidth = node.type === "rule" ? 84 : 180;
            const rectHeight = 48;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() =>
                  setSelectedNodeId((prev) => (prev === node.id ? null : node.id))
                }
                className="cursor-pointer"
                opacity={dimmed ? 0.25 : 1}
              >
                <rect
                  x={-rectWidth / 2}
                  y={-rectHeight / 2}
                  width={rectWidth}
                  height={rectHeight}
                  rx={node.type === "rule" ? 8 : 24}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={isSelected || isHighlighted ? 2.5 : 1.4}
                />
                <text
                  y={-4}
                  textAnchor="middle"
                  fill="#f8fafc"
                  fontSize="12"
                  fontWeight="600"
                >
                  {node.type === "rule" ? node.code : `${node.code} · ${node.label}`}
                </text>
                <text
                  y={12}
                  textAnchor="middle"
                  fill="#94a3b8"
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
        <div className="mt-4 rounded-lg border border-sky-500/30 bg-sky-500/5 p-3 text-sm">
          <p className="font-semibold text-sky-300">
            Nodo seleccionado: {selectedNode.label} ({selectedNode.code})
          </p>
          <p className="text-xs text-slate-400">{selectedNode.sublabel}</p>
        </div>
      )}
    </div>
  );
}
