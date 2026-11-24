"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Clock, Search, Trash2 } from "lucide-react";
import type { EvaluationRecord } from "@/domain/entities/types";
import { apiClient } from "@/lib/api-client";
import { SeverityBadge } from "@/components/SeverityBadge";

interface EvaluationHistoryViewProps {
  evaluations: EvaluationRecord[];
  onRefresh: () => Promise<void>;
  onGoToEvaluate: () => void;
}

export function EvaluationHistoryView({
  evaluations,
  onRefresh,
  onGoToEvaluate,
}: EvaluationHistoryViewProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return evaluations;
    return evaluations.filter((item) => {
      const refMatch = item.patientRef.toLowerCase().includes(q);
      const diagMatch = item.matchedDiagnoses.some((d) =>
        d.disease.name.toLowerCase().includes(q)
      );
      const symMatch = item.selectedSymptoms.some((s) =>
        s.name.toLowerCase().includes(q)
      );
      return refMatch || diagMatch || symMatch;
    });
  }, [evaluations, query]);

  const handleDelete = async (id: string) => {
    await apiClient.deleteEvaluation(id);
    await onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-normal leading-tight text-[#1f1f1f] sm:text-[34px]">
            Historial de evaluaciones
          </h1>
          <p className="mt-1.5 text-sm text-[#444746]">
            Revisa los casos evaluados recientemente, sus síntomas y la orientación emitida.
          </p>
        </div>

        {/* Cápsula de búsqueda en cristal líquido (Patrón Ateneo+) */}
        {evaluations.length > 0 && (
          <div className="flex w-full max-w-sm items-center gap-2.5 rounded-full border border-slate-200/80 bg-white/80 px-4 py-2 backdrop-blur-md transition-all focus-within:border-blue-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20">
            <Search className="h-4 w-4 text-[#0b57d0]" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por caso, síntoma o afección..."
              className="w-full bg-transparent text-xs text-[#1f1f1f] outline-none placeholder:text-[#747775]"
            />
          </div>
        )}
      </div>

      <div className="clinical-surface p-6 sm:p-8">
        {evaluations.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-[#f8fafc] p-10 text-center">
            <Clock className="mb-3 h-8 w-8 text-blue-600/60" aria-hidden="true" />
            <p className="text-base font-medium text-[#1f1f1f]">
              Todavía no hay evaluaciones guardadas
            </p>
            <p className="mt-1 max-w-sm text-xs text-[#444746]">
              Cuando evalúes un conjunto de síntomas, el resultado quedará registrado aquí
              para consulta posterior.
            </p>
            <button
              type="button"
              onClick={onGoToEvaluate}
              className="btn-brand-cta mt-5 inline-flex items-center gap-2"
            >
              <span>Evaluar síntomas</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#444746]">
            No se encontraron evaluaciones para &ldquo;{query}&rdquo;.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((item) => (
              <article
                key={item.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-[#f8fafc] p-5 transition-colors hover:border-blue-300/80 hover:bg-white"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="text-sm font-semibold text-[#1f1f1f]">
                        {item.patientRef}
                      </h2>
                      <p className="mt-0.5 text-xs text-[#747775]">
                        {new Date(item.createdAt).toLocaleString("es-EC")}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      title="Eliminar del historial"
                      className="cursor-pointer rounded-full p-1.5 text-[#747775] transition-colors hover:bg-rose-50 hover:text-rose-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-[#444746]">
                    <span className="font-semibold text-[#1f1f1f]">Síntomas:</span>{" "}
                    {item.selectedSymptoms.map((s) => s.name).join(" • ")}
                  </p>
                </div>

                <div className="mt-4 border-t border-slate-200/70 pt-3">
                  {item.matchedDiagnoses.length === 0 ? (
                    <p className="text-xs text-[#747775]">
                      Sin coincidencia completa ({item.partialMatches.length} parciales).
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {item.matchedDiagnoses.map((d) => (
                        <div
                          key={d.ruleId}
                          className="flex flex-wrap items-center justify-between gap-2 text-xs"
                        >
                          <span className="font-semibold text-[#1f1f1f]">
                            {d.disease.name}
                          </span>
                          <SeverityBadge severity={d.disease.severity} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
