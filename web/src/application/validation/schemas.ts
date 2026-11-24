import { z } from "zod";

export const severitySchema = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);

export const createSymptomSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "El código es obligatorio")
    .max(16, "Máximo 16 caracteres")
    .regex(/^[A-Z0-9_]+$/, "Solo letras mayúsculas, números o guion bajo"),
  name: z.string().trim().min(2, "El nombre es obligatorio").max(120),
  englishName: z.string().trim().min(2, "El nombre en inglés es obligatorio").max(120),
  description: z.string().trim().min(4, "La descripción es obligatoria").max(1000),
  isActive: z.boolean().optional().default(true),
});

export const updateSymptomSchema = createSymptomSchema.partial();

export const createDiseaseSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, "El código es obligatorio")
    .max(32, "Máximo 32 caracteres")
    .regex(/^[A-Z0-9_]+$/, "Solo letras mayúsculas, números o guion bajo"),
  name: z.string().trim().min(2, "El nombre es obligatorio").max(120),
  englishName: z.string().trim().min(2, "El nombre en inglés es obligatorio").max(120),
  description: z.string().trim().min(4, "La descripción es obligatoria").max(1500),
  severity: severitySchema,
  recommendations: z.string().trim().min(4, "Las recomendaciones son obligatorias").max(1500),
});

export const updateDiseaseSchema = createDiseaseSchema.partial();

export const ruleConditionInputSchema = z.object({
  symptomId: z.string().uuid("ID de síntoma inválido"),
  isNegated: z.boolean().optional().default(false),
});

export const createRuleSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, "El código es obligatorio")
    .max(16, "Máximo 16 caracteres")
    .regex(/^[A-Z0-9_]+$/, "Solo letras mayúsculas, números o guion bajo"),
  name: z.string().trim().min(3, "El nombre es obligatorio").max(160),
  description: z.string().trim().min(4, "La descripción es obligatoria").max(1000),
  diseaseId: z.string().uuid("ID de enfermedad inválido"),
  priority: z.number().int().min(1).max(100).default(1),
  isActive: z.boolean().optional().default(true),
  conditions: z
    .array(ruleConditionInputSchema)
    .min(1, "Una regla debe contener al menos una premisa (síntoma)"),
});

export const updateRuleSchema = createRuleSchema.partial();

export const runEvaluationSchema = z.object({
  patientRef: z
    .string()
    .trim()
    .min(1, "La referencia del caso es obligatoria")
    .max(120)
    .default("Caso Clínico"),
  symptomIds: z
    .array(z.string().uuid("ID de síntoma inválido"))
    .min(1, "Seleccione al menos un síntoma para ejecutar la inferencia"),
});
