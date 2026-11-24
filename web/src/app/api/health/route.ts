import { NextResponse } from "next/server";
import { prisma } from "@/infrastructure/prisma/client";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        status: "unhealthy",
        database: "disconnected",
        detail: error instanceof Error ? error.message : "Database check failed",
      },
      { status: 503 }
    );
  }
}
