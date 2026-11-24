import { PrismaClient, Severity } from "@prisma/client";

const prisma = new PrismaClient();

export const CORE_SYMPTOMS = [
  {
    code: "F",
    name: "Fiebre",
    englishName: "Fever",
    description: "Elevación de la temperatura corporal por encima de 38 °C asociada a respuesta inflamatoria o infecciosa.",
    isCore: true,
  },
  {
    code: "C",
    name: "Tos",
    englishName: "Cough",
    description: "Expulsión refleja de aire para despejar las vías respiratorias de secreciones o irritantes.",
    isCore: true,
  },
  {
    code: "S",
    name: "Dificultad para respirar",
    englishName: "Shortness of breath",
    description: "Sensación subjetiva de falta de aire o esfuerzo respiratorio anormal (disnea).",
    isCore: true,
  },
  {
    code: "T",
    name: "Dolor de garganta",
    englishName: "Sore throat",
    description: "Irritación, inflamación o molestia faríngea que se acentúa al deglutir.",
    isCore: true,
  },
  {
    code: "A",
    name: "Fatiga",
    englishName: "Fatigue",
    description: "Cansancio físico persistente o debilidad generalizada sin esfuerzo previo proporcional.",
    isCore: true,
  },
  {
    code: "L",
    name: "Pérdida de olfato",
    englishName: "Loss of smell",
    description: "Disminución o ausencia súbita de la capacidad olfativa (anosmia o hiposmia).",
    isCore: true,
  },
] as const;

export const CORE_DISEASES = [
  {
    code: "COLD",
    name: "Resfriado común",
    englishName: "Cold",
    severity: Severity.LOW,
    description: "Infección viral leve de las vías respiratorias superiores de curso generalmente autolimitado.",
    recommendations: "Hidratación adecuada, reposo relativo y control sintomático. Consultar si persiste más de 7 días.",
    isCore: true,
  },
  {
    code: "FLU",
    name: "Gripe",
    englishName: "Flu",
    severity: Severity.MEDIUM,
    description: "Infección respiratoria aguda causada por virus de la influenza con compromiso sistémico moderado.",
    recommendations: "Reposo, hidratación, control térmico y evaluación médica en grupos de riesgo.",
    isCore: true,
  },
  {
    code: "COVID19",
    name: "COVID-19",
    englishName: "COVID-19",
    severity: Severity.HIGH,
    description: "Enfermedad infecciosa causada por SARS-CoV-2 con afectación respiratoria y neurosensorial característica.",
    recommendations: "Aislamiento preventivo, prueba diagnóstica confirmatoria, monitoreo de saturación de oxígeno y seguimiento médico.",
    isCore: true,
  },
  {
    code: "ASTHMA",
    name: "Asma",
    englishName: "Asthma",
    severity: Severity.HIGH,
    description: "Trastorno inflamatorio crónico de las vías aéreas caracterizado por broncoconstricción reversible y disnea.",
    recommendations: "Evaluación neumológica, espirometría y uso de broncodilatadores bajo prescripción médica.",
    isCore: true,
  },
  {
    code: "PNEUMONIA",
    name: "Neumonía",
    englishName: "Pneumonia",
    severity: Severity.CRITICAL,
    description: "Infección aguda del parénquima pulmonar que compromete el intercambio gaseoso alveolar.",
    recommendations: "Atención médica urgente, evaluación radiológica de tórax, oximetría y tratamiento dirigido.",
    isCore: true,
  },
] as const;

