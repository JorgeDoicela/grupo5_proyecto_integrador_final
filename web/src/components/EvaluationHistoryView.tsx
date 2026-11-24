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
    <div className="surface-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">
            Historial de Evaluaciones (PostgreSQL)
          </h2>
          <p className="text-sm text-slate-400">
            Últimos {evaluations.length} casos ejecutados con sus hechos observados y
            diagnósticos inferidos.
          </p>
        </div>
        <Clock className="h-5 w-5 text-sky-400" aria-hidden="true" />
      </div>

      {evaluations.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-8 text-center text-sm text-slate-400">
          Aún no se han registrado evaluaciones. Ejecute un caso en la pestaña de
          Evaluador Clínico.
        </div>
      ) : (
        <div className="space-y-3">
          {evaluations.map((item) => (
            <article
              key={item.id}
              className="rounded-xl border border-slate-800 bg-slate-900/70 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">
                    {item.patientRef}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {new Date(item.createdAt).toLocaleString("es-EC")}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  title="Eliminar registro"
                  className="cursor-pointer rounded border border-slate-700 p-1.5 text-slate-400 hover:border-rose-500 hover:text-rose-300"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {item.selectedSymptoms.map((s) => (
                  <span
                    key={s.id}
                    className="font-mono-code rounded border border-slate-700 bg-slate-950 px-2 py-0.5 text-xs text-sky-300"
                  >
                    {s.code}: {s.name}
                  </span>
                ))}
              </div>

              <div className="mt-3 border-t border-slate-800 pt-3">
                {item.matchedDiagnoses.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    Sin regla disparada completamente ({item.partialMatches.length}{" "}
                    coincidencias parciales).
                  </p>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    {item.matchedDiagnoses.map((d) => (
                      <div
                        key={d.ruleId}
                        className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950/70 px-2.5 py-1 text-xs"
                      >
                        <span className="font-semibold text-slate-100">
                          {d.disease.name}
                        </span>
                        <span className="font-mono-code text-sky-300">
                          ({d.ruleCode})
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
  );
}
