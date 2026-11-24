import { describe, expect, it } from "vitest";
import { buildKnowledgeGraph } from "@/domain/engine/graph-builder";
import type {
  DiseaseEntity,
  RuleEntity,
  SymptomEntity,
} from "@/domain/entities/types";

describe("Constructor del Grafo de Conocimiento", () => {
  const symptoms: SymptomEntity[] = [
    { id: "s1", code: "T", name: "Dolor de garganta", englishName: "Sore throat", description: "", isActive: true, isCore: true },
    { id: "s2", code: "A", name: "Fatiga", englishName: "Fatigue", description: "", isActive: true, isCore: true },
    { id: "s3", code: "X", name: "Inactivo", englishName: "Inactive", description: "", isActive: false, isCore: false },
  ];

  const diseases: DiseaseEntity[] = [
    { id: "d1", code: "COLD", name: "Resfriado común", englishName: "Cold", description: "", severity: "LOW", recommendations: "", isCore: true },
  ];

  const rules: RuleEntity[] = [
    {
      id: "r1",
      code: "R1",
      name: "Resfriado",
      description: "",
      diseaseId: "d1",
      disease: diseases[0]!,
      priority: 1,
      isActive: true,
      isCore: true,
      conditions: [
        { symptomId: "s1", symptomCode: "T", symptomName: "Dolor de garganta", isNegated: false },
        { symptomId: "s2", symptomCode: "A", symptomName: "Fatiga", isNegated: false },
      ],
    },
  ];

  it("construye nodos tripartitos (síntomas activos, reglas activas y enfermedades) y sus aristas", () => {
    const graph = buildKnowledgeGraph({
      symptoms,
      diseases,
      rules,
      activeSymptomIds: ["s1", "s2"],
      activeRuleIds: ["r1"],
    });

    expect(graph.nodes).toHaveLength(4); // 2 síntomas activos + 1 regla + 1 enfermedad
    expect(graph.edges).toHaveLength(3); // 2 premisas + 1 inferencia
    expect(graph.nodes.find((n) => n.id === "disease:d1")?.active).toBe(true);
    expect(graph.nodes.find((n) => n.id === "symptom:s3")).toBeUndefined();
  });
});
