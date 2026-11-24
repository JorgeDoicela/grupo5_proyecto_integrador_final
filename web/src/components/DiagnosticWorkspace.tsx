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
    ref: "Ejemplo 1",
  },
  {
    label: "Fiebre, tos y pérdida de olfato",
    codes: ["F", "C", "L"],
    ref: "Ejemplo 2",
  },
  {
    label: "Dolor de garganta y fatiga",
    codes: ["T", "A"],
    ref: "Ejemplo 3",
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
      setErrorMessage("Selecciona al menos un síntoma.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMessage(null);

    try {
      const response = await apiClient.runEvaluation({
        patientRef: patientRef.trim() || "Consulta",
        symptomIds: selectedIds,
      });
      setResult(response.result);
      setStatus("success");
      onEvaluationSaved(response.result);
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo completar la evaluación."
      );
      setStatus("error");
    }
  };

  const primaryDiagnosis = result?.matchedDiagnoses[0] ?? null;
  const secondaryDiagnoses = result?.matchedDiagnoses.slice(1) ?? [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-normal leading-tight text-[#1f1f1f]">
          ¿Qué síntomas presenta el paciente?
        </h1>

        <div className="flex flex-wrap items-center gap-1.5">
          {QUICK_CASES.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => applyQuickCase(item.codes, item.ref)}
              className="btn-glass-secondary px-3 py-1"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Panel Izquierdo: Tarjetas limpias sin texto cortado */}
        <section className="clinical-surface p-5 sm:p-6 lg:col-span-6">
          <form onSubmit={handleSubmit} className="space-y-5">
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
                    title={symptom.description}
                    onClick={() => toggleSymptom(symptom.id)}
                    className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-4 py-4 text-left transition-colors ${
                      checked
                        ? "border-blue-600 bg-blue-50/55"
                        : "border-slate-200/80 bg-[#f8fafc] hover:border-blue-300 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`h-5 w-5 shrink-0 ${
                          checked ? "text-[#0b57d0]" : "text-slate-500"
                        }`}
                        aria-hidden="true"
                      />
                      <span className="text-sm font-semibold text-[#1f1f1f]">
                        {symptom.name}
                      </span>
                    </div>

                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
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
              <input
                id="patient-ref"
                type="text"
                aria-label="Nombre del caso o paciente (opcional)"
                value={patientRef}
                onChange={(e) => setPatientRef(e.target.value)}
                placeholder="Nombre del caso o paciente (opcional)"
                className="clinical-input"
              />
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={status === "loading"}
                className="btn-brand-cta flex flex-1 items-center justify-center gap-2"
              >
                <span>
                  {status === "loading" ? "Evaluando..." : "Evaluar síntomas"}
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

        {/* Panel Derecho: Resultado directo */}
        <section className="lg:col-span-6">
          {!result ? (
            <div className="clinical-glass flex h-full min-h-[340px] flex-col items-center justify-center p-8 text-center">
              <Activity
                className="mb-3 h-9 w-9 text-blue-600/55"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              <p className="text-base font-medium text-[#1f1f1f]">
                Resultado de la evaluación
              </p>
              <p className="mt-1 max-w-xs text-xs text-[#444746]">
                Marca los síntomas y presiona Evaluar síntomas.
              </p>
            </div>
          ) : (
            <div className="clinical-surface p-5 sm:p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <p className="text-xs text-[#444746]">
                  {result.observedSymptoms.map((s) => s.name).join(" • ")}
                </p>
                <button
                  type="button"
                  onClick={onOpenGraph}
                  className="btn-glass-secondary flex items-center gap-1.5 px-3 py-1"
                >
                  <GitFork className="h-3.5 w-3.5 text-[#0b57d0]" />
                  <span>Ver en mapa</span>
                </button>
              </div>

              {!primaryDiagnosis ? (
                <div className="rounded-2xl border border-slate-200 bg-[#f8fafc] p-5">
                  <h2 className="text-base font-semibold text-[#1f1f1f]">
                    Sin coincidencia completa
                  </h2>
                  <p className="mt-1 text-sm text-[#444746]">
                    Los síntomas marcados no completan una afección específica. Si el
                    malestar continúa, consulta con un médico.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <article className="rounded-2xl border border-blue-200 bg-gradient-to-br from-cyan-50/45 via-blue-50/35 to-indigo-50/45 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#0b57d0]">
                        Posible afección
                      </span>
                      <SeverityBadge severity={primaryDiagnosis.disease.severity} />
                    </div>

                    <h2 className="mt-1.5 text-2xl font-semibold text-[#1f1f1f]">
                      {primaryDiagnosis.disease.name}
                    </h2>

                    <p className="mt-1.5 text-sm leading-relaxed text-[#444746]">
                      {primaryDiagnosis.disease.description}
                    </p>

                    <div className="mt-4 rounded-xl border border-white/90 bg-white/90 p-3.5">
                      <p className="text-xs font-semibold text-emerald-700">
                        Recomendación
                      </p>
                      <p className="mt-1 text-sm text-[#1f1f1f]">
                        {primaryDiagnosis.disease.recommendations}
                      </p>
                    </div>
                  </article>

                  {secondaryDiagnoses.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-[#747775]">
                        También compatible
                      </p>
                      {secondaryDiagnoses.map((diag) => (
                        <div
                          key={diag.ruleId}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200/80 bg-[#f8fafc] px-4 py-3 text-sm"
                        >
                          <span className="font-semibold text-[#1f1f1f]">
                            {diag.disease.name}
                          </span>
                          <SeverityBadge severity={diag.disease.severity} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {result.partialMatches.length > 0 && (
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <p className="mb-2.5 text-xs font-semibold text-[#747775]">
                    Coincidencia parcial
                  </p>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {result.partialMatches.slice(0, 4).map((partial) => (
                      <div
                        key={partial.ruleId}
                        className="rounded-xl border border-amber-200/70 bg-amber-50/40 p-3 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-[#1f1f1f]">
                            {partial.disease.name}
                          </span>
                          <span className="font-semibold text-amber-700">
                            {partial.coveragePercent}%
                          </span>
                        </div>
                        <p className="mt-0.5 text-[#444746]">
                          Falta: {partial.missingConditions.join(", ")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-5 border-t border-slate-100 pt-3.5">
                <button
                  type="button"
                  onClick={() => setShowExplanation((prev) => !prev)}
                  className="flex w-full cursor-pointer items-center justify-between text-left text-xs font-semibold text-[#0b57d0] hover:underline"
                >
                  <span>
                    {showExplanation ? "Ocultar detalle lógico" : "Ver detalle lógico"}
                  </span>
                  {showExplanation ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>

                {showExplanation && (
                  <div className="mt-3 space-y-1.5">
                    {result.inferenceTrace.map((step) => (
                      <div
                        key={step.ruleId}
                        className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2 text-xs ${
                          step.fired
                            ? "border-emerald-200 bg-emerald-50/50"
                            : "border-slate-200/70 bg-[#f8fafc]"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          {step.fired && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          )}
                          <span className="font-semibold text-[#1f1f1f]">
                            {step.diseaseName}
                          </span>
                          <span className="font-mono-code text-[#0b57d0]">
                            {step.propositionalFormula}
                          </span>
                        </div>
                        <span
                          className={`font-semibold ${
                            step.fired ? "text-emerald-700" : "text-[#747775]"
                          }`}
                        >
                          {step.satisfiedCount}/{step.totalConditions}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
