"use client";

import { Clock, Trash2 } from "lucide-react";
import type { EvaluationRecord } from "@/domain/entities/types";
import { apiClient } from "@/lib/api-client";
import { SeverityBadge } from "@/components/SeverityBadge";

interface EvaluationHistoryViewProps {
  evaluations: EvaluationRecord[];
  onRefresh: () => Promise<void>;
}

export function EvaluationHistoryView({
  evaluations,
  onRefresh,
}: EvaluationHistoryViewProps) {
  const handleDelete = async (id: string) => {
    await apiClient.deleteEvaluation(id);
    await onRefresh();
  };

  return (
    <div className="clinical-surface p-6 sm:p-8">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-normal text-[#1f1f1f]">
            Historial de Evaluaciones (PostgreSQL)
          </h2>
          <p className="mt-0.5 text-sm text-[#444746]">
            Últimos {evaluations.length} casos ejecutados con sus hechos observados y
            diagnósticos inferidos.
          </p>
        </div>
        <Clock className="h-5 w-5 text-[#0b57d0]" aria-hidden="true" />
      </div>

      {evaluations.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/80 bg-[#f8fafc] p-10 text-center text-sm text-[#444746]">
          Aún no se han registrado evaluaciones. Ejecute un caso en la pestaña Evaluador
          Clínico.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {evaluations.map((item) => (
            <article
              key={item.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-[#f8fafc] p-5 transition-colors hover:border-blue-300/80 hover:bg-white"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-[#1f1f1f]">
                      {item.patientRef}
                    </h3>
                    <p className="mt-0.5 text-xs text-[#747775]">
                      {new Date(item.createdAt).toLocaleString("es-EC")}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    title="Eliminar registro"
                    className="cursor-pointer rounded-full p-1.5 text-[#747775] transition-colors hover:bg-rose-50 hover:text-rose-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-3 text-xs text-[#444746]">
                  <span className="font-semibold text-[#1f1f1f]">Síntomas:</span>{" "}
                  <span className="font-mono-code text-[#0b57d0]">
                    {item.selectedSymptoms.map((s) => `${s.code} (${s.name})`).join(" • ")}
                  </span>
                </div>
              </div>

              <div className="mt-4 border-t border-slate-200/70 pt-3">
                {item.matchedDiagnoses.length === 0 ? (
                  <p className="text-xs text-[#747775]">
                    Sin regla disparada ({item.partialMatches.length} coincidencias parciales).
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {item.matchedDiagnoses.map((d) => (
                      <div
                        key={d.ruleId}
                        className="flex flex-wrap items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-[#1f1f1f]">
                            {d.disease.name}
                          </span>
                          <span className="font-mono-code text-[#0b57d0]">
                            ({d.ruleCode})
                          </span>
                        </div>
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
  );
}
