"use client";

import { useState } from "react";
import { Edit2, Plus, Power, Trash2 } from "lucide-react";
import type {
  DiseaseEntity,
  RuleEntity,
  SymptomEntity,
} from "@/domain/entities/types";
import { apiClient } from "@/lib/api-client";
import { buildPropositionalFormula } from "@/domain/logic/formal-logic";

interface RuleManagerTabProps {
  rules: RuleEntity[];
  symptoms: SymptomEntity[];
  diseases: DiseaseEntity[];
  onRefresh: () => Promise<void>;
  onFeedback: (type: "success" | "error", text: string) => void;
}

interface RuleFormState {
  code: string;
  name: string;
  description: string;
  diseaseId: string;
  priority: number;
  isActive: boolean;
  conditions: Array<{ symptomId: string; isNegated: boolean }>;
}

const EMPTY_FORM = (firstDiseaseId: string): RuleFormState => ({
  code: "",
  name: "",
  description: "",
  diseaseId: firstDiseaseId,
  priority: 1,
  isActive: true,
  conditions: [],
});

export function RuleManagerTab({
  rules,
  symptoms,
  diseases,
  onRefresh,
  onFeedback,
}: RuleManagerTabProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<RuleFormState>(() =>
    EMPTY_FORM(diseases[0]?.id ?? "")
  );
  const [saving, setSaving] = useState(false);

  const startEdit = (rule: RuleEntity) => {
    setEditingId(rule.id);
    setForm({
      code: rule.code,
      name: rule.name,
      description: rule.description,
      diseaseId: rule.diseaseId,
      priority: rule.priority,
      isActive: rule.isActive,
      conditions: rule.conditions.map((c) => ({
        symptomId: c.symptomId,
        isNegated: c.isNegated,
      })),
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM(diseases[0]?.id ?? ""));
  };

  const toggleCondition = (symptomId: string) => {
    setForm((prev) => {
      const exists = prev.conditions.find((c) => c.symptomId === symptomId);
      if (exists) {
        return {
          ...prev,
          conditions: prev.conditions.filter((c) => c.symptomId !== symptomId),
        };
      }
      return {
        ...prev,
        conditions: [...prev.conditions, { symptomId, isNegated: false }],
      };
    });
  };

  const toggleNegated = (symptomId: string) => {
    setForm((prev) => ({
      ...prev,
      conditions: prev.conditions.map((c) =>
        c.symptomId === symptomId ? { ...c, isNegated: !c.isNegated } : c
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        code: form.code.trim().toUpperCase(),
      };
      if (editingId) {
        await apiClient.updateRule(editingId, payload);
        onFeedback("success", `Regla ${payload.code} actualizada correctamente.`);
      } else {
        await apiClient.createRule(payload);
        onFeedback("success", `Regla ${payload.code} creada en la base de conocimiento.`);
      }
      resetForm();
      await onRefresh();
    } catch (error: unknown) {
      onFeedback(
        "error",
        error instanceof Error ? error.message : "Error al guardar la regla."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (rule: RuleEntity) => {
    try {
      await apiClient.updateRule(rule.id, { isActive: !rule.isActive });
      await onRefresh();
      onFeedback(
        "success",
        `Regla ${rule.code} ${rule.isActive ? "desactivada" : "activada"}.`
      );
    } catch (error: unknown) {
      onFeedback(
        "error",
        error instanceof Error ? error.message : "Error al cambiar estado."
      );
    }
  };

  const handleDelete = async (rule: RuleEntity) => {
    try {
      await apiClient.deleteRule(rule.id);
      if (editingId === rule.id) resetForm();
      await onRefresh();
      onFeedback("success", `Regla ${rule.code} eliminada.`);
    } catch (error: unknown) {
      onFeedback(
        "error",
        error instanceof Error ? error.message : "Error al eliminar la regla."
      );
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <form onSubmit={handleSubmit} className="surface-elevated space-y-4 p-5 lg:col-span-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-100">
            {editingId ? `Editando regla ${form.code}` : "Nueva Regla de Producción"}
          </h3>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="cursor-pointer text-xs text-sky-400 hover:underline"
            >
              Cancelar edición
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="rule-code" className="mb-1 block text-xs text-slate-400">
              Código (ej. R6)
            </label>
            <input
              id="rule-code"
              required
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              className="font-mono-code w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-100"
            />
          </div>
          <div>
            <label htmlFor="rule-priority" className="mb-1 block text-xs text-slate-400">
              Prioridad (1-100)
            </label>
            <input
              id="rule-priority"
              type="number"
              min={1}
              max={100}
              required
              value={form.priority}
              onChange={(e) =>
                setForm({ ...form, priority: Number(e.target.value) || 1 })
              }
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-100"
            />
          </div>
        </div>

        <div>
          <label htmlFor="rule-name" className="mb-1 block text-xs text-slate-400">
            Nombre de la regla
          </label>
          <input
            id="rule-name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Ej. Detección de Bronquitis Aguda"
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-100"
          />
        </div>

        <div>
          <label htmlFor="rule-disease" className="mb-1 block text-xs text-slate-400">
            Diagnóstico consecuente (Enfermedad)
          </label>
          <select
            id="rule-disease"
            required
            value={form.diseaseId}
            onChange={(e) => setForm({ ...form, diseaseId: e.target.value })}
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-100"
          >
            {diseases.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="rule-desc" className="mb-1 block text-xs text-slate-400">
            Descripción clínica / lógica
          </label>
          <textarea
            id="rule-desc"
            required
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-100"
          />
        </div>

        <div>
          <span className="mb-1.5 block text-xs text-slate-400">
            Premisas (Conjunción AND — marque síntomas requeridos)
          </span>
          <div className="max-h-52 space-y-1.5 overflow-y-auto rounded-md border border-slate-800 bg-slate-950/60 p-2">
            {symptoms.map((s) => {
              const cond = form.conditions.find((c) => c.symptomId === s.id);
              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-2 rounded px-2 py-1 hover:bg-slate-900"
                >
                  <label className="flex flex-1 cursor-pointer items-center gap-2 text-xs text-slate-200">
                    <input
                      type="checkbox"
                      checked={Boolean(cond)}
                      onChange={() => toggleCondition(s.id)}
                      className="accent-sky-500"
                    />
                    <span className="font-mono-code text-sky-300">{s.code}</span>
                    <span>{s.name}</span>
                  </label>
                  {cond && (
                    <button
                      type="button"
                      onClick={() => toggleNegated(s.id)}
                      className={`cursor-pointer rounded px-2 py-0.5 font-mono-code text-[11px] ${
                        cond.isNegated
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {cond.isNegated ? "¬ Negado" : "Afirmativo"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:opacity-60"
        >
          <Plus className="h-4 w-4" />
          {saving
            ? "Guardando..."
            : editingId
              ? "Guardar Cambios"
              : "Crear Regla"}
        </button>
      </form>

      <div className="space-y-3 lg:col-span-7">
        {rules.map((rule) => (
          <article
            key={rule.id}
            className={`rounded-xl border p-4 ${
              rule.isActive
                ? "border-slate-800 bg-slate-900/70"
                : "border-slate-800/50 bg-slate-950/40 opacity-65"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono-code rounded bg-slate-800 px-2 py-0.5 text-xs font-semibold text-sky-300">
                    {rule.code}
                  </span>
                  <h4 className="text-sm font-semibold text-slate-100">
                    {rule.name}
                  </h4>
                  <span className="text-xs text-slate-400">
                    Prioridad: {rule.priority}
                  </span>
                </div>
                <p className="font-mono-code mt-1.5 text-xs text-emerald-300">
                  {buildPropositionalFormula(rule)}
                </p>
                <p className="mt-1 text-xs text-slate-400">{rule.description}</p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleToggleActive(rule)}
                  title={rule.isActive ? "Desactivar regla" : "Activar regla"}
                  className="cursor-pointer rounded border border-slate-700 p-1.5 text-slate-300 hover:border-sky-500 hover:text-sky-300"
                >
                  <Power className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => startEdit(rule)}
                  title="Editar regla"
                  className="cursor-pointer rounded border border-slate-700 p-1.5 text-slate-300 hover:border-amber-500 hover:text-amber-300"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(rule)}
                  title="Eliminar regla"
                  className="cursor-pointer rounded border border-slate-700 p-1.5 text-slate-300 hover:border-rose-500 hover:text-rose-300"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
