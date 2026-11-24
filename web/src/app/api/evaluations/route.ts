import { NextRequest, NextResponse } from "next/server";
import { knowledgeBaseRepository } from "@/infrastructure/repositories/knowledge-base.repository";
import { evaluationRepository } from "@/infrastructure/repositories/evaluation.repository";
import { runEvaluationSchema } from "@/application/validation/schemas";
import { runForwardChainingInference } from "@/domain/engine/inference-engine";
import { handleApiError } from "@/infrastructure/http/problem-details";
import { realtimeEventBus } from "@/infrastructure/realtime/event-bus";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  try {
    const evaluations = await evaluationRepository.listRecent(30);
    return NextResponse.json({ data: evaluations });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();
    const parsed = runEvaluationSchema.parse(body);

    const [allSymptoms, allRules] = await Promise.all([
      knowledgeBaseRepository.listSymptoms(),
      knowledgeBaseRepository.listRules(),
    ]);

    const activeRules = allRules.filter((r) => r.isActive);

    const inferenceResult = runForwardChainingInference({
      selectedSymptomIds: parsed.symptomIds,
      allSymptoms,
      activeRules,
    });

    const saved = await evaluationRepository.saveEvaluation(
      parsed.patientRef,
      inferenceResult
    );

    realtimeEventBus.publish("evaluations-updated");

    return NextResponse.json(
      {
        evaluation: saved,
        result: inferenceResult,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
