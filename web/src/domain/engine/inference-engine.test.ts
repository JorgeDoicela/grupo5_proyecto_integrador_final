import { describe, expect, it } from "vitest";
import { runForwardChainingInference } from "@/domain/engine/inference-engine";
import type {
  DiseaseEntity,
  RuleEntity,
  SymptomEntity,
} from "@/domain/entities/types";

const SYMPTOMS: SymptomEntity[] = [
  { id: "s-f", code: "F", name: "Fiebre", englishName: "Fever", description: "", isActive: true, isCore: true },
  { id: "s-c", code: "C", name: "Tos", englishName: "Cough", description: "", isActive: true, isCore: true },
  { id: "s-s", code: "S", name: "Dificultad para respirar", englishName: "Shortness of breath", description: "", isActive: true, isCore: true },
  { id: "s-t", code: "T", name: "Dolor de garganta", englishName: "Sore throat", description: "", isActive: true, isCore: true },
  { id: "s-a", code: "A", name: "Fatiga", englishName: "Fatigue", description: "", isActive: true, isCore: true },
  { id: "s-l", code: "L", name: "Pérdida de olfato", englishName: "Loss of smell", description: "", isActive: true, isCore: true },
];

const DISEASES = {
  COLD: { id: "d-cold", code: "COLD", name: "Resfriado común", englishName: "Cold", description: "", severity: "LOW", recommendations: "", isCore: true },
  FLU: { id: "d-flu", code: "FLU", name: "Gripe", englishName: "Flu", description: "", severity: "MEDIUM", recommendations: "", isCore: true },
  COVID19: { id: "d-covid", code: "COVID19", name: "COVID-19", englishName: "COVID-19", description: "", severity: "HIGH", recommendations: "", isCore: true },
  ASTHMA: { id: "d-asthma", code: "ASTHMA", name: "Asma", englishName: "Asthma", description: "", severity: "HIGH", recommendations: "", isCore: true },
  PNEUMONIA: { id: "d-pneu", code: "PNEUMONIA", name: "Neumonía", englishName: "Pneumonia", description: "", severity: "CRITICAL", recommendations: "", isCore: true },
} satisfies Record<string, DiseaseEntity>;

const RULES: RuleEntity[] = [
  {
    id: "r1",
    code: "R1",
    name: "Resfriado",
    description: "",
    diseaseId: DISEASES.COLD.id,
    disease: DISEASES.COLD,
    priority: 1,
    isActive: true,
    isCore: true,
    conditions: [
      { symptomId: "s-t", symptomCode: "T", symptomName: "Dolor de garganta", isNegated: false },
      { symptomId: "s-a", symptomCode: "A", symptomName: "Fatiga", isNegated: false },
    ],
  },
  {
    id: "r2",
    code: "R2",
    name: "Gripe",
    description: "",
    diseaseId: DISEASES.FLU.id,
    disease: DISEASES.FLU,
    priority: 2,
    isActive: true,
    isCore: true,
    conditions: [
      { symptomId: "s-f", symptomCode: "F", symptomName: "Fiebre", isNegated: false },
      { symptomId: "s-c", symptomCode: "C", symptomName: "Tos", isNegated: false },
      { symptomId: "s-a", symptomCode: "A", symptomName: "Fatiga", isNegated: false },
    ],
  },
  {
    id: "r3",
    code: "R3",
    name: "COVID-19",
    description: "",
    diseaseId: DISEASES.COVID19.id,
    disease: DISEASES.COVID19,
    priority: 4,
    isActive: true,
    isCore: true,
    conditions: [
      { symptomId: "s-f", symptomCode: "F", symptomName: "Fiebre", isNegated: false },
      { symptomId: "s-c", symptomCode: "C", symptomName: "Tos", isNegated: false },
      { symptomId: "s-l", symptomCode: "L", symptomName: "Pérdida de olfato", isNegated: false },
    ],
  },
  {
    id: "r4",
    code: "R4",
    name: "Asma",
    description: "",
    diseaseId: DISEASES.ASTHMA.id,
    disease: DISEASES.ASTHMA,
    priority: 3,
    isActive: true,
    isCore: true,
    conditions: [
      { symptomId: "s-s", symptomCode: "S", symptomName: "Dificultad para respirar", isNegated: false },
      { symptomId: "s-c", symptomCode: "C", symptomName: "Tos", isNegated: false },
    ],
  },
  {
    id: "r5",
    code: "R5",
    name: "Neumonía",
    description: "",
    diseaseId: DISEASES.PNEUMONIA.id,
    disease: DISEASES.PNEUMONIA,
    priority: 5,
    isActive: true,
    isCore: true,
    conditions: [
      { symptomId: "s-f", symptomCode: "F", symptomName: "Fiebre", isNegated: false },
      { symptomId: "s-s", symptomCode: "S", symptomName: "Dificultad para respirar", isNegated: false },
      { symptomId: "s-c", symptomCode: "C", symptomName: "Tos", isNegated: false },
    ],
  },
];

