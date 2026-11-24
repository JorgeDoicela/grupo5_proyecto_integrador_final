import {
  SEVERITY_WEIGHT,
  type ConditionEvaluation,
  type DiagnosedDisease,
  type InferenceResult,
  type InferenceStep,
  type PartialRuleMatch,
  type RuleEntity,
  type SymptomEntity,
} from "@/domain/entities/types";
import {
  buildFolFormula,
  buildPropositionalFormula,
} from "@/domain/logic/formal-logic";

export interface InferenceInput {
  selectedSymptomIds: string[];
  allSymptoms: SymptomEntity[];
  activeRules: RuleEntity[];
}

/**
 * Motor de Inferencia basado en Encadenamiento hacia Adelante (Forward Chaining)
 * con aplicación de Modus Ponens y estrategia determinista de Resolución de Conflictos:
 * 1. Especificidad (mayor cantidad de premisas satisfechas).
 * 2. Severidad clínica de la enfermedad (CRITICAL > HIGH > MEDIUM > LOW).
 * 3. Prioridad explícita de la regla.
 */
export function runForwardChainingInference(
  input: InferenceInput
): InferenceResult {
  const selectedIdSet = new Set(input.selectedSymptomIds);
  const observedSymptoms = input.allSymptoms
    .filter((s) => selectedIdSet.has(s.id))
    .map((s) => ({ id: s.id, code: s.code, name: s.name }));

  const observedSymptomCodes = observedSymptoms.map((s) => s.code);

  const inferenceTrace: InferenceStep[] = [];
  const firedCandidates: Array<{
    rule: RuleEntity;
    propositionalFormula: string;
    folFormula: string;
    specificity: number;
  }> = [];
  const partialMatches: PartialRuleMatch[] = [];

  for (const rule of input.activeRules) {
    if (!rule.isActive || rule.conditions.length === 0) {
      continue;
    }

    const propositionalFormula = buildPropositionalFormula(rule);
    const folFormula = buildFolFormula(rule);

    const conditionEvaluations: ConditionEvaluation[] = rule.conditions.map(
      (cond) => {
        const observedPresent = selectedIdSet.has(cond.symptomId);
        const satisfied = cond.isNegated ? !observedPresent : observedPresent;
        return {
          symptomId: cond.symptomId,
          symptomCode: cond.symptomCode,
          symptomName: cond.symptomName,
          isNegated: cond.isNegated,
          observedPresent,
          satisfied,
        };
      }
    );

    const totalConditions = conditionEvaluations.length;
    const satisfiedCount = conditionEvaluations.filter(
      (c) => c.satisfied
    ).length;
    const fired = satisfiedCount === totalConditions;
    const matchRatio =
      totalConditions > 0 ? Number((satisfiedCount / totalConditions).toFixed(2)) : 0;

    const missingConditions = conditionEvaluations
      .filter((c) => !c.satisfied)
      .map((c) => (c.isNegated ? `ausencia de ${c.symptomName}` : c.symptomName));

    const reasoningSummary = fired
      ? `Modus Ponens aplicado: se satisfacen las ${totalConditions} premisas de ${rule.code}; se infiere ${rule.disease.name}.`
      : `Regla ${rule.code} no disparada (${satisfiedCount}/${totalConditions} premisas satisfechas). Falta: ${missingConditions.join(", ")}.`;

    inferenceTrace.push({
      ruleId: rule.id,
      ruleCode: rule.code,
      ruleName: rule.name,
      diseaseCode: rule.disease.code,
      diseaseName: rule.disease.name,
      propositionalFormula,
      folFormula,
      fired,
      specificity: totalConditions,
      satisfiedCount,
      totalConditions,
      matchRatio,
      conditionEvaluations,
      reasoningSummary,
    });

    if (fired) {
      firedCandidates.push({
        rule,
        propositionalFormula,
        folFormula,
        specificity: totalConditions,
      });
    } else if (satisfiedCount > 0) {
      partialMatches.push({
        ruleId: rule.id,
        ruleCode: rule.code,
        ruleName: rule.name,
        disease: rule.disease,
        satisfiedCount,
        totalConditions,
        coveragePercent: Math.round((satisfiedCount / totalConditions) * 100),
        missingConditions,
      });
    }
  }

  // Resolución de conflictos: especificidad -> severidad clínica -> prioridad
  firedCandidates.sort((a, b) => {
    if (b.specificity !== a.specificity) {
      return b.specificity - a.specificity;
    }
    const sevDiff =
      SEVERITY_WEIGHT[b.rule.disease.severity] -
      SEVERITY_WEIGHT[a.rule.disease.severity];
    if (sevDiff !== 0) {
      return sevDiff;
    }
    if (b.rule.priority !== a.rule.priority) {
      return b.rule.priority - a.rule.priority;
    }
    return a.rule.code.localeCompare(b.rule.code);
  });

  const conflictDetected = firedCandidates.length > 1;

  const matchedDiagnoses: DiagnosedDisease[] = firedCandidates.map(
    (candidate, index) => {
      const isPrimary = index === 0;
      let conflictResolutionReason = "Única regla satisfecha en la base de conocimiento.";

      if (conflictDetected) {
        conflictResolutionReason = isPrimary
          ? `Seleccionada como hipótesis principal por resolución de conflictos (especificidad: ${candidate.specificity} premisas, severidad: ${candidate.rule.disease.severity}, prioridad: ${candidate.rule.priority}).`
          : `Hipótesis diferencial concurrente (especificidad: ${candidate.specificity} premisas, severidad: ${candidate.rule.disease.severity}, prioridad: ${candidate.rule.priority}).`;
      }

      return {
        ruleId: candidate.rule.id,
        ruleCode: candidate.rule.code,
        ruleName: candidate.rule.name,
        disease: candidate.rule.disease,
        specificity: candidate.specificity,
        priority: candidate.rule.priority,
        isPrimary,
        propositionalFormula: candidate.propositionalFormula,
        folFormula: candidate.folFormula,
        conflictResolutionReason,
      };
    }
  );

  partialMatches.sort((a, b) => {
    if (b.coveragePercent !== a.coveragePercent) {
      return b.coveragePercent - a.coveragePercent;
    }
    return SEVERITY_WEIGHT[b.disease.severity] - SEVERITY_WEIGHT[a.disease.severity];
  });

  const conflictResolutionNote = conflictDetected
    ? `Se dispararon ${matchedDiagnoses.length} reglas simultáneamente (${matchedDiagnoses.map((d) => d.ruleCode).join(", ")}). Se aplicó resolución de conflictos por especificidad, severidad clínica y prioridad.`
    : null;

  return {
    observedSymptomCodes,
    observedSymptoms,
    matchedDiagnoses,
    partialMatches,
    inferenceTrace,
    conflictDetected,
    conflictResolutionNote,
  };
}
