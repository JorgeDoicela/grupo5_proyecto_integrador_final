"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type {
  DiseaseEntity,
  SeverityLevel,
  SymptomEntity,
} from "@/domain/entities/types";
import { apiClient } from "@/lib/api-client";
import { SeverityBadge } from "@/components/SeverityBadge";

interface CatalogManagerTabProps {
  mode: "symptoms" | "diseases";
  symptoms: SymptomEntity[];
  diseases: DiseaseEntity[];
  onRefresh: () => Promise<void>;
  onFeedback: (type: "success" | "error", text: string) => void;
}

export function CatalogManagerTab({
  mode,
  symptoms,
  diseases,
  onRefresh,
  onFeedback,
}: CatalogManagerTabProps) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [englishName, setEnglishName] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<SeverityLevel>("MEDIUM");
  const [recommendations, setRecommendations] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (mode === "symptoms") {
        await apiClient.createSymptom({
          code: code.trim().toUpperCase(),
          name: name.trim(),
          englishName: englishName.trim(),
          description: description.trim(),
        });
        onFeedback("success", `Síntoma ${code.toUpperCase()} creado.`);
      } else {
        await apiClient.createDisease({
          code: code.trim().toUpperCase(),
          name: name.trim(),
          englishName: englishName.trim(),
          description: description.trim(),
          severity,
          recommendations: recommendations.trim(),
        });
        onFeedback("success", `Enfermedad ${code.toUpperCase()} creada.`);
      }
      setCode("");
      setName("");
      setEnglishName("");
      setDescription("");
      setRecommendations("");
      await onRefresh();
    } catch (error: unknown) {
      onFeedback(
        "error",
        error instanceof Error ? error.message : "Error al guardar registro."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, label: string) => {
    try {
      if (mode === "symptoms") {
        await apiClient.deleteSymptom(id);
      } else {
        await apiClient.deleteDisease(id);
      }
      await onRefresh();
      onFeedback("success", `${label} eliminado.`);
    } catch (error: unknown) {
      onFeedback(
        "error",
        error instanceof Error ? error.message : "Error al eliminar registro."
      );
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <form onSubmit={handleSubmit} className="surface-elevated space-y-3 p-5 lg:col-span-5">
        <h3 className="text-sm font-semibold text-slate-100">
          {mode === "symptoms" ? "Nuevo Síntoma" : "Nueva Enfermedad"}
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="cat-code" className="mb-1 block text-xs text-slate-400">
              Código
            </label>
            <input
              id="cat-code"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder={mode === "symptoms" ? "Ej. D" : "Ej. BRONCHITIS"}
              className="font-mono-code w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-100"
            />
          </div>
          <div>
            <label htmlFor="cat-en" className="mb-1 block text-xs text-slate-400">
              Nombre en inglés
            </label>
            <input
              id="cat-en"
              required
              value={englishName}
              onChange={(e) => setEnglishName(e.target.value)}
              placeholder={mode === "symptoms" ? "Chest pain" : "Bronchitis"}
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-100"
            />
          </div>
        </div>

        <div>
          <label htmlFor="cat-name" className="mb-1 block text-xs text-slate-400">
            Nombre en español
          </label>
          <input
            id="cat-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={mode === "symptoms" ? "Dolor torácico" : "Bronquitis aguda"}
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-100"
          />
        </div>

        {mode === "diseases" && (
          <div>
            <label htmlFor="cat-sev" className="mb-1 block text-xs text-slate-400">
              Severidad clínica
            </label>
            <select
              id="cat-sev"
              value={severity}
              onChange={(e) => setSeverity(e.target.value as SeverityLevel)}
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-100"
            >
              <option value="LOW">Baja (LOW)</option>
              <option value="MEDIUM">Moderada (MEDIUM)</option>
              <option value="HIGH">Alta (HIGH)</option>
              <option value="CRITICAL">Crítica (CRITICAL)</option>
            </select>
          </div>
        )}

        <div>
          <label htmlFor="cat-desc" className="mb-1 block text-xs text-slate-400">
            Descripción
          </label>
          <textarea
            id="cat-desc"
            required
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-100"
          />
        </div>

        {mode === "diseases" && (
          <div>
            <label htmlFor="cat-rec" className="mb-1 block text-xs text-slate-400">
              Recomendación clínica
            </label>
            <textarea
              id="cat-rec"
              required
              rows={2}
              value={recommendations}
              onChange={(e) => setRecommendations(e.target.value)}
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-100"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:opacity-60"
        >
          <Plus className="h-4 w-4" />
          {saving ? "Guardando..." : mode === "symptoms" ? "Agregar Síntoma" : "Agregar Enfermedad"}
        </button>
      </form>

      <div className="space-y-2.5 lg:col-span-7">
        {mode === "symptoms"
          ? symptoms.map((s) => (
              <div
                key={s.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono-code rounded bg-slate-800 px-2 py-0.5 text-xs font-semibold text-sky-300">
                      {s.code}
                    </span>
                    <span className="text-sm font-semibold text-slate-100">{s.name}</span>
                    <span className="text-xs text-slate-400">({s.englishName})</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{s.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(s.id, s.name)}
                  title="Eliminar síntoma"
                  className="cursor-pointer rounded border border-slate-700 p-1.5 text-slate-300 hover:border-rose-500 hover:text-rose-300"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          : diseases.map((d) => (
              <div
                key={d.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-4"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono-code rounded bg-slate-800 px-2 py-0.5 text-xs font-semibold text-rose-300">
                      {d.code}
                    </span>
                    <span className="text-sm font-semibold text-slate-100">{d.name}</span>
                    <SeverityBadge severity={d.severity} />
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{d.description}</p>
                  <p className="mt-1 text-xs text-slate-300">
                    Recomendación: {d.recommendations}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(d.id, d.name)}
                  title="Eliminar enfermedad"
                  className="cursor-pointer rounded border border-slate-700 p-1.5 text-slate-300 hover:border-rose-500 hover:text-rose-300"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
      </div>
    </div>
  );
}
