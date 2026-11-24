import { describe, expect, it } from "vitest";
import {
  buildCircuitSummary,
  buildFolFormula,
  buildPropositionalFormula,
  formalizeRule,
} from "@/domain/logic/formal-logic";
import type { RuleEntity } from "@/domain/entities/types";

const BASE_RULE: RuleEntity = {
  id: "r3",
  code: "R3",
  name: "Detección COVID-19",
  description: "",
  diseaseId: "d-covid",
  disease: {
    id: "d-covid",
    code: "COVID19",
    name: "COVID-19",
    englishName: "COVID-19",
    description: "",
    severity: "HIGH",
    recommendations: "",
    isCore: true,
  },
  priority: 4,
  isActive: true,
  isCore: true,
  conditions: [
    { symptomId: "s-f", symptomCode: "F", symptomName: "Fiebre", isNegated: false },
    { symptomId: "s-c", symptomCode: "C", symptomName: "Tos", isNegated: false },
    { symptomId: "s-l", symptomCode: "L", symptomName: "Pérdida de olfato", isNegated: false },
  ],
};

describe("Lógica Formal, Tablas de Verdad y Circuitos", () => {
  it("construye fórmula proposicional y LPO exactas", () => {
    expect(buildPropositionalFormula(BASE_RULE)).toBe("(F ∧ C ∧ L) → COVID19");
    expect(buildFolFormula(BASE_RULE)).toBe(
      "∀x ((Paciente(x) ∧ PresentaSintoma(x, F) ∧ PresentaSintoma(x, C) ∧ PresentaSintoma(x, L)) → PosibleDiagnostico(x, COVID19))"
    );
  });

  it("genera tabla de verdad completa de 2^3 = 8 filas con una sola fila de disparo", () => {
    const result = formalizeRule(BASE_RULE);
    expect(result.truthTableTruncated).toBe(false);
    expect(result.truthTable).toHaveLength(8);
    expect(result.truthTable.filter((r) => r.consequentInferred)).toHaveLength(1);
    expect(result.truthTable[0]?.consequentInferred).toBe(true);
  });

  it("incluye inversores NOT en el resumen de circuito cuando hay condiciones negadas", () => {
    const negatedRule: RuleEntity = {
      ...BASE_RULE,
      conditions: [
        { symptomId: "s-s", symptomCode: "S", symptomName: "Disnea", isNegated: false },
        { symptomId: "s-f", symptomCode: "F", symptomName: "Fiebre", isNegated: true },
      ],
    };

    expect(buildPropositionalFormula(negatedRule)).toBe("(S ∧ ¬F) → COVID19");
    expect(buildCircuitSummary(negatedRule)).toContain("NOT(F)");
    const formal = formalizeRule(negatedRule);
    expect(formal.truthTable).toHaveLength(4);
    expect(
      formal.truthTable.find((r) => r.assignments.S === true && r.assignments.F === false)
        ?.consequentInferred
    ).toBe(true);
  });
});
