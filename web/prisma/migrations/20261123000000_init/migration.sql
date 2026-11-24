-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "symptoms" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(16) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "english_name" VARCHAR(120) NOT NULL,
    "description" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_core" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "symptoms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diseases" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(32) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "english_name" VARCHAR(120) NOT NULL,
    "description" TEXT NOT NULL,
    "severity" "Severity" NOT NULL DEFAULT 'MEDIUM',
    "recommendations" TEXT NOT NULL,
    "is_core" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diseases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rules" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(16) NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "description" TEXT NOT NULL,
    "disease_id" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_core" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rule_symptoms" (
    "id" TEXT NOT NULL,
    "rule_id" TEXT NOT NULL,
    "symptom_id" TEXT NOT NULL,
    "is_negated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "rule_symptoms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evaluations" (
    "id" TEXT NOT NULL,
    "patient_ref" VARCHAR(120) NOT NULL,
    "selected_symptoms" JSONB NOT NULL,
    "matched_diagnoses" JSONB NOT NULL,
    "partial_matches" JSONB NOT NULL,
    "inference_trace" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "symptoms_code_key" ON "symptoms"("code");
CREATE INDEX "symptoms_is_active_idx" ON "symptoms"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "diseases_code_key" ON "diseases"("code");
CREATE INDEX "diseases_severity_idx" ON "diseases"("severity");

-- CreateIndex
CREATE UNIQUE INDEX "rules_code_key" ON "rules"("code");
CREATE INDEX "rules_disease_id_idx" ON "rules"("disease_id");
CREATE INDEX "rules_is_active_idx" ON "rules"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "rule_symptoms_rule_id_symptom_id_key" ON "rule_symptoms"("rule_id", "symptom_id");
CREATE INDEX "rule_symptoms_rule_id_idx" ON "rule_symptoms"("rule_id");
CREATE INDEX "rule_symptoms_symptom_id_idx" ON "rule_symptoms"("symptom_id");

-- CreateIndex
CREATE INDEX "evaluations_created_at_idx" ON "evaluations"("created_at" DESC);

-- AddForeignKey
ALTER TABLE "rules" ADD CONSTRAINT "rules_disease_id_fkey" FOREIGN KEY ("disease_id") REFERENCES "diseases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rule_symptoms" ADD CONSTRAINT "rule_symptoms_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rule_symptoms" ADD CONSTRAINT "rule_symptoms_symptom_id_fkey" FOREIGN KEY ("symptom_id") REFERENCES "symptoms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
