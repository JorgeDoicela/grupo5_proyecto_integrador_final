import { SEVERITY_LABEL, type SeverityLevel } from "@/domain/entities/types";

const STYLES: Record<SeverityLevel, string> = {
  LOW: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  MEDIUM: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  HIGH: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  CRITICAL: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

interface SeverityBadgeProps {
  severity: SeverityLevel;
}

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide ${STYLES[severity]}`}
    >
      Severidad: {SEVERITY_LABEL[severity]}
    </span>
  );
}
