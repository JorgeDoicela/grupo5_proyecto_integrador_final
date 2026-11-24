export type SeverityLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export const SEVERITY_WEIGHT: Record<SeverityLevel, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
};

export const SEVERITY_LABEL: Record<SeverityLevel, string> = {
  LOW: "Baja",
  MEDIUM: "Moderada",
  HIGH: "Alta",
  CRITICAL: "Crítica",
};

export interface SymptomEntity {
  id: string;
  code: string;
  name: string;
  englishName: string;
  description: string;
  isActive: boolean;
  isCore: boolean;
}

export interface DiseaseEntity {
  id: string;
  code: string;
  name: string;
  englishName: string;
  description: string;
  severity: SeverityLevel;
  recommendations: string;
  isCore: boolean;
}

export interface RuleConditionEntity {
  symptomId: string;
  symptomCode: string;
  symptomName: string;
  isNegated: boolean;
}

export interface RuleEntity {
  id: string;
  code: string;
  name: string;
  description: string;
  diseaseId: string;
  disease: DiseaseEntity;
  priority: number;
  isActive: boolean;
  isCore: boolean;
  conditions: RuleConditionEntity[];
}

export interface ConditionEvaluation {
  symptomId: string;
  symptomCode: string;
  symptomName: string;
  isNegated: boolean;
  observedPresent: boolean;
  satisfied: boolean;
}

export interface InferenceStep {
  ruleId: string;
  ruleCode: string;
  ruleName: string;
  diseaseCode: string;
  diseaseName: string;
  propositionalFormula: string;
  folFormula: string;
  fired: boolean;
  specificity: number;
  satisfiedCount: number;
  totalConditions: number;
  matchRatio: number;
  conditionEvaluations: ConditionEvaluation[];
  reasoningSummary: string;
}

export interface DiagnosedDisease {
  ruleId: string;
  ruleCode: string;
  ruleName: string;
  disease: DiseaseEntity;
  specificity: number;
  priority: number;
  isPrimary: boolean;
  propositionalFormula: string;
  folFormula: string;
  conflictResolutionReason: string;
}

export interface PartialRuleMatch {
  ruleId: string;
  ruleCode: string;
  ruleName: string;
  disease: DiseaseEntity;
  satisfiedCount: number;
  totalConditions: number;
  coveragePercent: number;
  missingConditions: string[];
}

export interface InferenceResult {
  observedSymptomCodes: string[];
  observedSymptoms: Pick<SymptomEntity, "id" | "code" | "name">[];
  matchedDiagnoses: DiagnosedDisease[];
  partialMatches: PartialRuleMatch[];
  inferenceTrace: InferenceStep[];
  conflictDetected: boolean;
  conflictResolutionNote: string | null;
}

export interface TruthTableRow {
  assignments: Record<string, boolean>;
  antecedentResult: boolean;
  consequentInferred: boolean;
}

export interface RuleFormalization {
  ruleId: string;
  ruleCode: string;
  ruleName: string;
  diseaseCode: string;
  diseaseName: string;
  variables: { code: string; name: string; isNegated: boolean }[];
  propositionalFormula: string;
  folFormula: string;
  circuitSummary: string;
  truthTable: TruthTableRow[];
  truthTableTruncated: boolean;
}

export interface GraphNode {
  id: string;
  type: "symptom" | "rule" | "disease";
  code: string;
  label: string;
  sublabel: string;
  severity?: SeverityLevel;
  active?: boolean;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relation: "PREMISE" | "NEGATED_PREMISE" | "INFERS";
  label: string;
  active?: boolean;
}

export interface KnowledgeGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface EvaluationRecord {
  id: string;
  patientRef: string;
  selectedSymptoms: Pick<SymptomEntity, "id" | "code" | "name">[];
  matchedDiagnoses: DiagnosedDisease[];
  partialMatches: PartialRuleMatch[];
  inferenceTrace: InferenceStep[];
  createdAt: string;
}
