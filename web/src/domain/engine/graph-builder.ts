import type {
  DiseaseEntity,
  GraphEdge,
  GraphNode,
  KnowledgeGraphData,
  RuleEntity,
  SymptomEntity,
} from "@/domain/entities/types";

export function buildKnowledgeGraph(params: {
  symptoms: SymptomEntity[];
  diseases: DiseaseEntity[];
  rules: RuleEntity[];
  activeSymptomIds?: string[];
  activeRuleIds?: string[];
}): KnowledgeGraphData {
  const activeSymptomSet = new Set(params.activeSymptomIds ?? []);
  const activeRuleSet = new Set(params.activeRuleIds ?? []);
  const activeDiseaseSet = new Set(
    params.rules
      .filter((r) => activeRuleSet.has(r.id))
      .map((r) => r.diseaseId)
  );

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  for (const s of params.symptoms) {
    if (!s.isActive) continue;
    nodes.push({
      id: `symptom:${s.id}`,
      type: "symptom",
      code: s.code,
      label: s.name,
      sublabel: `${s.englishName} (${s.code})`,
      active: activeSymptomSet.has(s.id),
    });
  }

  for (const r of params.rules) {
    if (!r.isActive) continue;
    const ruleNodeId = `rule:${r.id}`;
    const isRuleActive = activeRuleSet.has(r.id);

    nodes.push({
      id: ruleNodeId,
      type: "rule",
      code: r.code,
      label: r.code,
      sublabel: r.name,
      active: isRuleActive,
    });

    for (const cond of r.conditions) {
      edges.push({
        id: `edge:${cond.symptomId}->${r.id}`,
        source: `symptom:${cond.symptomId}`,
        target: ruleNodeId,
        relation: cond.isNegated ? "NEGATED_PREMISE" : "PREMISE",
        label: cond.isNegated ? "NO presenta" : "presenta",
        active: isRuleActive || activeSymptomSet.has(cond.symptomId),
      });
    }

    edges.push({
      id: `edge:${r.id}->${r.diseaseId}`,
      source: ruleNodeId,
      target: `disease:${r.diseaseId}`,
      relation: "INFERS",
      label: "infiere",
      active: isRuleActive,
    });
  }

  for (const d of params.diseases) {
    nodes.push({
      id: `disease:${d.id}`,
      type: "disease",
      code: d.code,
      label: d.name,
      sublabel: `${d.englishName} · ${d.severity}`,
      severity: d.severity,
      active: activeDiseaseSet.has(d.id),
    });
  }

  return { nodes, edges };
}
