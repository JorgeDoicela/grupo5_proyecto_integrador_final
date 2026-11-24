"use client";

import { useCallback, useState } from "react";
import {
  Activity,
  Binary,
  Clock,
  Database,
  GitFork,
  RefreshCw,
  Stethoscope,
} from "lucide-react";
import type {
  EvaluationRecord,
  InferenceResult,
} from "@/domain/entities/types";
import { apiClient, type KnowledgeBaseSnapshot } from "@/lib/api-client";
import { DiagnosticWorkspace } from "@/components/DiagnosticWorkspace";
import { KnowledgeGraphView } from "@/components/KnowledgeGraphView";
import { FormalLogicView } from "@/components/FormalLogicView";
import { KnowledgeBaseManager } from "@/components/KnowledgeBaseManager";
import { EvaluationHistoryView } from "@/components/EvaluationHistoryView";

interface ExpertSystemShellProps {
  initialKnowledgeBase: KnowledgeBaseSnapshot;
  initialEvaluations: EvaluationRecord[];
}

type ActiveTab = "diagnose" | "graph" | "logic" | "knowledge" | "history";

export function ExpertSystemShell({
  initialKnowledgeBase,
  initialEvaluations,
}: ExpertSystemShellProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("diagnose");
  const [kb, setKb] = useState<KnowledgeBaseSnapshot>(initialKnowledgeBase);
  const [evaluations, setEvaluations] =
    useState<EvaluationRecord[]>(initialEvaluations);
  const [lastInference, setLastInference] = useState<InferenceResult | null>(
    null
  );
  const [syncing, setSyncing] = useState(false);

  const refreshAll = useCallback(async () => {
    setSyncing(true);
    try {
      const [nextKb, nextEval] = await Promise.all([
        apiClient.getKnowledgeBase(),
        apiClient.listEvaluations(),
      ]);
      setKb(nextKb);
      setEvaluations(nextEval.data);
    } finally {
      setSyncing(false);
    }
  }, []);

  const handleEvaluationSaved = async (result: InferenceResult) => {
    setLastInference(result);
    const nextEval = await apiClient.listEvaluations();
    setEvaluations(nextEval.data);
  };

  const tabs: Array<{
    id: ActiveTab;
    label: string;
    activeClass: string;
    icon: React.ReactNode;
  }> = [
    {
      id: "diagnose",
      label: "Evaluador Clínico",
      activeClass: "border-cyan-600 text-cyan-700 font-semibold",
      icon: <Activity className="h-4 w-4" />,
    },
    {
      id: "graph",
      label: "Grafo de Conocimiento",
      activeClass: "border-blue-600 text-blue-700 font-semibold",
      icon: <GitFork className="h-4 w-4" />,
    },
    {
      id: "logic",
      label: "Lógica y Tablas",
      activeClass: "border-indigo-600 text-indigo-700 font-semibold",
      icon: <Binary className="h-4 w-4" />,
    },
    {
      id: "knowledge",
      label: "Base de Conocimiento",
      activeClass: "border-blue-600 text-blue-700 font-semibold",
      icon: <Database className="h-4 w-4" />,
    },
    {
      id: "history",
      label: `Historial (${evaluations.length})`,
      activeClass: "border-cyan-600 text-cyan-700 font-semibold",
      icon: <Clock className="h-4 w-4" />,
    },
  ];

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip bg-[#f0f4f9]">
      {/* Auroras de Refracción Ambiental (Ateneo+ Liquid Glassmorphism) */}
      <div
        className="pointer-events-none fixed -top-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-cyan-400/20 via-blue-500/15 to-transparent blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed top-1/4 -right-32 h-[32rem] w-[32rem] rounded-full bg-gradient-to-tl from-violet-500/15 via-indigo-500/12 to-transparent blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed bottom-10 left-1/3 h-[26rem] w-[26rem] rounded-full bg-gradient-to-tr from-cyan-400/10 via-blue-500/10 to-transparent blur-3xl"
        aria-hidden="true"
      />

      {/* Navbar Sticky Liquid Glassmorphism */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-[1680px] items-center justify-between gap-4 px-4 sm:px-8 lg:px-12">
          <div className="flex items-center gap-3">
            <Stethoscope className="h-6 w-6 text-[#0b57d0]" strokeWidth={2.2} aria-hidden="true" />
            <div className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-black tracking-tight text-slate-900">
                  NEUMOLÓGICA
                  <span className="bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    +
                  </span>
                </span>
                <span className="hidden text-slate-300 sm:inline">•</span>
                <span className="hidden text-xs font-medium text-[#444746] sm:inline">
                  Sistema Experto Respiratorio
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-[#444746]">
            <div className="hidden items-center gap-2 md:flex">
              <span className="font-medium text-slate-700">{kb.symptoms.length} Síntomas</span>
              <span className="text-slate-300">•</span>
              <span className="font-medium text-slate-700">{kb.rules.length} Reglas</span>
              <span className="text-slate-300">•</span>
              <span className="font-medium text-slate-700">{kb.diseases.length} Patologías</span>
            </div>

            <button
              type="button"
              onClick={refreshAll}
              disabled={syncing}
              className="btn-glass-secondary flex items-center gap-1.5 px-3.5 py-1.5"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 text-[#0b57d0] ${syncing ? "animate-spin" : ""}`}
              />
              <span>Sincronizar</span>
            </button>
          </div>
        </div>

        {/* Pestañas Planas con Línea de Subrayado Activa (Sin cajas anidadas) */}
        <nav
          aria-label="Secciones del sistema experto"
          className="mx-auto flex w-full max-w-[1680px] items-center gap-6 overflow-x-auto px-4 sm:px-8 lg:px-12"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`-mb-px flex shrink-0 cursor-pointer items-center gap-2 border-b-2 pb-3 pt-1 text-sm transition-colors ${
                  isActive
                    ? tab.activeClass
                    : "border-transparent font-medium text-[#444746] hover:border-slate-300 hover:text-[#1f1f1f]"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </header>

      {/* Lienzo Central Panorámico */}
      <main className="relative z-10 mx-auto w-full max-w-[1680px] flex-1 px-4 py-8 sm:px-8 lg:px-12">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#0b57d0]">
              Representación del Conocimiento y Razonamiento • UBE • Grupo 5
            </p>
            <h1 className="mt-1 text-[28px] font-normal leading-tight text-[#1f1f1f] sm:text-[34px]">
              Sistema de Detección de Enfermedades Respiratorias
            </h1>
          </div>
          <p className="max-w-md text-xs leading-relaxed text-[#444746]">
            Motor de inferencia basado en encadenamiento hacia adelante (Forward Chaining),
            Modus Ponens, resolución de conflictos y base de conocimiento en PostgreSQL.
          </p>
        </div>

        {activeTab === "diagnose" && (
          <DiagnosticWorkspace
            symptoms={kb.symptoms}
            onEvaluationSaved={handleEvaluationSaved}
          />
        )}

        {activeTab === "graph" && (
          <KnowledgeGraphView
            graph={kb.graph}
            highlightedSymptomIds={lastInference?.observedSymptoms.map((s) => s.id)}
            highlightedRuleIds={lastInference?.matchedDiagnoses.map((d) => d.ruleId)}
          />
        )}

        {activeTab === "logic" && (
          <FormalLogicView formalizations={kb.formalizations} />
        )}

        {activeTab === "knowledge" && (
          <KnowledgeBaseManager
            symptoms={kb.symptoms}
            diseases={kb.diseases}
            rules={kb.rules}
            onRefresh={refreshAll}
          />
        )}

        {activeTab === "history" && (
          <EvaluationHistoryView
            evaluations={evaluations}
            onRefresh={refreshAll}
          />
        )}
      </main>

      {/* Footer Institucional Liquid Glassmorphism */}
      <footer className="relative z-10 border-t border-slate-200/60 bg-white/80 py-4 text-xs text-slate-500 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[1680px] flex-col items-center justify-between gap-2 px-4 text-center sm:flex-row sm:px-8 sm:text-left lg:px-12">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">NEUMOLÓGICA+</span>
            <span className="text-slate-300">•</span>
            <span className="text-[11px] text-slate-500">
              Proyecto Integrador Final • Universidad Bolivariana del Ecuador
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Uso académico y demostrativo de Inteligencia Artificial Simbólica • No sustituye criterio médico
          </p>
        </div>
      </footer>
    </div>
  );
}
