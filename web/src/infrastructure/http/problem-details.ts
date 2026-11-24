import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

export class AppError extends Error {
  public readonly status: number;
  public readonly title: string;
  public readonly type: string;

  constructor(params: {
    status: number;
    title: string;
    detail: string;
    type?: string;
  }) {
    super(params.detail);
    this.status = params.status;
    this.title = params.title;
    this.type = params.type ?? "about:blank";
  }
}

export interface ProblemDetailsPayload {
  type: string;
  title: string;
  status: number;
  detail: string;
  errors?: Record<string, string[]>;
}

export function handleApiError(error: unknown): NextResponse<ProblemDetailsPayload> {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        type: error.type,
        title: error.title,
        status: error.status,
        detail: error.message,
      },
      {
        status: error.status,
        headers: { "Content-Type": "application/problem+json" },
      }
    );
  }

  if (error instanceof ZodError) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of error.issues) {
      const key = issue.path.join(".") || "body";
      fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message];
    }

    return NextResponse.json(
      {
        type: "https://httpstatuses.com/422",
        title: "Error de validación",
        status: 422,
        detail: "Los datos enviados no cumplen el esquema requerido.",
        errors: fieldErrors,
      },
      {
        status: 422,
        headers: { "Content-Type": "application/problem+json" },
      }
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return NextResponse.json(
        {
          type: "https://httpstatuses.com/409",
          title: "Conflicto de unicidad",
          status: 409,
          detail: "Ya existe un registro con el mismo código identificador.",
        },
        {
          status: 409,
          headers: { "Content-Type": "application/problem+json" },
        }
      );
    }

    if (error.code === "P2025") {
      return NextResponse.json(
        {
          type: "https://httpstatuses.com/404",
          title: "Recurso no encontrado",
          status: 404,
          detail: "El recurso solicitado no existe en la base de datos.",
        },
        {
          status: 404,
          headers: { "Content-Type": "application/problem+json" },
        }
      );
    }
  }

  console.error(
    JSON.stringify({
      level: "error",
      timestamp: new Date().toISOString(),
      message: "Unhandled API error",
      error: error instanceof Error ? error.message : String(error),
    })
  );

  return NextResponse.json(
    {
      type: "https://httpstatuses.com/500",
      title: "Error interno del servidor",
      status: 500,
      detail: "Ocurrió un error inesperado al procesar la solicitud.",
    },
    {
      status: 500,
      headers: { "Content-Type": "application/problem+json" },
    }
  );
}
