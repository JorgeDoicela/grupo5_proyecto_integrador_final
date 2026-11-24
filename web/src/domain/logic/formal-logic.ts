import type {
  RuleEntity,
  RuleFormalization,
  TruthTableRow,
} from "@/domain/entities/types";

const MAX_TRUTH_TABLE_VARIABLES = 6;

export function buildPropositionalFormula(rule: RuleEntity): string {
  if (rule.conditions.length === 0) {
    return `⊤ → ${rule.disease.code}`;
  }

  const antecedent = rule.conditions
    .map((c) => (c.isNegated ? `¬${c.symptomCode}` : c.symptomCode))
    .join(" ∧ ");

  return `(${antecedent}) → ${rule.disease.code}`;
}

export function buildFolFormula(rule: RuleEntity): string {
  if (rule.conditions.length === 0) {
    return `∀x (Paciente(x) → PosibleDiagnostico(x, ${rule.disease.code}))`;
  }

  const predicates = rule.conditions
    .map((c) => {
      const atom = `PresentaSintoma(x, ${c.symptomCode})`;
      return c.isNegated ? `¬${atom}` : atom;
    })
    .join(" ∧ ");

  return `∀x ((Paciente(x) ∧ ${predicates}) → PosibleDiagnostico(x, ${rule.disease.code}))`;
}

export function buildCircuitSummary(rule: RuleEntity): string {
  if (rule.conditions.length === 0) {
    return `Salida directa hacia ${rule.disease.code}`;
  }

  const negated = rule.conditions.filter((c) => c.isNegated);
  const inputs = rule.conditions.map((c) =>
    c.isNegated ? `NOT(${c.symptomCode})` : c.symptomCode
  );

  const notStage =
    negated.length > 0
      ? `Inversores NOT en [${negated.map((n) => n.symptomCode).join(", ")}] → `
      : "";

  return `${notStage}Compuerta AND(${inputs.join(", ")}) → ${rule.disease.code}`;
}

export function buildTruthTable(rule: RuleEntity): {
  rows: TruthTableRow[];
  truncated: boolean;
} {
  const vars = rule.conditions;
  if (vars.length === 0) {
    return { rows: [], truncated: false };
  }

  if (vars.length > MAX_TRUTH_TABLE_VARIABLES) {
    const firingAssignment: Record<string, boolean> = {};
    for (const c of vars) {
      firingAssignment[c.symptomCode] = !c.isNegated;
    }

    const emptyAssignment: Record<string, boolean> = {};
    for (const c of vars) {
      emptyAssignment[c.symptomCode] = c.isNegated;
    }

    return {
      rows: [
        {
          assignments: firingAssignment,
          antecedentResult: true,
          consequentInferred: true,
        },
        {
          assignments: emptyAssignment,
          antecedentResult: false,
          consequentInferred: false,
        },
      ],
      truncated: true,
    };
  }

  const totalRows = 1 << vars.length;
  const rows: TruthTableRow[] = [];

  for (let mask = totalRows - 1; mask >= 0; mask--) {
    const assignments: Record<string, boolean> = {};
    let antecedentResult = true;

    for (let i = 0; i < vars.length; i++) {
      const cond = vars[i];
      if (!cond) continue;
      const bitIndex = vars.length - 1 - i;
      const val = Boolean((mask >> bitIndex) & 1);
      assignments[cond.symptomCode] = val;

      const satisfied = cond.isNegated ? !val : val;
      if (!satisfied) {
        antecedentResult = false;
      }
    }

    rows.push({
      assignments,
      antecedentResult,
      consequentInferred: antecedentResult,
    });
  }

  return { rows, truncated: false };
}

export function formalizeRule(rule: RuleEntity): RuleFormalization {
  const { rows, truncated } = buildTruthTable(rule);
  return {
    ruleId: rule.id,
    ruleCode: rule.code,
    ruleName: rule.name,
    diseaseCode: rule.disease.code,
    diseaseName: rule.disease.name,
    variables: rule.conditions.map((c) => ({
      code: c.symptomCode,
      name: c.symptomName,
      isNegated: c.isNegated,
    })),
    propositionalFormula: buildPropositionalFormula(rule),
    folFormula: buildFolFormula(rule),
    circuitSummary: buildCircuitSummary(rule),
    truthTable: rows,
    truthTableTruncated: truncated,
  };
}
