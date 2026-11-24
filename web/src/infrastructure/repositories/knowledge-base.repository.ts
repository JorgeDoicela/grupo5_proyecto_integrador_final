import { prisma } from "@/infrastructure/prisma/client";
import type {
  DiseaseEntity,
  RuleEntity,
  SymptomEntity,
} from "@/domain/entities/types";
import type { Severity } from "@prisma/client";
import { seedCoreKnowledgeBase } from "../../../prisma/seed";

export const knowledgeBaseRepository = {
  async listSymptoms(): Promise<SymptomEntity[]> {
    const rows = await prisma.symptom.findMany({
      orderBy: [{ isCore: "desc" }, { code: "asc" }],
    });
    return rows.map((r) => ({
      id: r.id,
      code: r.code,
      name: r.name,
      englishName: r.englishName,
      description: r.description,
      isActive: r.isActive,
      isCore: r.isCore,
    }));
  },

  async createSymptom(input: {
    code: string;
    name: string;
    englishName: string;
    description: string;
    isActive: boolean;
  }): Promise<SymptomEntity> {
    const created = await prisma.symptom.create({ data: input });
    return {
      id: created.id,
      code: created.code,
      name: created.name,
      englishName: created.englishName,
      description: created.description,
      isActive: created.isActive,
      isCore: created.isCore,
    };
  },

  async updateSymptom(
    id: string,
    input: Partial<{
      code: string;
      name: string;
      englishName: string;
      description: string;
      isActive: boolean;
    }>
  ): Promise<SymptomEntity> {
    const updated = await prisma.symptom.update({
      where: { id },
      data: input,
    });
    return {
      id: updated.id,
      code: updated.code,
      name: updated.name,
      englishName: updated.englishName,
      description: updated.description,
      isActive: updated.isActive,
      isCore: updated.isCore,
    };
  },

  async deleteSymptom(id: string): Promise<void> {
    await prisma.symptom.delete({ where: { id } });
  },

  async listDiseases(): Promise<DiseaseEntity[]> {
    const rows = await prisma.disease.findMany({
      orderBy: [{ isCore: "desc" }, { name: "asc" }],
    });
    return rows.map((d) => ({
      id: d.id,
      code: d.code,
      name: d.name,
      englishName: d.englishName,
      description: d.description,
      severity: d.severity,
      recommendations: d.recommendations,
      isCore: d.isCore,
    }));
  },

  async createDisease(input: {
    code: string;
    name: string;
    englishName: string;
    description: string;
    severity: Severity;
    recommendations: string;
  }): Promise<DiseaseEntity> {
    const created = await prisma.disease.create({ data: input });
    return {
      id: created.id,
      code: created.code,
      name: created.name,
      englishName: created.englishName,
      description: created.description,
      severity: created.severity,
      recommendations: created.recommendations,
      isCore: created.isCore,
    };
  },

  async updateDisease(
    id: string,
    input: Partial<{
      code: string;
      name: string;
      englishName: string;
      description: string;
      severity: Severity;
      recommendations: string;
    }>
  ): Promise<DiseaseEntity> {
    const updated = await prisma.disease.update({
      where: { id },
      data: input,
    });
    return {
      id: updated.id,
      code: updated.code,
      name: updated.name,
      englishName: updated.englishName,
      description: updated.description,
      severity: updated.severity,
      recommendations: updated.recommendations,
      isCore: updated.isCore,
    };
  },

  async deleteDisease(id: string): Promise<void> {
    await prisma.disease.delete({ where: { id } });
  },

  async listRules(): Promise<RuleEntity[]> {
    const rows = await prisma.rule.findMany({
      include: {
        disease: true,
        conditions: {
          include: {
            symptom: true,
          },
          orderBy: {
            symptom: { code: "asc" },
          },
        },
      },
      orderBy: [{ code: "asc" }],
    });

    return rows.map((r) => ({
      id: r.id,
      code: r.code,
      name: r.name,
      description: r.description,
      diseaseId: r.diseaseId,
      disease: {
        id: r.disease.id,
        code: r.disease.code,
        name: r.disease.name,
        englishName: r.disease.englishName,
        description: r.disease.description,
        severity: r.disease.severity,
        recommendations: r.disease.recommendations,
        isCore: r.disease.isCore,
      },
      priority: r.priority,
      isActive: r.isActive,
      isCore: r.isCore,
      conditions: r.conditions.map((c) => ({
        symptomId: c.symptomId,
        symptomCode: c.symptom.code,
        symptomName: c.symptom.name,
        isNegated: c.isNegated,
      })),
    }));
  },

  async createRule(input: {
    code: string;
    name: string;
    description: string;
    diseaseId: string;
    priority: number;
    isActive: boolean;
    conditions: Array<{ symptomId: string; isNegated: boolean }>;
  }): Promise<RuleEntity> {
    const uniqueConditions = Array.from(
      new Map(input.conditions.map((c) => [c.symptomId, c])).values()
    );

    const created = await prisma.$transaction(async (tx) => {
      const rule = await tx.rule.create({
        data: {
          code: input.code,
          name: input.name,
          description: input.description,
          diseaseId: input.diseaseId,
          priority: input.priority,
          isActive: input.isActive,
          conditions: {
            create: uniqueConditions.map((c) => ({
              symptomId: c.symptomId,
              isNegated: c.isNegated,
            })),
          },
        },
        include: {
          disease: true,
          conditions: { include: { symptom: true } },
        },
      });
      return rule;
    });

    return {
      id: created.id,
      code: created.code,
      name: created.name,
      description: created.description,
      diseaseId: created.diseaseId,
      disease: {
        id: created.disease.id,
        code: created.disease.code,
        name: created.disease.name,
        englishName: created.disease.englishName,
        description: created.disease.description,
        severity: created.disease.severity,
        recommendations: created.disease.recommendations,
        isCore: created.disease.isCore,
      },
      priority: created.priority,
      isActive: created.isActive,
      isCore: created.isCore,
      conditions: created.conditions.map((c) => ({
        symptomId: c.symptomId,
        symptomCode: c.symptom.code,
        symptomName: c.symptom.name,
        isNegated: c.isNegated,
      })),
    };
  },

  async updateRule(
    id: string,
    input: Partial<{
      code: string;
      name: string;
      description: string;
      diseaseId: string;
      priority: number;
      isActive: boolean;
      conditions: Array<{ symptomId: string; isNegated: boolean }>;
    }>
  ): Promise<RuleEntity> {
    const updated = await prisma.$transaction(async (tx) => {
      if (input.conditions) {
        const uniqueConditions = Array.from(
          new Map(input.conditions.map((c) => [c.symptomId, c])).values()
        );
        await tx.ruleSymptom.deleteMany({ where: { ruleId: id } });
        await tx.ruleSymptom.createMany({
          data: uniqueConditions.map((c) => ({
            ruleId: id,
            symptomId: c.symptomId,
            isNegated: c.isNegated,
          })),
        });
      }

      return tx.rule.update({
        where: { id },
        data: {
          code: input.code,
          name: input.name,
          description: input.description,
          diseaseId: input.diseaseId,
          priority: input.priority,
          isActive: input.isActive,
        },
        include: {
          disease: true,
          conditions: { include: { symptom: true } },
        },
      });
    });

    return {
      id: updated.id,
      code: updated.code,
      name: updated.name,
      description: updated.description,
      diseaseId: updated.diseaseId,
      disease: {
        id: updated.disease.id,
        code: updated.disease.code,
        name: updated.disease.name,
        englishName: updated.disease.englishName,
        description: updated.disease.description,
        severity: updated.disease.severity,
        recommendations: updated.disease.recommendations,
        isCore: updated.disease.isCore,
      },
      priority: updated.priority,
      isActive: updated.isActive,
      isCore: updated.isCore,
      conditions: updated.conditions.map((c) => ({
        symptomId: c.symptomId,
        symptomCode: c.symptom.code,
        symptomName: c.symptom.name,
        isNegated: c.isNegated,
      })),
    };
  },

  async deleteRule(id: string): Promise<void> {
    await prisma.rule.delete({ where: { id } });
  },

  async resetCoreKnowledgeBase(): Promise<void> {
    await seedCoreKnowledgeBase(prisma);
  },
};
