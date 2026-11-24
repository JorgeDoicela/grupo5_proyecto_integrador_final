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
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <section className="surface-card p-6 lg:col-span-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">
              Entrada de Hechos (Memoria de Trabajo)
            </h2>
            <p className="text-sm text-slate-400">
              Marque los síntomas observados para evaluar las reglas en PostgreSQL.
            </p>
          </div>
          <Activity className="h-5 w-5 text-sky-400" aria-hidden="true" />
        </div>

        <div className="mb-4">
          <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-400">
            Casos de prueba rápidos
          </span>
          <div className="flex flex-wrap gap-2">
            {DEMO_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset.codes, preset.ref)}
                className="cursor-pointer rounded-md border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs text-slate-200 transition hover:border-sky-500/60 hover:text-sky-300"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="patient-ref"
              className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400"
            >
              Referencia del caso / paciente
            </label>
            <input
              id="patient-ref"
              type="text"
              value={patientRef}
              onChange={(e) => setPatientRef(e.target.value)}
              placeholder="Ej. Paciente #04 - Triaje"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-500"
            />
          </div>

          <fieldset>
            <legend className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400">
              Síntomas disponibles ({selectedIds.length} seleccionados)
            </legend>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
              {activeSymptoms.map((symptom) => {
                const checked = selectedIds.includes(symptom.id);
                return (
                  <label
                    key={symptom.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                      checked
                        ? "border-sky-500 bg-sky-500/10"
                        : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSymptom(symptom.id)}
                      className="mt-1 h-4 w-4 rounded border-slate-600 accent-sky-500"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono-code rounded bg-slate-800 px-1.5 py-0.5 text-xs font-semibold text-sky-300">
                          {symptom.code}
                        </span>
                        <span className="text-sm font-medium text-slate-100">
                          {symptom.name}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-400">
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
              className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200"
            >
              {errorMessage}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={status === "loading"}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Cpu className="h-4 w-4" aria-hidden="true" />
              {status === "loading" ? "Ejecutando inferencia..." : "Ejecutar Inferencia"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-700 px-3.5 py-2.5 text-sm text-slate-300 transition hover:border-slate-500 hover:text-slate-100"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Limpiar
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-6 lg:col-span-7">
        {!result ? (
          <div className="surface-card flex min-h-[420px] flex-col items-center justify-center p-8 text-center">
            <Cpu className="mb-3 h-10 w-10 text-slate-600" aria-hidden="true" />
            <h3 className="text-base font-medium text-slate-200">
              Motor de Inferencia en espera
            </h3>
            <p className="mt-1 max-w-md text-sm text-slate-400">
              Seleccione los síntomas del paciente o utilice un caso de prueba rápido para
              ejecutar el encadenamiento hacia adelante (Forward Chaining) y visualizar la
              traza deductiva.
            </p>
          </div>
        ) : (
          <>
            <div className="surface-card p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold text-slate-100">
                    Resultado de la Inferencia
                  </h2>
                  <p className="text-xs text-slate-400">
                    Hechos observados:{" "}
                    <span className="font-mono-code text-sky-300">
                      {result.observedSymptomCodes.join(", ")}
                    </span>
                  </p>
                </div>
                <span className="rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-300">
                  Guardado en PostgreSQL
                </span>
              </div>

              {result.conflictDetected && result.conflictResolutionNote && (
                <div className="mb-4 flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3.5 text-sm text-amber-200">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                  <div>
                    <p className="font-semibold">Resolución de Conflictos Activada</p>
                    <p className="mt-0.5 text-xs text-amber-200/90">
                      {result.conflictResolutionNote}
                    </p>
                  </div>
                </div>
              )}

              {result.matchedDiagnoses.length === 0 ? (
                <div className="rounded-lg border border-slate-700 bg-slate-900/70 p-4">
                  <div className="flex items-center gap-2 text-slate-200">
                    <ShieldAlert className="h-5 w-5 text-slate-400" />
                    <span className="font-medium">
                      Ninguna regla completa fue satisfecha
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-400">
                    Con los síntomas actuales no se puede derivar un diagnóstico concluyente
                    mediante Modus Ponens. Revise las coincidencias parciales inferiores.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {result.matchedDiagnoses.map((diag) => (
                    <article
                      key={diag.ruleId}
                      className={`rounded-xl border p-4 ${
                        diag.isPrimary
                          ? "border-sky-500/60 bg-sky-500/10"
                          : "border-slate-700 bg-slate-900/70"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle2
                            className={`h-5 w-5 ${
                              diag.isPrimary ? "text-sky-400" : "text-emerald-400"
                            }`}
                          />
                          <h3 className="text-base font-semibold text-slate-100">
                            {diag.disease.name}
                          </h3>
                          <span className="font-mono-code rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                            {diag.ruleCode}
                          </span>
                          {diag.isPrimary && (
                            <span className="rounded-full bg-sky-500 px-2 py-0.5 text-[11px] font-semibold text-slate-950">
                              Hipótesis Principal
                            </span>
                          )}
                        </div>
                        <SeverityBadge severity={diag.disease.severity} />
                      </div>

                      <p className="mt-2 text-sm text-slate-300">
                        {diag.disease.description}
                      </p>

                      <div className="mt-3 rounded-lg bg-slate-950/70 p-2.5 text-xs">
                        <p className="font-mono-code text-sky-300">
                          Proposicional: {diag.propositionalFormula}
                        </p>
                        <p className="font-mono-code mt-1 text-slate-400">
                          LPO: {diag.folFormula}
                        </p>
                      </div>

                      <p className="mt-2 text-xs text-slate-400">
                        <strong className="text-slate-300">Criterio:</strong>{" "}
                        {diag.conflictResolutionReason}
                      </p>
                      <p className="mt-1 text-xs text-slate-300">
                        <strong className="text-slate-200">Orientación clínica:</strong>{" "}
                        {diag.disease.recommendations}
                      </p>
                    </article>
                  ))}
                </div>
              )}

              {result.partialMatches.length > 0 && (
                <div className="mt-5 border-t border-slate-800 pt-4">
                  <h4 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Coincidencias Parciales (No inferidas — Alertas de seguimiento)
                  </h4>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {result.partialMatches.map((partial) => (
                      <div
                        key={partial.ruleId}
                        className="rounded-lg border border-slate-800 bg-slate-900/50 p-3 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-200">
                            {partial.disease.name} ({partial.ruleCode})
                          </span>
                          <span className="font-mono-code text-amber-300">
                            {partial.satisfiedCount}/{partial.totalConditions} (
                            {partial.coveragePercent}%)
                          </span>
                        </div>
                        <p className="mt-1 text-slate-400">
                          Falta: {partial.missingConditions.join(", ")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="surface-card p-6">
              <button
                type="button"
                onClick={() => setShowTrace((prev) => !prev)}
                className="flex w-full cursor-pointer items-center justify-between text-left"
              >
                <div>
                  <h3 className="text-base font-semibold text-slate-100">
                    Traza de Razonamiento (Módulo de Explicación)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Evaluación individual de las {result.inferenceTrace.length} reglas activas
                  </p>
                </div>
                {showTrace ? (
                  <ChevronUp className="h-5 w-5 text-slate-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                )}
              </button>

              {showTrace && (
                <div className="mt-4 space-y-2.5">
                  {result.inferenceTrace.map((step) => (
                    <div
                      key={step.ruleId}
                      className={`rounded-lg border p-3 text-xs ${
                        step.fired
                          ? "border-emerald-500/40 bg-emerald-500/5"
                          : "border-slate-800 bg-slate-900/50"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {step.fired ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <XCircle className="h-4 w-4 text-slate-500" />
                          )}
                          <span className="font-mono-code font-semibold text-slate-200">
                            {step.ruleCode}
                          </span>
                          <span className="text-slate-300">{step.diseaseName}</span>
                        </div>
                        <span
                          className={`rounded px-2 py-0.5 font-mono-code text-[11px] ${
                            step.fired
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {step.fired ? "DISPARADA" : "NO DISPARADA"}
                        </span>
                      </div>
                      <p className="font-mono-code mt-1.5 text-sky-300/90">
                        {step.propositionalFormula}
                      </p>
                      <p className="mt-1 text-slate-400">{step.reasoningSummary}</p>
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