export const CORE_RULES = [
  {
    code: "R1",
    name: "Detección de Resfriado Común",
    description: "Si el paciente presenta dolor de garganta y fatiga, se infiere posible resfriado común.",
    diseaseCode: "COLD",
    priority: 1,
    symptomCodes: ["T", "A"],
    isCore: true,
  },
  {
    code: "R2",
    name: "Detección de Gripe",
    description: "Si el paciente presenta fiebre, tos y fatiga, se infiere posible gripe.",
    diseaseCode: "FLU",
    priority: 2,
    symptomCodes: ["F", "C", "A"],
    isCore: true,
  },
  {
    code: "R3",
    name: "Detección de COVID-19",
    description: "Si el paciente presenta fiebre, tos y pérdida de olfato, se infiere posible COVID-19.",
    diseaseCode: "COVID19",
    priority: 4,
    symptomCodes: ["F", "C", "L"],
    isCore: true,
  },
  {
    code: "R4",
    name: "Detección de Asma",
    description: "Si el paciente presenta dificultad para respirar y tos, se infiere posible asma.",
    diseaseCode: "ASTHMA",
    priority: 3,
    symptomCodes: ["S", "C"],
    isCore: true,
  },
  {
    code: "R5",
    name: "Detección de Neumonía",
    description: "Si el paciente presenta fiebre, dificultad para respirar y tos, se infiere posible neumonía.",
    diseaseCode: "PNEUMONIA",
    priority: 5,
    symptomCodes: ["F", "S", "C"],
    isCore: true,
  },
] as const;

export async function seedCoreKnowledgeBase(client: PrismaClient = prisma): Promise<void> {
  const symptomIdByCode = new Map<string, string>();

  for (const symptom of CORE_SYMPTOMS) {
    const saved = await client.symptom.upsert({
      where: { code: symptom.code },
      update: {
        name: symptom.name,
        englishName: symptom.englishName,
        description: symptom.description,
        isActive: true,
        isCore: true,
      },
      create: {
        code: symptom.code,
        name: symptom.name,
        englishName: symptom.englishName,
        description: symptom.description,
        isActive: true,
        isCore: true,
      },
    });
    symptomIdByCode.set(saved.code, saved.id);
  }

  const diseaseIdByCode = new Map<string, string>();

  for (const disease of CORE_DISEASES) {
    const saved = await client.disease.upsert({
      where: { code: disease.code },
      update: {
        name: disease.name,
        englishName: disease.englishName,
        severity: disease.severity,
        description: disease.description,
        recommendations: disease.recommendations,
        isCore: true,
      },
      create: {
        code: disease.code,
        name: disease.name,
        englishName: disease.englishName,
        severity: disease.severity,
        description: disease.description,
        recommendations: disease.recommendations,
        isCore: true,
      },
    });
    diseaseIdByCode.set(saved.code, saved.id);
  }

  for (const rule of CORE_RULES) {
    const diseaseId = diseaseIdByCode.get(rule.diseaseCode);
    if (!diseaseId) {
      throw new Error(`Enfermedad base no encontrada para código: ${rule.diseaseCode}`);
    }

    const savedRule = await client.rule.upsert({
      where: { code: rule.code },
      update: {
        name: rule.name,
        description: rule.description,
        diseaseId,
        priority: rule.priority,
        isActive: true,
        isCore: true,
      },
      create: {
        code: rule.code,
        name: rule.name,
        description: rule.description,
        diseaseId,
        priority: rule.priority,
        isActive: true,
        isCore: true,
      },
    });

    await client.ruleSymptom.deleteMany({
      where: { ruleId: savedRule.id },
    });

    await client.ruleSymptom.createMany({
      data: rule.symptomCodes.map((symptomCode) => {
        const symptomId = symptomIdByCode.get(symptomCode);
        if (!symptomId) {
          throw new Error(`Síntoma base no encontrado para código: ${symptomCode}`);
        }
        return {
          ruleId: savedRule.id,
          symptomId,
          isNegated: false,
        };
      }),
    });
  }
}

async function main(): Promise<void> {
  await seedCoreKnowledgeBase(prisma);
  console.log("Seed idempotente completado: 6 síntomas, 5 enfermedades y 5 reglas base.");
}

if (require.main === module) {
  main()
    .catch((error: unknown) => {
      console.error("Error ejecutando seed:", error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
