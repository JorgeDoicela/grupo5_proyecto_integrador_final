import { SEVERITY_LABEL, type SeverityLevel } from "@/domain/entities/types";

const STYLES: Record<SeverityLevel, string> = {
  LOW: "text-emerald-700",
  MEDIUM: "text-amber-700",
  HIGH: "text-indigo-700",
  CRITICAL: "text-rose-700",
};

const DOT_STYLES: Record<SeverityLevel, string> = {
  LOW: "bg-emerald-500",
  MEDIUM: "bg-amber-500",
  HIGH: "bg-indigo-600",
  CRITICAL: "bg-rose-600",
};

interface SeverityBadgeProps {
  severity: SeverityLevel;
}

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide ${STYLES[severity]}`}
    >
      <span className={`h-2 w-2 rounded-full ${DOT_STYLES[severity]}`} aria-hidden="true" />
      <span>Severidad {SEVERITY_LABEL[severity]}</span>
    </span>
  );
}