describe("Motor de Inferencia Forward Chaining", () => {
  it("infiere Resfriado común (R1) con T y A", () => {
    const result = runForwardChainingInference({
      selectedSymptomIds: ["s-t", "s-a"],
      allSymptoms: SYMPTOMS,
      activeRules: RULES,
    });
    expect(result.matchedDiagnoses).toHaveLength(1);
    expect(result.matchedDiagnoses[0]?.disease.code).toBe("COLD");
  });

  it("infiere Gripe (R2) con F, C y A", () => {
    const result = runForwardChainingInference({
      selectedSymptomIds: ["s-f", "s-c", "s-a"],
      allSymptoms: SYMPTOMS,
      activeRules: RULES,
    });
    expect(result.matchedDiagnoses).toHaveLength(1);
    expect(result.matchedDiagnoses[0]?.disease.code).toBe("FLU");
  });

  it("infiere COVID-19 (R3) con F, C y L", () => {
    const result = runForwardChainingInference({
      selectedSymptomIds: ["s-f", "s-c", "s-l"],
      allSymptoms: SYMPTOMS,
      activeRules: RULES,
    });
    expect(result.matchedDiagnoses).toHaveLength(1);
    expect(result.matchedDiagnoses[0]?.disease.code).toBe("COVID19");
    expect(result.conflictDetected).toBe(false);
  });

  it("infiere Asma (R4) con S y C sin fiebre", () => {
    const result = runForwardChainingInference({
      selectedSymptomIds: ["s-s", "s-c"],
      allSymptoms: SYMPTOMS,
      activeRules: RULES,
    });
    expect(result.matchedDiagnoses).toHaveLength(1);
    expect(result.matchedDiagnoses[0]?.disease.code).toBe("ASTHMA");
  });

  it("resuelve conflicto Neumonía vs Asma (F, S, C) priorizando Neumonía", () => {
    const result = runForwardChainingInference({
      selectedSymptomIds: ["s-f", "s-s", "s-c"],
      allSymptoms: SYMPTOMS,
      activeRules: RULES,
    });
    expect(result.conflictDetected).toBe(true);
    expect(result.matchedDiagnoses).toHaveLength(2);
    expect(result.matchedDiagnoses[0]?.disease.code).toBe("PNEUMONIA");
    expect(result.matchedDiagnoses[0]?.isPrimary).toBe(true);
    expect(result.matchedDiagnoses[1]?.disease.code).toBe("ASTHMA");
    expect(result.matchedDiagnoses[1]?.isPrimary).toBe(false);
  });

  it("resuelve empate de especificidad por severidad clínica (COVID-19 sobre Gripe)", () => {
    const result = runForwardChainingInference({
      selectedSymptomIds: ["s-f", "s-c", "s-a", "s-l"],
      allSymptoms: SYMPTOMS,
      activeRules: RULES,
    });
    expect(result.conflictDetected).toBe(true);
    expect(result.matchedDiagnoses[0]?.disease.code).toBe("COVID19");
    expect(result.matchedDiagnoses[1]?.disease.code).toBe("FLU");
  });

  it("reporta coincidencias parciales cuando ninguna regla se cumple completamente", () => {
    const result = runForwardChainingInference({
      selectedSymptomIds: ["s-f", "s-c"],
      allSymptoms: SYMPTOMS,
      activeRules: RULES,
    });
    expect(result.matchedDiagnoses).toHaveLength(0);
    expect(result.partialMatches.length).toBeGreaterThan(0);
    expect(result.partialMatches[0]?.coveragePercent).toBe(67);
  });

  it("ignora reglas inactivas y soporta condiciones negadas", () => {
    const customRules: RuleEntity[] = [
      { ...RULES[0]!, isActive: false },
      {
        id: "r-neg",
        code: "R6",
        name: "Asma sin fiebre",
        description: "",
        diseaseId: DISEASES.ASTHMA.id,
        disease: DISEASES.ASTHMA,
        priority: 1,
        isActive: true,
        isCore: false,
        conditions: [
          { symptomId: "s-s", symptomCode: "S", symptomName: "Dificultad para respirar", isNegated: false },
          { symptomId: "s-f", symptomCode: "F", symptomName: "Fiebre", isNegated: true },
        ],
      },
    ];

    const withoutFever = runForwardChainingInference({
      selectedSymptomIds: ["s-s", "s-t", "s-a"],
      allSymptoms: SYMPTOMS,
      activeRules: customRules,
    });
    expect(withoutFever.matchedDiagnoses).toHaveLength(1);
    expect(withoutFever.matchedDiagnoses[0]?.ruleCode).toBe("R6");

    const withFever = runForwardChainingInference({
      selectedSymptomIds: ["s-s", "s-f"],
      allSymptoms: SYMPTOMS,
      activeRules: customRules,
    });
    expect(withFever.matchedDiagnoses).toHaveLength(0);
  });
});
