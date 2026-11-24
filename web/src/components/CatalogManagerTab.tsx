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
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      <form
        onSubmit={handleSubmit}
        className="space-y-3.5 rounded-2xl border border-slate-200/80 bg-[#f8fafc] p-5 lg:col-span-5"
      >
        <h3 className="text-sm font-semibold text-[#1f1f1f]">
          {mode === "symptoms" ? "Nuevo Síntoma" : "Nueva Enfermedad"}
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="cat-code" className="mb-1 block text-xs font-medium text-[#444746]">
              Código
            </label>
            <input
              id="cat-code"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder={mode === "symptoms" ? "Ej. D" : "Ej. BRONCHITIS"}
              className="clinical-input font-mono-code"
            />
          </div>
          <div>
            <label htmlFor="cat-en" className="mb-1 block text-xs font-medium text-[#444746]">
              Nombre en inglés
            </label>
            <input
              id="cat-en"
              required
              value={englishName}
              onChange={(e) => setEnglishName(e.target.value)}
              placeholder={mode === "symptoms" ? "Chest pain" : "Bronchitis"}
              className="clinical-input"
            />
          </div>
        </div>

        <div>
          <label htmlFor="cat-name" className="mb-1 block text-xs font-medium text-[#444746]">
            Nombre en español
          </label>
          <input
            id="cat-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={mode === "symptoms" ? "Dolor torácico" : "Bronquitis aguda"}
            className="clinical-input"
          />
        </div>

        {mode === "diseases" && (
          <div>
            <label htmlFor="cat-sev" className="mb-1 block text-xs font-medium text-[#444746]">
              Severidad clínica
            </label>
            <select
              id="cat-sev"
              value={severity}
              onChange={(e) => setSeverity(e.target.value as SeverityLevel)}
              className="clinical-input"
            >
              <option value="LOW">Baja (LOW)</option>
              <option value="MEDIUM">Moderada (MEDIUM)</option>
              <option value="HIGH">Alta (HIGH)</option>
              <option value="CRITICAL">Crítica (CRITICAL)</option>
            </select>
          </div>
        )}

        <div>
          <label htmlFor="cat-desc" className="mb-1 block text-xs font-medium text-[#444746]">
            Descripción
          </label>
          <textarea
            id="cat-desc"
            required
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="clinical-input"
          />
        </div>

        {mode === "diseases" && (
          <div>
            <label htmlFor="cat-rec" className="mb-1 block text-xs font-medium text-[#444746]">
              Recomendación clínica
            </label>
            <textarea
              id="cat-rec"
              required
              rows={2}
              value={recommendations}
              onChange={(e) => setRecommendations(e.target.value)}
              className="clinical-input"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="btn-brand-cta flex w-full items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>
            {saving
              ? "Guardando..."
              : mode === "symptoms"
                ? "Agregar Síntoma"
                : "Agregar Enfermedad"}
          </span>
        </button>
      </form>

      <div className="space-y-3 lg:col-span-7">
        {mode === "symptoms"
          ? symptoms.map((s) => (
              <div
                key={s.id}
                className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 transition-colors hover:border-blue-300/80"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono-code text-xs font-bold text-[#0b57d0]">
                      {s.code}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-sm font-semibold text-[#1f1f1f]">{s.name}</span>
                    <span className="text-xs text-[#747775]">({s.englishName})</span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-[#444746]">
                    {s.description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(s.id, s.name)}
                  title="Eliminar síntoma"
                  className="cursor-pointer rounded-full p-2 text-[#444746] transition-colors hover:bg-rose-50 hover:text-rose-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          : diseases.map((d) => (
              <div
                key={d.id}
                className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 transition-colors hover:border-blue-300/80"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono-code text-xs font-bold text-indigo-700">
                      {d.code}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-sm font-semibold text-[#1f1f1f]">{d.name}</span>
                    <span className="text-slate-300">•</span>
                    <SeverityBadge severity={d.severity} />
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-[#444746]">
                    {d.description}
                  </p>
                  <p className="mt-1 text-xs text-[#1f1f1f]">
                    <span className="font-semibold">Recomendación:</span> {d.recommendations}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(d.id, d.name)}
                  title="Eliminar enfermedad"
                  className="cursor-pointer rounded-full p-2 text-[#444746] transition-colors hover:bg-rose-50 hover:text-rose-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
      </div>
    </div>
  );
}
