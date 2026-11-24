"use client";

import { useMemo, useState } from "react";
import type {
  DiseaseEntity,
  GraphNode,
  KnowledgeGraphData,
} from "@/domain/entities/types";

interface KnowledgeGraphViewProps {
  graph: KnowledgeGraphData;
  diseases: DiseaseEntity[];
  highlightedRuleIds?: string[];
  highlightedSymptomIds?: string[];
}

interface PositionedNode extends GraphNode {
  x: number;
  y: number;
}

export function KnowledgeGraphView({
  graph,
  diseases,
  highlightedRuleIds = [],
  highlightedSymptomIds = [],
}: KnowledgeGraphViewProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [focusedDiseaseId, setFocusedDiseaseId] = useState<string | null>(null);

  const layout = useMemo(() => {
    const symptoms = graph.nodes.filter((n) => n.type === "symptom");
    const rules = graph.nodes.filter((n) => n.type === "rule");
    const diseaseNodes = graph.nodes.filter((n) => n.type === "disease");

    const maxRows = Math.max(symptoms.length, rules.length, diseaseNodes.length, 1);
    const height = Math.max(380, maxRows * 64 + 68);
    const width = 960;

    const distributeY = (count: number, index: number): number => {
      if (count === 1) return height / 2;
      const topPad = 56;
      const bottomPad = 36;
      const step = (height - topPad - bottomPad) / (count - 1);
      return topPad + index * step;
    };

    const positioned = new Map<string, PositionedNode>();

    symptoms.forEach((n, idx) => {
      positioned.set(n.id, { ...n, x: 145, y: distributeY(symptoms.length, idx) });
    });
    rules.forEach((n, idx) => {
      positioned.set(n.id, { ...n, x: 480, y: distributeY(rules.length, idx) });
    });
    diseaseNodes.forEach((n, idx) => {
      positioned.set(n.id, { ...n, x: 815, y: distributeY(diseaseNodes.length, idx) });
    });

    return { width, height, positioned };
  }, [graph]);

  const activeNodeSet = useMemo(() => {
    const set = new Set<string>();

    if (focusedDiseaseId) {
      const targetDiseaseNode = `disease:${focusedDiseaseId}`;
      set.add(targetDiseaseNode);
      const relatedRules = new Set<string>();
      for (const edge of graph.edges) {
        if (edge.target === targetDiseaseNode) {
          set.add(edge.source);
          relatedRules.add(edge.source);
        }
      }
      for (const edge of graph.edges) {
        if (relatedRules.has(edge.target)) {
          set.add(edge.source);
        }
      }
      return set;
    }

    if (selectedNodeId) {
      set.add(selectedNodeId);
      for (const edge of graph.edges) {
        if (edge.source === selectedNodeId) set.add(edge.target);
        if (edge.target === selectedNodeId) set.add(edge.source);
      }
      return set;
    }

    for (const sid of highlightedSymptomIds) set.add(`symptom:${sid}`);
    for (const rid of highlightedRuleIds) set.add(`rule:${rid}`);
    return set;
  }, [
    focusedDiseaseId,
    graph.edges,
    highlightedRuleIds,
    highlightedSymptomIds,
    selectedNodeId,
  ]);

  const hasFilter = focusedDiseaseId !== null || selectedNodeId !== null;
  const selectedNode = selectedNodeId
    ? layout.positioned.get(selectedNodeId) ?? null
    : null;

  return (
    <div className="flex flex-1 flex-col gap-4">
      {/* Cabecera compacta: título + filtros en una sola franja */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-normal leading-tight text-[#1f1f1f]">
            Mapa de relaciones clínicas
          </h1>
          <p className="text-xs text-[#444746]">
            Selecciona una afección o haz clic en un nodo para resaltar su ruta completa.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setFocusedDiseaseId(null);
              setSelectedNodeId(null);
            }}
            className={`cursor-pointer rounded-full px-3.5 py-1 text-xs font-medium transition-all ${
              focusedDiseaseId === null
                ? "bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 font-semibold text-white shadow-sm shadow-blue-500/25"
                : "border border-slate-200/80 bg-white/90 text-slate-700 hover:border-slate-300 hover:bg-white"
            }`}
          >
            Todas
          </button>
          {diseases.map((d) => {
            const active = focusedDiseaseId === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => {
                  setSelectedNodeId(null);
                  setFocusedDiseaseId(active ? null : d.id);
                }}
                className={`cursor-pointer rounded-full px-3.5 py-1 text-xs font-medium transition-all ${
                  active
                    ? "bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 font-semibold text-white shadow-sm shadow-blue-500/25"
                    : "border border-slate-200/80 bg-white/90 text-slate-700 hover:border-slate-300 hover:bg-white"
                }`}
              >
                {d.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tarjeta de grafo ajustada al viewport para verse completa sin scroll */}
      <div className="clinical-surface flex flex-1 flex-col p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#444746]">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-500" /> Síntoma
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="h-2.5 w-2.5 rounded-sm bg-blue-600" /> Regla
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" /> Posible afección
            </span>
          </div>

          {selectedNode && (
            <span className="text-xs font-medium text-[#0b57d0]">
              Seleccionado: {selectedNode.label}
            </span>
          )}
        </div>

        <div className="flex flex-1 items-center justify-center overflow-x-auto rounded-2xl border border-slate-200/80 bg-[#f8fafc] p-2">
          <svg
            viewBox={`0 0 ${layout.width} ${layout.height}`}
            preserveAspectRatio="xMidYMid meet"
            className="h-[calc(100vh-215px)] min-h-[360px] max-h-[560px] w-full min-w-[680px]"
            role="img"
            aria-label="Mapa visual de relaciones entre síntomas, reglas y afecciones respiratorias"
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

            <text x="145" y="22" textAnchor="middle" fill="#64748b" fontSize="11" fontWeight="700">
              SÍNTOMAS
            </text>
            <text x="480" y="22" textAnchor="middle" fill="#64748b" fontSize="11" fontWeight="700">
              REGLA
            </text>
            <text x="815" y="22" textAnchor="middle" fill="#64748b" fontSize="11" fontWeight="700">
              POSIBLE AFECCIÓN
            </text>

            {graph.edges.map((edge) => {
              const from = layout.positioned.get(edge.source);
              const to = layout.positioned.get(edge.target);
              if (!from || !to) return null;

              const startX = from.x + (from.type === "rule" ? 42 : 96);
              const endX = to.x - (to.type === "rule" ? 42 : 96);
              const midX = (startX + endX) / 2;

              const isHighlighted =
                activeNodeSet.has(edge.source) && activeNodeSet.has(edge.target);

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
                  strokeWidth={isHighlighted ? 2.6 : 1.5}
                  strokeDasharray={edge.relation === "NEGATED_PREMISE" ? "5 4" : undefined}
                  opacity={hasFilter && !isHighlighted ? 0.16 : 0.95}
                  markerEnd={isHighlighted ? "url(#arrow-active)" : "url(#arrow-default)"}
                />
              );
            })}

            {Array.from(layout.positioned.values()).map((node) => {
              const isHighlighted = activeNodeSet.has(node.id);
              const dimmed = hasFilter && !isHighlighted;

              const fill = isHighlighted
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

              const rectWidth = node.type === "rule" ? 80 : 190;
              const rectHeight = 40;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={() => {
                    setFocusedDiseaseId(null);
                    setSelectedNodeId((prev) => (prev === node.id ? null : node.id));
                  }}
                  className="cursor-pointer"
                  opacity={dimmed ? 0.25 : 1}
                >
                  <rect
                    x={-rectWidth / 2}
                    y={-rectHeight / 2}
                    width={rectWidth}
                    height={rectHeight}
                    rx={node.type === "rule" ? 10 : 20}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={isHighlighted ? 2.4 : 1.3}
                  />
                  <text
                    y={4}
                    textAnchor="middle"
                    fill="#0f172a"
                    fontSize="12"
                    fontWeight="600"
                  >
                    {node.type === "rule" ? node.code : node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}
