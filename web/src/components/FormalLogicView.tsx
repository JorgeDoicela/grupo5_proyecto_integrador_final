"use client";

import { useState } from "react";
import { CircuitBoard } from "lucide-react";
import type { RuleFormalization } from "@/domain/entities/types";

interface FormalLogicViewProps {
  formalizations: RuleFormalization[];
}

export function FormalLogicView({ formalizations }: FormalLogicViewProps) {
  const [selectedRuleId, setSelectedRuleId] = useState<string>(
    formalizations[0]?.ruleId ?? ""
  );
  const [onlyActiveRows, setOnlyActiveRows] = useState(false);

  const selected =
    formalizations.find((f) => f.ruleId === selectedRuleId) ??
    formalizations[0] ??
    null;

  if (!selected) {
    return (
      <div className="clinical-surface p-10 text-center text-sm text-[#444746]">
        No hay reglas registradas para visualizar.
      </div>
    );
  }

  const visibleRows = onlyActiveRows
    ? selected.truthTable.filter((r) => r.consequentInferred)
    : selected.truthTable;

  const naturalCondition = selected.variables
    .map((v) => (v.isNegated ? `no presenta ${v.name.toLowerCase()}` : v.name.toLowerCase()))
    .join(" y ");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-normal leading-tight text-[#1f1f1f] sm:text-[34px]">
          Reglas lógicas y tablas de verdad
        </h1>
        <p className="mt-1.5 text-sm text-[#444746]">
          Consulta la base académica de cada regla: su formulación en lenguaje natural,
          expresión lógica, circuito de compuertas y tabla de combinaciones.
        </p>
      </div>

      {/* Selector horizontal tipo chips (Ateneo+) */}
      <div className="flex flex-wrap items-center gap-2">
        {formalizations.map((item) => {
          const active = item.ruleId === selected.ruleId;
          return (
            <button
              key={item.ruleId}
              type="button"
              onClick={() => setSelectedRuleId(item.ruleId)}
              className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                active
                  ? "bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 font-semibold text-white shadow-sm shadow-blue-500/25"
                  : "border border-slate-200/80 bg-white/90 text-slate-700 hover:border-slate-300 hover:bg-white"
              }`}
            >
              {item.ruleCode} • {item.diseaseName}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Bloque Izquierdo: Resumen claro y formalización */}
        <section className="clinical-surface space-y-5 p-6 sm:p-8 lg:col-span-5">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0b57d0]">
              Regla {selected.ruleCode}
            </span>
            <h2 className="mt-1 text-xl font-semibold text-[#1f1f1f]">
              {selected.diseaseName}
            </h2>
            <p className="mt-2 rounded-2xl border border-blue-200/70 bg-blue-50/40 p-4 text-sm leading-relaxed text-[#1f1f1f]">
              Si el paciente presenta <strong>{naturalCondition}</strong>, entonces se
              orienta a posible <strong>{selected.diseaseName}</strong>.
            </p>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-200/80 bg-[#f8fafc] p-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#747775]">
                Lógica Proposicional
              </span>
              <p className="font-mono-code mt-1 text-sm font-semibold text-[#0b57d0]">
                {selected.propositionalFormula}
              </p>
            </div>

            <div className="rounded-2xl border border-indigo-200/70 bg-indigo-50/40 p-4">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-700">
                Lógica de Primer Orden (LPO)
              </span>
              <p className="font-mono-code mt-1 break-words text-xs leading-relaxed text-indigo-950">
                {selected.folFormula}
              </p>
            </div>

            <div className="rounded-2xl border border-cyan-200/70 bg-cyan-50/40 p-4">
              <div className="flex items-center gap-2 text-cyan-800">
                <CircuitBoard className="h-4 w-4" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">
                  Circuito Lógico Equivalente
                </span>
              </div>
              <p className="font-mono-code mt-1.5 text-xs font-medium text-[#1f1f1f]">
                {selected.circuitSummary}
              </p>
            </div>
          </div>
        </section>

        {/* Bloque Derecho: Tabla de Verdad */}
        <section className="clinical-surface p-6 sm:p-8 lg:col-span-7">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-[#1f1f1f]">
                Tabla de verdad ({selected.truthTable.length} combinaciones)
              </h3>
              <p className="text-xs text-[#444746]">
                Muestra cuándo se cumplen todas las condiciones para activar el resultado.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setOnlyActiveRows((prev) => !prev)}
              className="btn-glass-secondary px-3.5 py-1.5"
            >
              {onlyActiveRows ? "Ver todas las filas" : "Solo filas que activan"}
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-[#f8fafc] text-[#444746]">
                  <th className="px-4 py-3 font-mono-code">#</th>
                  {selected.variables.map((v) => (
                    <th key={v.code} className="px-4 py-3 text-[#1f1f1f]">
                      <span className="font-mono-code font-bold">
                        {v.isNegated ? `¬${v.code}` : v.code}
                      </span>
                      <span className="block text-[10px] font-normal text-[#747775]">
                        {v.name}
                      </span>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-emerald-700">Resultado</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`border-b border-slate-100 ${
                      row.consequentInferred
                        ? "bg-emerald-50/75 font-semibold"
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
                          {val ? "Sí (V)" : "No (F)"}
                        </td>
                      );
                    })}
                    <td
                      className={`px-4 py-2.5 ${
                        row.consequentInferred ? "text-emerald-700" : "text-[#747775]"
                      }`}
                    >
                      {row.consequentInferred
                        ? `Activa ${selected.diseaseName}`
                        : "No aplica"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
