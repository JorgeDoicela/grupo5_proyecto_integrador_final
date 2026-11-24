import { describe, expect, it } from "vitest";
import {
  createDiseaseSchema,
  createRuleSchema,
  createSymptomSchema,
  runEvaluationSchema,
} from "@/application/validation/schemas";

describe("Esquemas de validación Zod", () => {
  it("valida correctamente la creación de un síntoma y rechaza códigos en minúsculas", () => {
    const ok = createSymptomSchema.safeParse({
      code: "D",
      name: "Dolor de pecho",
      englishName: "Chest pain",
      description: "Molestia torácica al respirar.",
    });
    expect(ok.success).toBe(true);

    const bad = createSymptomSchema.safeParse({
      code: "dolor-1",
      name: "D",
      englishName: "C",
      description: "x",
    });
    expect(bad.success).toBe(false);
  });

  it("rechaza una regla sin condiciones y valida una regla bien formada", () => {
    const uuid1 = "550e8400-e29b-41d4-a716-446655440000";
    const uuid2 = "550e8400-e29b-41d4-a716-446655440001";

    expect(
      createRuleSchema.safeParse({
        code: "R6",
        name: "Regla válida",
        description: "Descripción clínica suficiente",
        diseaseId: uuid1,
        priority: 3,
        conditions: [{ symptomId: uuid2, isNegated: false }],
      }).success
    ).toBe(true);

    expect(
      createRuleSchema.safeParse({
        code: "R6",
        name: "Regla vacía",
        description: "Sin condiciones",
        diseaseId: uuid1,
        priority: 3,
        conditions: [],
      }).success
    ).toBe(false);
  });

  it("exige al menos un síntoma UUID válido en runEvaluationSchema", () => {
    expect(
      runEvaluationSchema.safeParse({
        patientRef: "Caso 1",
        symptomIds: [],
      }).success
    ).toBe(false);

    expect(
      createDiseaseSchema.safeParse({
        code: "BRONCHITIS",
        name: "Bronquitis",
        englishName: "Bronchitis",
        description: "Inflamación bronquial aguda.",
        severity: "MEDIUM",
        recommendations: "Hidratación y control médico.",
      }).success
    ).toBe(true);
  });
});
