"use client";

import { useCallback, useState } from "react";
import {
  Activity,
  Binary,
  Clock,
  Database,
  GitFork,
  RefreshCw,
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

  const tabs: Array<{ id: ActiveTab; label: string; icon: React.ReactNode }> = [
    { id: "diagnose", label: "Evaluador Clínico", icon: <Activity className="h-4 w-4" /> },
    { id: "graph", label: "Grafo de Conocimiento", icon: <GitFork className="h-4 w-4" /> },
    { id: "logic", label: "Lógica y Tablas", icon: <Binary className="h-4 w-4" /> },
    { id: "knowledge", label: "Base de Conocimiento", icon: <Database className="h-4 w-4" /> },
    { id: "history", label: `Historial (${evaluations.length})`, icon: <Clock className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#0b1120]">
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-sky-400">
              Representación del Conocimiento y Razonamiento · UBE
            </p>
            <h1 className="text-xl font-bold tracking-tight text-slate-100">
              Sistema Experto de Detección de Enfermedades Respiratorias
            </h1>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="rounded-md border border-slate-800 bg-slate-900 px-2.5 py-1">
              {kb.symptoms.length} Síntomas · {kb.rules.length} Reglas ·{" "}
              {kb.diseases.length} Enfermedades
            </span>
            <button
              type="button"
              onClick={refreshAll}
              disabled={syncing}
              className="flex cursor-pointer items-center gap-1.5 rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1 text-slate-200 transition hover:border-sky-500"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
              Sincronizar
            </button>
          </div>
        </div>

        <nav
          aria-label="Secciones del sistema experto"
          className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-2 sm:px-6"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-sky-500/15 text-sky-300 ring-1 ring-inset ring-sky-500/40"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
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
    </div>
  );
}
