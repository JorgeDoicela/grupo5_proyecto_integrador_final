import { NextRequest, NextResponse } from "next/server";
import { knowledgeBaseRepository } from "@/infrastructure/repositories/knowledge-base.repository";
import { createDiseaseSchema } from "@/application/validation/schemas";
import { handleApiError } from "@/infrastructure/http/problem-details";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  try {
    const diseases = await knowledgeBaseRepository.listDiseases();
    return NextResponse.json({ data: diseases });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();
    const parsed = createDiseaseSchema.parse(body);
    const created = await knowledgeBaseRepository.createDisease(parsed);
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
