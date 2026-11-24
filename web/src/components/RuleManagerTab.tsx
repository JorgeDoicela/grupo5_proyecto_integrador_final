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
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-slate-200/80 bg-[#f8fafc] p-5 lg:col-span-5"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#1f1f1f]">
            {editingId ? `Editando regla ${form.code}` : "Nueva Regla de Producción"}
          </h3>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="cursor-pointer text-xs font-medium text-[#0b57d0] hover:underline"
            >
              Cancelar edición
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="rule-code" className="mb-1 block text-xs font-medium text-[#444746]">
              Código (ej. R6)
            </label>
            <input
              id="rule-code"
              required
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              className="clinical-input font-mono-code"
            />
          </div>
          <div>
            <label htmlFor="rule-priority" className="mb-1 block text-xs font-medium text-[#444746]">
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
              className="clinical-input"
            />
          </div>
        </div>

        <div>
          <label htmlFor="rule-name" className="mb-1 block text-xs font-medium text-[#444746]">
            Nombre de la regla
          </label>
          <input
            id="rule-name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Ej. Detección de Bronquitis Aguda"
            className="clinical-input"
          />
        </div>

        <div>
          <label htmlFor="rule-disease" className="mb-1 block text-xs font-medium text-[#444746]">
            Diagnóstico consecuente (Enfermedad)
          </label>
          <select
            id="rule-disease"
            required
            value={form.diseaseId}
            onChange={(e) => setForm({ ...form, diseaseId: e.target.value })}
            className="clinical-input"
          >
            {diseases.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="rule-desc" className="mb-1 block text-xs font-medium text-[#444746]">
            Descripción clínica / lógica
          </label>
          <textarea
            id="rule-desc"
            required
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="clinical-input"
          />
        </div>

        <div>
          <span className="mb-1.5 block text-xs font-medium text-[#444746]">
            Premisas (Conjunción AND — marque síntomas requeridos)
          </span>
          <div className="max-h-52 space-y-1.5 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2.5">
            {symptoms.map((s) => {
              const cond = form.conditions.find((c) => c.symptomId === s.id);
              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50"
                >
                  <label className="flex flex-1 cursor-pointer items-center gap-2 text-xs text-[#1f1f1f]">
                    <input
                      type="checkbox"
                      checked={Boolean(cond)}
                      onChange={() => toggleCondition(s.id)}
                      className="accent-[#0b57d0]"
                    />
                    <span className="font-mono-code font-semibold text-[#0b57d0]">
                      {s.code}
                    </span>
                    <span>{s.name}</span>
                  </label>
                  {cond && (
                    <button
                      type="button"
                      onClick={() => toggleNegated(s.id)}
                      className={`cursor-pointer font-mono-code text-[11px] font-semibold ${
                        cond.isNegated ? "text-amber-700" : "text-[#747775]"
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
          className="btn-brand-cta flex w-full items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>
            {saving
              ? "Guardando..."
              : editingId
                ? "Guardar Cambios"
                : "Crear Regla"}
          </span>
        </button>
      </form>

      <div className="space-y-3 lg:col-span-7">
        {rules.map((rule) => (
          <article
            key={rule.id}
            className={`rounded-2xl border p-4 transition-colors ${
              rule.isActive
                ? "border-slate-200/80 bg-white hover:border-blue-300/80"
                : "border-slate-200/60 bg-slate-50 opacity-65"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono-code text-xs font-bold text-[#0b57d0]">
                    {rule.code}
                  </span>
                  <span className="text-slate-300">•</span>
                  <h4 className="text-sm font-semibold text-[#1f1f1f]">
                    {rule.name}
                  </h4>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs text-[#747775]">
                    Prioridad {rule.priority}
                  </span>
                </div>
                <p className="font-mono-code mt-1.5 text-xs font-medium text-emerald-700">
                  {buildPropositionalFormula(rule)}
                </p>
                <p className="mt-1 text-xs text-[#444746]">{rule.description}</p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleToggleActive(rule)}
                  title={rule.isActive ? "Desactivar regla" : "Activar regla"}
                  className="cursor-pointer rounded-full p-2 text-[#444746] transition-colors hover:bg-blue-50 hover:text-[#0b57d0]"
                >
                  <Power className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => startEdit(rule)}
                  title="Editar regla"
                  className="cursor-pointer rounded-full p-2 text-[#444746] transition-colors hover:bg-amber-50 hover:text-amber-700"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(rule)}
                  title="Eliminar regla"
                  className="cursor-pointer rounded-full p-2 text-[#444746] transition-colors hover:bg-rose-50 hover:text-rose-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
