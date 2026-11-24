import { NextRequest, NextResponse } from "next/server";
import { knowledgeBaseRepository } from "@/infrastructure/repositories/knowledge-base.repository";
import { createRuleSchema } from "@/application/validation/schemas";
import { handleApiError } from "@/infrastructure/http/problem-details";
import { realtimeEventBus } from "@/infrastructure/realtime/event-bus";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  try {
    const rules = await knowledgeBaseRepository.listRules();
    return NextResponse.json({ data: rules });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();
    const parsed = createRuleSchema.parse(body);
    const created = await knowledgeBaseRepository.createRule(parsed);
    realtimeEventBus.publish("knowledge-updated");
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
