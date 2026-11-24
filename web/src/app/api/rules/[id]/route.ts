import { NextRequest, NextResponse } from "next/server";
import { knowledgeBaseRepository } from "@/infrastructure/repositories/knowledge-base.repository";
import { updateRuleSchema } from "@/application/validation/schemas";
import { handleApiError } from "@/infrastructure/http/problem-details";
import { realtimeEventBus } from "@/infrastructure/realtime/event-bus";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    const body: unknown = await request.json();
    const parsed = updateRuleSchema.parse(body);
    const updated = await knowledgeBaseRepository.updateRule(id, parsed);
    realtimeEventBus.publish("knowledge-updated");
    return NextResponse.json({ data: updated });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await context.params;
    await knowledgeBaseRepository.deleteRule(id);
    realtimeEventBus.publish("knowledge-updated");
    return new NextResponse(null, { status: 204 });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
