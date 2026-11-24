"use client";

import { useState } from "react";
import { Binary, CircuitBoard } from "lucide-react";
import type { RuleFormalization } from "@/domain/entities/types";

interface FormalLogicViewProps {
  formalizations: RuleFormalization[];
}

export function FormalLogicView({ formalizations }: FormalLogicViewProps) {
  const [selectedRuleId, setSelectedRuleId] = useState<string>(
    formalizations[0]?.ruleId ?? ""
  );

  const selected =
    formalizations.find((f) => f.ruleId === selectedRuleId) ??
    formalizations[0] ??
    null;

  if (!selected) {
    return (
      <div className="clinical-surface p-10 text-center text-sm text-[#444746]">
        No hay reglas registradas en la base de conocimiento para formalizar.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      <aside className="clinical-surface p-6 lg:col-span-4">
        <div className="mb-3 flex items-center gap-2">
          <Binary className="h-5 w-5 text-[#0b57d0]" aria-hidden="true" />
          <h2 className="text-base font-semibold text-[#1f1f1f]">
            Reglas Formalizadas ({formalizations.length})
          </h2>
        </div>
        <p className="mb-4 text-xs leading-relaxed text-[#444746]">
          Seleccione una regla para inspeccionar su proposición, enunciado en Lógica de
          Primer Orden (LPO), circuito equivalente y tabla de verdad.
        </p>

        <div className="space-y-2.5">
          {formalizations.map((item) => {
            const active = item.ruleId === selected.ruleId;
            return (
              <button
                key={item.ruleId}
                type="button"
                onClick={() => setSelectedRuleId(item.ruleId)}
                className={`w-full cursor-pointer rounded-2xl border p-4 text-left transition-colors ${
                  active
                    ? "border-blue-500 bg-blue-50/50"
                    : "border-slate-200/80 bg-[#f8fafc] hover:border-blue-300/80 hover:bg-white"
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono-code font-bold text-[#0b57d0]">
                    {item.ruleCode}
                  </span>
                  <span className="text-[#747775]">
                    {item.variables.length} vars • {1 << Math.min(item.variables.length, 6)} filas
                  </span>
                </div>
                <p className="mt-1 text-sm font-semibold text-[#1f1f1f]">
                  {item.diseaseName}
                </p>
                <p className="font-mono-code mt-1 truncate text-xs text-[#444746]">
                  {item.propositionalFormula}
                </p>
              </button>
            );
          })}
        </div>
      </aside>

      <section className="space-y-6 lg:col-span-8">
        <div className="clinical-surface p-6 sm:p-8">
          <h3 className="text-lg font-normal text-[#1f1f1f]">
            {selected.ruleCode} • {selected.ruleName}
          </h3>
          <p className="mt-0.5 text-sm text-[#444746]">
            Diagnóstico consecuente:{" "}
            <strong className="text-[#1f1f1f]">{selected.diseaseName}</strong> (
            {selected.diseaseCode})
          </p>

          <div className="mt-5 grid grid-cols-1 gap-3.5">
            <div className="rounded-2xl border border-slate-200/80 bg-[#f8fafc] p-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#747775]">
                Lógica Proposicional
              </span>
              <p className="font-mono-code mt-1 text-sm font-medium text-[#0b57d0]">
                {selected.propositionalFormula}
              </p>
            </div>

            <div className="rounded-2xl border border-indigo-200/70 bg-indigo-50/40 p-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-700">
                Lógica de Primer Orden (LPO / FOL)
              </span>
              <p className="font-mono-code mt-1 text-sm font-medium text-indigo-950">
                {selected.folFormula}
              </p>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-cyan-200/70 bg-cyan-50/40 p-4">
              <CircuitBoard className="mt-0.5 h-4 w-4 shrink-0 text-cyan-700" />
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-cyan-800">
                  Circuito Lógico Equivalente
                </span>
                <p className="font-mono-code mt-1 text-sm font-medium text-[#1f1f1f]">
                  {selected.circuitSummary}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="clinical-surface p-6 sm:p-8">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-base font-semibold text-[#1f1f1f]">
              Tabla de Verdad ({selected.truthTable.length} combinaciones)
            </h4>
            {selected.truthTableTruncated && (
              <span className="text-xs font-medium text-amber-700">
                Muestra resumida (&gt;6 variables)
              </span>
            )}
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-[#f8fafc] text-[#444746]">
                  <th className="px-4 py-3 font-mono-code">#</th>
                  {selected.variables.map((v) => (
                    <th key={v.code} className="px-4 py-3 font-mono-code text-[#1f1f1f]">
                      {v.isNegated ? `¬${v.code}` : v.code}
                      <span className="block font-sans text-[10px] font-normal text-[#747775]">
                        {v.name}
                      </span>
                    </th>
                  ))}
                  <th className="px-4 py-3 font-mono-code text-[#0b57d0]">
                    Antecedente
                  </th>
                  <th className="px-4 py-3 font-mono-code text-emerald-700">
                    Infiere {selected.diseaseCode}
                  </th>
                </tr>
              </thead>
              <tbody>
                {selected.truthTable.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`border-b border-slate-100 ${
                      row.consequentInferred
                        ? "bg-emerald-50/70 font-semibold"
                        : "bg-white"
                    }`}
                  >
                    <td className="px-4 py-2.5 font-mono-code text-[#747775]">
                      {idx + 1}
                    </td>
                    {selected.variables.map((v) => {
                      const val = Boolean(row.assignments[v.code]);
                      return (
                        <td
                          key={v.code}
                          className={`px-4 py-2.5 font-mono-code ${
                            val ? "text-[#0b57d0]" : "text-[#747775]"
                          }`}
                        >
                          {val ? "V (1)" : "F (0)"}
                        </td>
                      );
                    })}
                    <td
                      className={`px-4 py-2.5 font-mono-code ${
                        row.antecedentResult ? "text-emerald-700" : "text-[#747775]"
                      }`}
                    >
                      {row.antecedentResult ? "V" : "F"}
                    </td>
                    <td
                      className={`px-4 py-2.5 font-mono-code ${
                        row.consequentInferred ? "text-emerald-700" : "text-[#747775]"
                      }`}
                    >
                      {row.consequentInferred ? "SÍ (Dispara)" : "NO"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
