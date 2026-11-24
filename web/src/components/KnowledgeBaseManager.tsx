"use client";

import { useState } from "react";
import { Database, RotateCcw } from "lucide-react";
import type {
  DiseaseEntity,
  RuleEntity,
  SymptomEntity,
} from "@/domain/entities/types";
import { apiClient } from "@/lib/api-client";
import { RuleManagerTab } from "@/components/RuleManagerTab";
import { CatalogManagerTab } from "@/components/CatalogManagerTab";

interface KnowledgeBaseManagerProps {
  symptoms: SymptomEntity[];
  diseases: DiseaseEntity[];
  rules: RuleEntity[];
  onRefresh: () => Promise<void>;
}

export function KnowledgeBaseManager({
  symptoms,
  diseases,
  rules,
  onRefresh,
}: KnowledgeBaseManagerProps) {
  const [subTab, setSubTab] = useState<"rules" | "symptoms" | "diseases">("rules");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [resetting, setResetting] = useState(false);

  const handleFeedback = (type: "success" | "error", text: string) => {
    setFeedback({ type, text });
  };

  const handleResetCore = async () => {
    setResetting(true);
    try {
      const res = await apiClient.resetKnowledgeBase();
      await onRefresh();
      handleFeedback("success", res.message);
    } catch (error: unknown) {
      handleFeedback(
        "error",
        error instanceof Error ? error.message : "No se pudo restaurar la base inicial."
      );
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="surface-card p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Database className="h-5 w-5 text-sky-400" aria-hidden="true" />
          <div>
            <h2 className="text-lg font-semibold text-slate-100">
              Módulo de Adquisición de Conocimiento (CRUD en PostgreSQL)
            </h2>
            <p className="text-xs text-slate-400">
              Cualquier cambio en reglas, síntomas o enfermedades actualiza en tiempo real
              el motor de inferencia, las tablas de verdad y el grafo semántico.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleResetCore}
          disabled={resetting}
          className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-sky-500 hover:text-sky-300 disabled:opacity-60"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          {resetting ? "Restaurando..." : "Restaurar reglas base del enunciado"}
        </button>
      </div>

      {feedback && (
        <div
          role="status"
          className={`mb-4 rounded-lg border px-3.5 py-2.5 text-xs ${
            feedback.type === "success"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
              : "border-rose-500/40 bg-rose-500/10 text-rose-200"
          }`}
        >
          {feedback.text}
        </div>
      )}

      <div className="mb-5 flex gap-2 border-b border-slate-800 pb-3">
        {(
          [
            { id: "rules", label: `Reglas (${rules.length})` },
            { id: "symptoms", label: `Síntomas (${symptoms.length})` },
            { id: "diseases", label: `Enfermedades (${diseases.length})` },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSubTab(tab.id)}
            className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold transition ${
              subTab === tab.id
                ? "bg-sky-500 text-slate-950"
                : "bg-slate-900 text-slate-300 hover:text-slate-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {subTab === "rules" ? (
        <RuleManagerTab
          rules={rules}
          symptoms={symptoms}
          diseases={diseases}
          onRefresh={onRefresh}
          onFeedback={handleFeedback}
        />
      ) : (
        <CatalogManagerTab
          mode={subTab}
          symptoms={symptoms}
          diseases={diseases}
          onRefresh={onRefresh}
          onFeedback={handleFeedback}
        />
      )}
    </div>
  );
}
