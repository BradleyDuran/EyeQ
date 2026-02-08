import { getAttentionLabel, getAttentionColor } from "@/lib/attention-scoring";
import { Eye, AlertTriangle, XCircle } from "lucide-react";

interface AttentionFeedbackProps {
  score: number;
  showRefocusAlert: boolean;
}

export function AttentionFeedback({ score, showRefocusAlert }: AttentionFeedbackProps) {
  const label = getAttentionLabel(score);
  const color = getAttentionColor(score);

  const Icon = score >= 80 ? Eye : score >= 40 ? AlertTriangle : XCircle;

  return (
    <div className="flex flex-col items-center gap-3" data-testid="attention-feedback">
      <div
        className="flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-300"
        style={{
          backgroundColor: `${color}15`,
          border: `1px solid ${color}30`,
        }}
      >
        <Icon className="w-4 h-4" style={{ color }} />
        <span
          className="text-sm font-semibold uppercase tracking-wider"
          style={{ color }}
          data-testid="text-attention-label"
        >
          {label}
        </span>
      </div>

      {showRefocusAlert && (
        <div
          className="flex items-center gap-2 px-5 py-3 rounded-md animate-pulse"
          style={{
            backgroundColor: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.4)",
          }}
          data-testid="refocus-alert"
        >
          <Eye className="w-5 h-5 text-red-400" />
          <span className="text-base font-bold text-red-400">Refocus</span>
        </div>
      )}
    </div>
  );
}
