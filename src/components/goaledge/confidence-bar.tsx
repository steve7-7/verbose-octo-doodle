import { cn } from "@/lib/utils";
import { confidenceTier } from "@/lib/constants";

export function ConfidenceBar({
  value,
  showLabel = true,
  className,
}: {
  value: number;
  showLabel?: boolean;
  className?: string;
}) {
  const tier = confidenceTier(value);
  const color =
    value >= 70 ? "bg-emerald-500" : value >= 55 ? "bg-amber-500" : "bg-slate-400";
  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="font-medium text-slate-500">Confidence</span>
          <span className={cn("font-bold", tier.color)}>
            {value}% · {tier.label}
          </span>
        </div>
      )}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${Math.min(100, Math.max(4, value))}%` }}
        />
      </div>
    </div>
  );
}
