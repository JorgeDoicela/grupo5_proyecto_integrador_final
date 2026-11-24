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
      <div className="surface-card p-8 text-center text-sm text-slate-400">
        No hay reglas registradas en la base de conocimiento para formalizar.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <aside className="surface-card p-5 lg:col-span-4">
        <div className="mb-3 flex items-center gap-2">
          <Binary className="h-5 w-5 text-sky-400" aria-hidden="true" />
          <h2 className="text-base font-semibold text-slate-100">
            Reglas Formalizadas ({formalizations.length})
          </h2>
        </div>
        <p className="mb-4 text-xs text-slate-400">
          Seleccione una regla para inspeccionar su proposición, enunciado en Lógica de
          Primer Orden, circuito lógico y tabla de verdad.
        </p>

        <div className="space-y-2">
          {formalizations.map((item) => {
            const active = item.ruleId === selected.ruleId;
            return (
              <button
                key={item.ruleId}
                type="button"
                onClick={() => setSelectedRuleId(item.ruleId)}
                className={`w-full cursor-pointer rounded-lg border p-3 text-left transition ${
                  active
                    ? "border-sky-500 bg-sky-500/10"
                    : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono-code text-xs font-semibold text-sky-300">
                    {item.ruleCode}
                  </span>
                  <span className="text-xs text-slate-400">
                    {item.variables.length} variables ({1 << Math.min(item.variables.length, 6)}{" "}
                    filas)
                  </span>
                </div>
                <p className="mt-1 text-sm font-medium text-slate-100">
                  {item.diseaseName}
                </p>
                <p className="font-mono-code mt-1 truncate text-xs text-slate-400">
                  {item.propositionalFormula}
                </p>
              </button>
            );
          })}
        </div>
      </aside>

      <section className="space-y-6 lg:col-span-8">
        <div className="surface-card p-6">
          <h3 className="text-lg font-semibold text-slate-100">
            {selected.ruleCode}: {selected.ruleName}
          </h3>
          <p className="text-sm text-slate-400">
            Diagnóstico consecuente: <strong className="text-slate-200">{selected.diseaseName}</strong> (
            {selected.diseaseCode})
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3">
            <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Lógica Proposicional
              </span>
              <p className="font-mono-code mt-1 text-sm text-sky-300">
                {selected.propositionalFormula}
              </p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Lógica de Primer Orden (LPO / FOL)
              </span>
              <p className="font-mono-code mt-1 text-sm text-emerald-300">
                {selected.folFormula}
              </p>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-950/70 p-3.5">
              <CircuitBoard className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Circuito Lógico Equivalente
                </span>
                <p className="font-mono-code mt-1 text-sm text-amber-200">
                  {selected.circuitSummary}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="surface-card p-6">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-base font-semibold text-slate-100">
              Tabla de Verdad ({selected.truthTable.length} combinaciones)
            </h4>
            {selected.truthTableTruncated && (
              <span className="rounded bg-amber-500/15 px-2 py-0.5 text-xs text-amber-300">
                Muestra resumida (&gt;6 variables)
              </span>
            )}
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-300">
                  <th className="px-3 py-2.5 font-mono-code">#</th>
                  {selected.variables.map((v) => (
                    <th key={v.code} className="px-3 py-2.5 font-mono-code">
                      {v.isNegated ? `¬${v.code}` : v.code}
                      <span className="block font-sans text-[10px] font-normal text-slate-400">
                        {v.name}
                      </span>
                    </th>
                  ))}
                  <th className="px-3 py-2.5 font-mono-code text-sky-300">
                    Antecedente
                  </th>
                  <th className="px-3 py-2.5 font-mono-code text-emerald-300">
                    Infiere {selected.diseaseCode}
                  </th>
                </tr>
              </thead>
              <tbody>
                {selected.truthTable.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`border-b border-slate-800/70 ${
                      row.consequentInferred
                        ? "bg-emerald-500/10 font-semibold"
                        : "bg-slate-950/40"
                    }`}
                  >
                    <td className="px-3 py-2 font-mono-code text-slate-500">
                      {idx + 1}
                    </td>
                    {selected.variables.map((v) => {
                      const val = Boolean(row.assignments[v.code]);
                      return (
                        <td
                          key={v.code}
                          className={`px-3 py-2 font-mono-code ${
                            val ? "text-sky-300" : "text-slate-500"
                          }`}
                        >
                          {val ? "V (1)" : "F (0)"}
                        </td>
                      );
                    })}
                    <td
                      className={`px-3 py-2 font-mono-code ${
                        row.antecedentResult ? "text-emerald-300" : "text-slate-500"
                      }`}
                    >
                      {row.antecedentResult ? "V" : "F"}
                    </td>
                    <td
                      className={`px-3 py-2 font-mono-code ${
                        row.consequentInferred ? "text-emerald-300" : "text-slate-500"
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
