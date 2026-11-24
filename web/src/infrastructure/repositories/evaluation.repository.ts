import { prisma } from "@/infrastructure/prisma/client";
import type { Prisma } from "@prisma/client";
import type {
  DiagnosedDisease,
  EvaluationRecord,
  InferenceResult,
  InferenceStep,
  PartialRuleMatch,
  SymptomEntity,
} from "@/domain/entities/types";

export const evaluationRepository = {
  async saveEvaluation(
    patientRef: string,
    result: InferenceResult
  ): Promise<EvaluationRecord> {
    const created = await prisma.evaluation.create({
      data: {
        patientRef,
        selectedSymptoms: result.observedSymptoms as unknown as Prisma.InputJsonValue,
        matchedDiagnoses: result.matchedDiagnoses as unknown as Prisma.InputJsonValue,
        partialMatches: result.partialMatches as unknown as Prisma.InputJsonValue,
        inferenceTrace: result.inferenceTrace as unknown as Prisma.InputJsonValue,
      },
    });

    return {
      id: created.id,
      patientRef: created.patientRef,
      selectedSymptoms: created.selectedSymptoms as unknown as Pick<
        SymptomEntity,
        "id" | "code" | "name"
      >[],
      matchedDiagnoses: created.matchedDiagnoses as unknown as DiagnosedDisease[],
      partialMatches: created.partialMatches as unknown as PartialRuleMatch[],
      inferenceTrace: created.inferenceTrace as unknown as InferenceStep[],
      createdAt: created.createdAt.toISOString(),
    };
  },

  async listRecent(limit = 30): Promise<EvaluationRecord[]> {
    const rows = await prisma.evaluation.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return rows.map((row) => ({
      id: row.id,
      patientRef: row.patientRef,
      selectedSymptoms: row.selectedSymptoms as unknown as Pick<
        SymptomEntity,
        "id" | "code" | "name"
      >[],
      matchedDiagnoses: row.matchedDiagnoses as unknown as DiagnosedDisease[],
      partialMatches: row.partialMatches as unknown as PartialRuleMatch[],
      inferenceTrace: row.inferenceTrace as unknown as InferenceStep[],
      createdAt: row.createdAt.toISOString(),
    }));
  },

  async deleteById(id: string): Promise<void> {
    await prisma.evaluation.delete({ where: { id } });
  },
};
