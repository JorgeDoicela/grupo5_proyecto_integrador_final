import { NextRequest, NextResponse } from "next/server";
import { evaluationRepository } from "@/infrastructure/repositories/evaluation.repository";
import { handleApiError } from "@/infrastructure/http/problem-details";

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    await evaluationRepository.deleteById(id);
    return new NextResponse(null, { status: 204 });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
