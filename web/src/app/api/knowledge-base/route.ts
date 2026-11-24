import { NextResponse } from "next/server";
import { knowledgeBaseRepository } from "@/infrastructure/repositories/knowledge-base.repository";
import { handleApiError } from "@/infrastructure/http/problem-details";
import { formalizeRule } from "@/domain/logic/formal-logic";
import { buildKnowledgeGraph } from "@/domain/engine/graph-builder";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  try {
    const [symptoms, diseases, rules] = await Promise.all([
      knowledgeBaseRepository.listSymptoms(),
      knowledgeBaseRepository.listDiseases(),
      knowledgeBaseRepository.listRules(),
    ]);

    const formalizations = rules.map(formalizeRule);
    const graph = buildKnowledgeGraph({ symptoms, diseases, rules });

    return NextResponse.json({
      symptoms,
      diseases,
      rules,
      formalizations,
      graph,
    });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
