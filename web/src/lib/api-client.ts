import type {
  DiseaseEntity,
  EvaluationRecord,
  InferenceResult,
  KnowledgeGraphData,
  RuleEntity,
  RuleFormalization,
  SeverityLevel,
  SymptomEntity,
} from "@/domain/entities/types";

export interface KnowledgeBaseSnapshot {
  symptoms: SymptomEntity[];
  diseases: DiseaseEntity[];
  rules: RuleEntity[];
  formalizations: RuleFormalization[];
  graph: KnowledgeGraphData;
}

export interface ApiErrorResponse {
  title?: string;
  detail?: string;
  errors?: Record<string, string[]>;
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = (await response.json()) as T & ApiErrorResponse;

  if (!response.ok) {
    const fieldMessages = payload.errors
      ? Object.values(payload.errors).flat().join(" · ")
      : "";
    const message =
      [payload.detail, fieldMessages].filter(Boolean).join(" — ") ||
      payload.title ||
      `Error HTTP ${response.status}`;
    throw new Error(message);
  }

  return payload;
}

export const apiClient = {
  getKnowledgeBase(): Promise<KnowledgeBaseSnapshot> {
    return requestJson<KnowledgeBaseSnapshot>("/api/knowledge-base");
  },

  resetKnowledgeBase(): Promise<{ message: string }> {
    return requestJson<{ message: string }>("/api/knowledge-base/reset", {
      method: "POST",
    });
  },

  runEvaluation(payload: {
    patientRef: string;
    symptomIds: string[];
  }): Promise<{ evaluation: EvaluationRecord; result: InferenceResult }> {
    return requestJson("/api/evaluations", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  listEvaluations(): Promise<{ data: EvaluationRecord[] }> {
    return requestJson<{ data: EvaluationRecord[] }>("/api/evaluations");
  },

  deleteEvaluation(id: string): Promise<void> {
    return requestJson<void>(`/api/evaluations/${id}`, { method: "DELETE" });
  },

  createSymptom(payload: {
    code: string;
    name: string;
    englishName: string;
    description: string;
    isActive?: boolean;
  }): Promise<{ data: SymptomEntity }> {
    return requestJson("/api/symptoms", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateSymptom(
    id: string,
    payload: Partial<{
      code: string;
      name: string;
      englishName: string;
      description: string;
      isActive: boolean;
    }>
  ): Promise<{ data: SymptomEntity }> {
    return requestJson(`/api/symptoms/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  deleteSymptom(id: string): Promise<void> {
    return requestJson<void>(`/api/symptoms/${id}`, { method: "DELETE" });
  },

  createDisease(payload: {
    code: string;
    name: string;
    englishName: string;
    description: string;
    severity: SeverityLevel;
    recommendations: string;
  }): Promise<{ data: DiseaseEntity }> {
    return requestJson("/api/diseases", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateDisease(
    id: string,
    payload: Partial<{
      code: string;
      name: string;
      englishName: string;
      description: string;
      severity: SeverityLevel;
      recommendations: string;
    }>
  ): Promise<{ data: DiseaseEntity }> {
    return requestJson(`/api/diseases/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  deleteDisease(id: string): Promise<void> {
    return requestJson<void>(`/api/diseases/${id}`, { method: "DELETE" });
  },

  createRule(payload: {
    code: string;
    name: string;
    description: string;
    diseaseId: string;
    priority: number;
    isActive?: boolean;
    conditions: Array<{ symptomId: string; isNegated: boolean }>;
  }): Promise<{ data: RuleEntity }> {
    return requestJson("/api/rules", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateRule(
    id: string,
    payload: Partial<{
      code: string;
      name: string;
      description: string;
      diseaseId: string;
      priority: number;
      isActive: boolean;
      conditions: Array<{ symptomId: string; isNegated: boolean }>;
    }>
  ): Promise<{ data: RuleEntity }> {
    return requestJson(`/api/rules/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  deleteRule(id: string): Promise<void> {
    return requestJson<void>(`/api/rules/${id}`, { method: "DELETE" });
  },
};
