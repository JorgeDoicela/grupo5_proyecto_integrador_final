"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
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
      await apiClient.resetKnowledgeBase();
      await onRefresh();
      handleFeedback(
        "success",
        "Se restauraron los síntomas, afecciones y reglas originales del proyecto."
      );
    } catch (error: unknown) {
      handleFeedback(
        "error",
        error instanceof Error ? error.message : "No se pudo restaurar la configuración."
      );
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-normal leading-tight text-[#1f1f1f] sm:text-[34px]">
            Gestionar reglas y catálogo clínico
          </h1>
          <p className="mt-1.5 text-sm text-[#444746]">
            Agrega, edita o desactiva reglas, síntomas y afecciones. Los cambios se
            reflejan inmediatamente en el evaluador y en el mapa de relaciones.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetCore}
          disabled={resetting}
          className="btn-glass-secondary flex items-center gap-1.5 px-4 py-2"
        >
          <RotateCcw className="h-3.5 w-3.5 text-[#0b57d0]" />
          <span>{resetting ? "Restaurando..." : "Restaurar valores originales"}</span>
        </button>
      </div>

      <div className="clinical-surface p-6 sm:p-8">
        {feedback && (
          <div
            role="status"
            className={`mb-5 rounded-2xl border px-4 py-3 text-xs font-medium ${
              feedback.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-800"
            }`}
          >
            {feedback.text}
          </div>
        )}

        <div className="mb-6 flex items-center gap-6 border-b border-slate-200">
          {(
            [
              { id: "rules", label: `Reglas (${rules.length})` },
              { id: "symptoms", label: `Síntomas (${symptoms.length})` },
              { id: "diseases", label: `Afecciones (${diseases.length})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSubTab(tab.id)}
              className={`-mb-px cursor-pointer border-b-2 pb-2.5 text-sm transition-colors ${
                subTab === tab.id
                  ? "border-blue-600 font-semibold text-blue-700"
                  : "border-transparent font-medium text-[#444746] hover:border-slate-300 hover:text-[#1f1f1f]"
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
    </div>
  );
}
