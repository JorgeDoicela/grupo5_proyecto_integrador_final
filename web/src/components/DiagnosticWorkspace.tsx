"use client";

import { useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BatteryLow,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Flame,
  GitFork,
  RotateCcw,
  Sparkles,
  Thermometer,
  Wind,
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
  onOpenGraph: () => void;
}

const QUICK_CASES: Array<{ label: string; codes: string[]; ref: string }> = [
  {
    label: "Fiebre, falta de aire y tos",
    codes: ["F", "S", "C"],
    ref: "Consulta de ejemplo 1",
  },
  {
    label: "Fiebre, tos y pérdida de olfato",
    codes: ["F", "C", "L"],
    ref: "Consulta de ejemplo 2",
  },
  {
    label: "Dolor de garganta y cansancio",
    codes: ["T", "A"],
    ref: "Consulta de ejemplo 3",
  },
];

function getSymptomIcon(code: string) {
  switch (code) {
    case "F":
      return Thermometer;
    case "S":
      return Wind;
    case "T":
      return Flame;
    case "A":
      return BatteryLow;
    case "L":
      return Sparkles;
    default:
      return Activity;
  }
}

export function DiagnosticWorkspace({
  symptoms,
  onEvaluationSaved,
  onOpenGraph,
}: DiagnosticWorkspaceProps) {
  const activeSymptoms = symptoms.filter((s) => s.isActive);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [patientRef, setPatientRef] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<InferenceResult | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const toggleSymptom = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    if (errorMessage) setErrorMessage(null);
  };

  const applyQuickCase = (codes: string[], ref: string) => {
    const ids = activeSymptoms
      .filter((s) => codes.includes(s.code))
      .map((s) => s.id);
    setSelectedIds(ids);
    setPatientRef(ref);
    setErrorMessage(null);
  };

  const handleReset = () => {
    setSelectedIds([]);
    setPatientRef("");
    setResult(null);
    setErrorMessage(null);
    setShowExplanation(false);
    setStatus("idle");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (selectedIds.length === 0) {
      setErrorMessage("Marca al menos un síntoma para obtener una orientación.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMessage(null);

    try {
      const response = await apiClient.runEvaluation({
        patientRef: patientRef.trim() || "Evaluación sin nombre",
        symptomIds: selectedIds,
      });
      setResult(response.result);
      setStatus("success");
      onEvaluationSaved(response.result);
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo completar la evaluación. Intenta nuevamente."
      );
      setStatus("error");
    }
  };

  const primaryDiagnosis = result?.matchedDiagnoses[0] ?? null;
  const secondaryDiagnoses = result?.matchedDiagnoses.slice(1) ?? [];

  return (
    <div className="space-y-8">
      {/* Cabecera limpia y directa */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-normal leading-tight text-[#1f1f1f] sm:text-[34px]">
            ¿Qué síntomas presenta el paciente?
          </h1>
          <p className="mt-1.5 text-sm text-[#444746]">
            Selecciona los síntomas observados para recibir una orientación respiratoria
            inmediata y recomendaciones de cuidado.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-[#747775]">Probar ejemplo:</span>
          {QUICK_CASES.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => applyQuickCase(item.codes, item.ref)}
              className="btn-glass-secondary px-3 py-1.5"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Distribución Split-Screen 50/50 (Ateneo+) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Panel Izquierdo: Selección táctil de síntomas */}
        <section className="clinical-surface p-6 sm:p-8 lg:col-span-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#1f1f1f]">
                1. Selecciona los síntomas
              </h2>
              <span className="text-xs font-medium text-[#0b57d0]">
                {selectedIds.length === 0
                  ? "Ninguno seleccionado"
                  : `${selectedIds.length} seleccionado${selectedIds.length > 1 ? "s" : ""}`}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {activeSymptoms.map((symptom) => {
                const checked = selectedIds.includes(symptom.id);
                const Icon = getSymptomIcon(symptom.code);

                return (
                  <button
                    key={symptom.id}
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    onClick={() => toggleSymptom(symptom.id)}
                    className={`flex cursor-pointer items-start justify-between gap-3 rounded-2xl border p-4 text-left transition-colors ${
                      checked
                        ? "border-blue-600 bg-blue-50/50"
                        : "border-slate-200/80 bg-[#f8fafc] hover:border-blue-300 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon
                        className={`mt-0.5 h-5 w-5 shrink-0 ${
                          checked ? "text-[#0b57d0]" : "text-slate-500"
                        }`}
                        aria-hidden="true"
                      />
                      <div>
                        <p className="text-sm font-semibold text-[#1f1f1f]">
                          {symptom.name}
                        </p>
                        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-[#444746]">
                          {symptom.description}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                        checked
                          ? "border-[#0b57d0] bg-[#0b57d0] text-white"
                          : "border-slate-300 bg-white"
                      }`}
                      aria-hidden="true"
                    >
                      {checked && <Check className="h-3 w-3" strokeWidth={3} />}
                    </span>
                  </button>
                );
              })}
            </div>

            <div>
              <label
                htmlFor="patient-ref"
                className="mb-1.5 block text-xs font-medium text-[#444746]"
              >
                Nombre del caso o paciente (opcional)
              </label>
              <input
                id="patient-ref"
                type="text"
                value={patientRef}
                onChange={(e) => setPatientRef(e.target.value)}
                placeholder="Ej. Consulta de Ana · Turno mañana"
                className="clinical-input"
              />
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={status === "loading"}
                className="btn-brand-cta flex flex-1 items-center justify-center gap-2"
              >
                <span>
                  {status === "loading"
                    ? "Analizando síntomas..."
                    : "Evaluar síntomas"}
                </span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>

              {(selectedIds.length > 0 || result) && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-[#444746] transition-colors hover:border-slate-400 hover:text-[#1f1f1f]"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  <span>Limpiar</span>
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Panel Derecho: Resultado claro y comprensible */}
        <section className="space-y-6 lg:col-span-6">
          {!result ? (
            <div className="clinical-glass flex min-h-[430px] flex-col items-center justify-center p-10 text-center">
              <Activity
                className="mb-4 h-10 w-10 text-blue-600/60"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              <h2 className="text-xl font-normal text-[#1f1f1f]">
                Tu resultado aparecerá aquí
              </h2>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-[#444746]">
                Marca los síntomas en el panel izquierdo y presiona{" "}
                <strong className="font-semibold text-[#1f1f1f]">
                  Evaluar síntomas
                </strong>{" "}
                para ver la orientación sugerida y las recomendaciones.
              </p>
            </div>
          ) : (
            <>
              <div className="clinical-surface p-6 sm:p-8">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                  <h2 className="text-base font-semibold text-[#1f1f1f]">
                    2. Resultado de la evaluación
                  </h2>
                  <button
                    type="button"
                    onClick={onOpenGraph}
                    className="btn-glass-secondary flex items-center gap-1.5 px-3 py-1.5"
                  >
                    <GitFork className="h-3.5 w-3.5 text-[#0b57d0]" />
                    <span>Ver en el mapa</span>
                  </button>
                </div>

                <p className="mb-5 text-xs text-[#444746]">
                  Síntomas evaluados:{" "}
                  <span className="font-semibold text-[#1f1f1f]">
                    {result.observedSymptoms.map((s) => s.name).join(" • ")}
                  </span>
                </p>

                {!primaryDiagnosis ? (
                  <div className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-5">
                    <h3 className="text-base font-semibold text-[#1f1f1f]">
                      No hay coincidencia completa con una afección específica
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-[#444746]">
                      Los síntomas ingresados por sí solos no permiten orientar una
                      condición concreta. Si el malestar persiste o empeora, consulta con
                      un profesional de salud.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* Tarjeta Principal Hero */}
                    <article className="rounded-2xl border border-blue-200 bg-gradient-to-br from-cyan-50/45 via-blue-50/35 to-indigo-50/45 p-6">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#0b57d0]">
                          Posible afección principal
                        </span>
                        <SeverityBadge severity={primaryDiagnosis.disease.severity} />
                      </div>

                      <h3 className="mt-2 text-2xl font-semibold text-[#1f1f1f]">
                        {primaryDiagnosis.disease.name}
                      </h3>

                      <p className="mt-2 text-sm leading-relaxed text-[#444746]">
                        {primaryDiagnosis.disease.description}
                      </p>

                      <div className="mt-4 rounded-xl border border-white/90 bg-white/90 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                          Qué se recomienda hacer
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-[#1f1f1f]">
                          {primaryDiagnosis.disease.recommendations}
                        </p>
                      </div>
                    </article>

                    {/* Otras posibilidades si hubo coincidencia múltiple */}
                    {secondaryDiagnoses.length > 0 && (
                      <div>
                        <h4 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-[#747775]">
                          Otras posibilidades compatibles
                        </h4>
                        <div className="space-y-2.5">
                          {secondaryDiagnoses.map((diag) => (
                            <div
                              key={diag.ruleId}
                              className="rounded-2xl border border-slate-200/80 bg-[#f8fafc] p-4"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="text-sm font-semibold text-[#1f1f1f]">
                                  {diag.disease.name}
                                </span>
                                <SeverityBadge severity={diag.disease.severity} />
                              </div>
                              <p className="mt-1 text-xs leading-relaxed text-[#444746]">
                                {diag.disease.recommendations}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Coincidencias parciales en lenguaje simple */}
                {result.partialMatches.length > 0 && (
                  <div className="mt-6 border-t border-slate-100 pt-5">
                    <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#747775]">
                      Síntomas a vigilar (coincidencia parcial)
                    </h4>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {result.partialMatches.slice(0, 4).map((partial) => (
                        <div
                          key={partial.ruleId}
                          className="rounded-2xl border border-amber-200/70 bg-amber-50/40 p-3.5 text-xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-[#1f1f1f]">
                              {partial.disease.name}
                            </span>
                            <span className="font-semibold text-amber-700">
                              {partial.coveragePercent}% coincidencia
                            </span>
                          </div>
                          <p className="mt-1 text-[#444746]">
                            Vigilar si aparece: {partial.missingConditions.join(", ")}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Acordeón opcional: explicación paso a paso (para docencia/auditoría) */}
                <div className="mt-6 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowExplanation((prev) => !prev)}
                    className="flex w-full cursor-pointer items-center justify-between text-left text-xs font-semibold text-[#0b57d0] hover:underline"
                  >
                    <span>
                      {showExplanation
                        ? "Ocultar cómo se obtuvo este resultado"
                        : "Ver cómo se obtuvo este resultado (detalle de reglas)"}
                    </span>
                    {showExplanation ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>

                  {showExplanation && (
                    <div className="mt-3 space-y-2">
                      {result.inferenceTrace.map((step) => (
                        <div
                          key={step.ruleId}
                          className={`rounded-xl border p-3 text-xs ${
                            step.fired
                              ? "border-emerald-200 bg-emerald-50/50"
                              : "border-slate-200/70 bg-[#f8fafc]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              {step.fired && (
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              )}
                              <span className="font-semibold text-[#1f1f1f]">
                                {step.diseaseName}
                              </span>
                              <span className="text-slate-300">•</span>
                              <span className="font-mono-code text-[#0b57d0]">
                                {step.propositionalFormula}
                              </span>
                            </div>
                            <span
                              className={`font-semibold ${
                                step.fired ? "text-emerald-700" : "text-[#747775]"
                              }`}
                            >
                              {step.fired ? "Cumple" : "No cumple"}
                            </span>
                          </div>
                          <p className="mt-1 text-[#444746]">
                            {step.satisfiedCount} de {step.totalConditions} condiciones
                            cumplidas.
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
