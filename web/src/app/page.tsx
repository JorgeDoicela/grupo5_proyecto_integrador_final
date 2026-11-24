import { knowledgeBaseRepository } from "@/infrastructure/repositories/knowledge-base.repository";
import { evaluationRepository } from "@/infrastructure/repositories/evaluation.repository";
import { formalizeRule } from "@/domain/logic/formal-logic";
import { buildKnowledgeGraph } from "@/domain/engine/graph-builder";
import { ExpertSystemShell } from "@/components/ExpertSystemShell";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [symptoms, diseases, rules, evaluations] = await Promise.all([
    knowledgeBaseRepository.listSymptoms(),
    knowledgeBaseRepository.listDiseases(),
    knowledgeBaseRepository.listRules(),
    evaluationRepository.listRecent(30),
  ]);

  const formalizations = rules.map(formalizeRule);
  const graph = buildKnowledgeGraph({ symptoms, diseases, rules });

  return (
    <ExpertSystemShell
      initialKnowledgeBase={{
        symptoms,
        diseases,
        rules,
        formalizations,
        graph,
      }}
      initialEvaluations={evaluations}
    />
  );
}
