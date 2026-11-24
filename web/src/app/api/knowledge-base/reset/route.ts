import { NextResponse } from "next/server";
import { knowledgeBaseRepository } from "@/infrastructure/repositories/knowledge-base.repository";
import { handleApiError } from "@/infrastructure/http/problem-details";
import { realtimeEventBus } from "@/infrastructure/realtime/event-bus";

export async function POST(): Promise<NextResponse> {
  try {
    await knowledgeBaseRepository.resetCoreKnowledgeBase();
    realtimeEventBus.publish("knowledge-updated");
    return NextResponse.json({
      message: "Base de conocimiento restaurada a las reglas base del enunciado.",
    });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
