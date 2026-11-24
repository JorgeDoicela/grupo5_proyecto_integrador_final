"use client";

import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Cpu,
  RotateCcw,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import type {
  InferenceResult,
  SymptomEntity,
} from "@/domain/entities/types";
import { apiClient } from "@/lib/api-client";
import { SeverityBadge } from "@/components/SeverityBadge";

interface DiagnosticWorkspaceProps {
  symptoms: SymptomEntity[];
  onEvaluationSaved: (result: InferenceResult) => void;
}

const DEMO_PRESETS: Array<{ label: string; codes: string[]; ref: string }> = [
  {
    label: "Conflicto Neumonía vs Asma (F, S, C)",
    codes: ["F", "S", "C"],
    ref: "Caso 1 - Conflicto F+S+C",
  },
  {
    label: "Caso COVID-19 (F, C, L)",
    codes: ["F", "C", "L"],
    ref: "Caso 2 - Sospecha COVID-19",
  },
  {
    label: "Caso Gripe + Resfriado (F, C, A, T)",
    codes: ["F", "C", "A", "T"],
    ref: "Caso 3 - Múltiple F+C+A+T",
  },
];

export function DiagnosticWorkspace({
  symptoms,
  onEvaluationSaved,
}: DiagnosticWorkspaceProps) {
  const activeSymptoms = symptoms.filter((s) => s.isActive);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [patientRef, setPatientRef] = useState("Caso Clínico #1");
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<InferenceResult | null>(null);
  const [showTrace, setShowTrace] = useState(true);

  const toggleSymptom = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const applyPreset = (codes: string[], ref: string) => {
    const ids = activeSymptoms
      .filter((s) => codes.includes(s.code))
      .map((s) => s.id);
    setSelectedIds(ids);
    setPatientRef(ref);
  };

  const handleReset = () => {
    setSelectedIds([]);
    setResult(null);
    setErrorMessage(null);
    setStatus("idle");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (selectedIds.length === 0) {
      setErrorMessage("Seleccione al menos un síntoma para ejecutar el motor de inferencia.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMessage(null);

    try {
      const response = await apiClient.runEvaluation({
        patientRef: patientRef.trim() || "Caso Clínico",
        symptomIds: selectedIds,
      });
      setResult(response.result);
      setStatus("success");
      onEvaluationSaved(response.result);
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error ? error.message : "Error al ejecutar la inferencia."
      );
      setStatus("error");
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      {/* Columna Izquierda (50%): Entrada de Hechos */}
      <section className="clinical-surface p-6 sm:p-8 lg:col-span-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-normal text-[#1f1f1f]">
              Entrada de Hechos Clínicos
            </h2>
            <p className="mt-0.5 text-sm text-[#444746]">
              Seleccione los síntomas presentes en la memoria de trabajo para inferir diagnósticos.
            </p>
          </div>
          <Activity className="h-5 w-5 text-[#0b57d0]" aria-hidden="true" />
        </div>

        <div className="mb-5">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#747775]">
            Escenarios rápidos de validación
          </span>
          <div className="flex flex-wrap gap-2">
            {DEMO_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset.codes, preset.ref)}
                className="btn-glass-secondary px-3 py-1.5"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="patient-ref"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#444746]"
            >
              Referencia del caso o paciente
            </label>
            <input
              id="patient-ref"
              type="text"
              value={patientRef}
              onChange={(e) => setPatientRef(e.target.value)}
              placeholder="Ej. Paciente #04 - Triaje"
              className="clinical-input"
            />
          </div>

          <fieldset>
            <legend className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-[#444746]">
              Síntomas observables ({selectedIds.length} seleccionados)
            </legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {activeSymptoms.map((symptom) => {
                const checked = selectedIds.includes(symptom.id);
                return (
                  <label
                    key={symptom.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors ${
                      checked
                        ? "border-blue-500 bg-blue-50/50"
                        : "border-slate-200/80 bg-[#f8fafc] hover:border-blue-300/80 hover:bg-white"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSymptom(symptom.id)}
                      className="mt-1 h-4 w-4 rounded border-slate-400 accent-[#0b57d0]"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono-code text-xs font-bold text-[#0b57d0]">
                          {symptom.code}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-sm font-semibold text-[#1f1f1f]">
                          {symptom.name}
                        </span>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-[#444746]">
                        {symptom.englishName} — {symptom.description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {errorMessage && (
            <div
              role="alert"
              className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            >
              {errorMessage}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={status === "loading"}
              className="btn-brand-cta flex flex-1 items-center justify-center gap-2"
            >
              <Cpu className="h-4 w-4" aria-hidden="true" />
              <span>
                {status === "loading" ? "Ejecutando inferencia..." : "Ejecutar Inferencia"}
              </span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-[#444746] transition-colors hover:border-slate-400 hover:text-[#1f1f1f]"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>Limpiar</span>
            </button>
          </div>
        </form>
      </section>

      {/* Columna Derecha (50%): Dictamen y Traza de Explicación */}
      <section className="space-y-6 lg:col-span-6">
        {!result ? (
          <div className="clinical-glass flex min-h-[460px] flex-col items-center justify-center p-10 text-center">
            <Cpu className="mb-3 h-10 w-10 text-blue-600/70" aria-hidden="true" />
            <h3 className="text-lg font-normal text-[#1f1f1f]">
              Motor de Inferencia listo para evaluación
            </h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-[#444746]">
              Marque los síntomas observados en el panel izquierdo o seleccione un escenario
              de validación para ejecutar Forward Chaining, aplicar Modus Ponens y revisar
              la resolución de conflictos.
            </p>
          </div>
        ) : (
          <>
            <div className="clinical-surface p-6 sm:p-8">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-normal text-[#1f1f1f]">
                    Dictamen de Inferencia Deductiva
                  </h2>
                  <p className="mt-0.5 text-xs text-[#444746]">
                    Hechos evaluados:{" "}
                    <span className="font-mono-code font-semibold text-[#0b57d0]">
                      {result.observedSymptomCodes.join(", ")}
                    </span>
                    <span className="mx-2 text-slate-300">•</span>
                    <span>Persistido en PostgreSQL</span>
                  </p>
                </div>
              </div>

              {result.conflictDetected && result.conflictResolutionNote && (
                <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <div>
                    <p className="font-semibold">Resolución de Conflictos Activada</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-amber-800">
                      {result.conflictResolutionNote}
                    </p>
                  </div>
                </div>
              )}

              {result.matchedDiagnoses.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-5">
                  <div className="flex items-center gap-2 text-[#1f1f1f]">
                    <ShieldAlert className="h-5 w-5 text-slate-500" />
                    <span className="font-semibold">
                      Ninguna regla completa fue satisfecha
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm text-[#444746]">
                    Con los hechos actuales no es posible aplicar Modus Ponens sin riesgo de
                    falso positivo. Revise las coincidencias parciales sugeridas abajo.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {result.matchedDiagnoses.map((diag) => (
                    <article
                      key={diag.ruleId}
                      className={`rounded-2xl border p-5 ${
                        diag.isPrimary
                          ? "border-blue-300 bg-gradient-to-br from-cyan-50/40 via-blue-50/35 to-indigo-50/40"
                          : "border-slate-200 bg-[#f8fafc]"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <CheckCircle2
                            className={`h-5 w-5 ${
                              diag.isPrimary ? "text-[#0b57d0]" : "text-emerald-600"
                            }`}
                          />
                          <h3 className="text-base font-semibold text-[#1f1f1f]">
                            {diag.disease.name}
                          </h3>
                          <span className="text-slate-300">•</span>
                          <span className="font-mono-code text-xs font-semibold text-[#0b57d0]">
                            {diag.ruleCode}
                          </span>
                          {diag.isPrimary && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                                Hipótesis Principal
                              </span>
                            </>
                          )}
                        </div>
                        <SeverityBadge severity={diag.disease.severity} />
                      </div>

                      <p className="mt-2.5 text-sm leading-relaxed text-[#444746]">
                        {diag.disease.description}
                      </p>

                      <div className="mt-3 rounded-xl border border-slate-200/80 bg-white px-3.5 py-2.5 text-xs">
                        <p className="font-mono-code font-medium text-[#0b57d0]">
                          Proposicional: {diag.propositionalFormula}
                        </p>
                        <p className="font-mono-code mt-1 text-[#444746]">
                          LPO: {diag.folFormula}
                        </p>
                      </div>

                      <p className="mt-3 text-xs leading-relaxed text-[#444746]">
                        <strong className="text-[#1f1f1f]">Criterio de resolución:</strong>{" "}
                        {diag.conflictResolutionReason}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-[#444746]">
                        <strong className="text-[#1f1f1f]">Orientación clínica:</strong>{" "}
                        {diag.disease.recommendations}
                      </p>
                    </article>
                  ))}
                </div>
              )}

              {result.partialMatches.length > 0 && (
                <div className="mt-6 border-t border-slate-100 pt-5">
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#747775]">
                    Coincidencias Parciales (Seguimiento)
                  </h4>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {result.partialMatches.map((partial) => (
                      <div
                        key={partial.ruleId}
                        className="rounded-2xl border border-amber-200/70 bg-amber-50/50 p-3.5 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-[#1f1f1f]">
                            {partial.disease.name} ({partial.ruleCode})
                          </span>
                          <span className="font-mono-code font-semibold text-amber-700">
                            {partial.satisfiedCount}/{partial.totalConditions} (
                            {partial.coveragePercent}%)
                          </span>
                        </div>
                        <p className="mt-1 text-[#444746]">
                          Falta: {partial.missingConditions.join(", ")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="clinical-surface p-6 sm:p-8">
              <button
                type="button"
                onClick={() => setShowTrace((prev) => !prev)}
                className="flex w-full cursor-pointer items-center justify-between text-left"
              >
                <div>
                  <h3 className="text-base font-semibold text-[#1f1f1f]">
                    Traza de Razonamiento (Módulo de Explicación)
                  </h3>
                  <p className="text-xs text-[#444746]">
                    Evaluación individual de las {result.inferenceTrace.length} reglas activas
                  </p>
                </div>
                {showTrace ? (
                  <ChevronUp className="h-5 w-5 text-[#444746]" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-[#444746]" />
                )}
              </button>

              {showTrace && (
                <div className="mt-4 space-y-2.5">
                  {result.inferenceTrace.map((step) => (
                    <div
                      key={step.ruleId}
                      className={`rounded-2xl border p-3.5 text-xs ${
                        step.fired
                          ? "border-emerald-200 bg-emerald-50/60"
                          : "border-slate-200/80 bg-[#f8fafc]"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {step.fired ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-slate-400" />
                          )}
                          <span className="font-mono-code font-semibold text-[#1f1f1f]">
                            {step.ruleCode}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="font-medium text-[#1f1f1f]">{step.diseaseName}</span>
                        </div>
                        <span
                          className={`font-mono-code text-[11px] font-semibold ${
                            step.fired ? "text-emerald-700" : "text-[#747775]"
                          }`}
                        >
                          {step.fired ? "DISPARADA" : "NO DISPARADA"}
                        </span>
                      </div>
                      <p className="font-mono-code mt-1.5 text-[#0b57d0]">
                        {step.propositionalFormula}
                      </p>
                      <p className="mt-1 text-[#444746]">{step.reasoningSummary}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
