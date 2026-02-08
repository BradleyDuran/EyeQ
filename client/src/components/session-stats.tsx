import { Clock, TrendingUp, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";

interface SessionStatsProps {
  sessionTime: number;
  averageAttention: number;
  longestStreak: number;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function formatStreak(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

export function SessionStats({ sessionTime, averageAttention, longestStreak }: SessionStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-3 w-full max-w-md" data-testid="session-stats">
      <Card className="flex flex-col items-center gap-2 p-4">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <span className="text-lg font-semibold tabular-nums" data-testid="text-session-time">
          {formatTime(sessionTime)}
        </span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
          Session
        </span>
      </Card>
      <Card className="flex flex-col items-center gap-2 p-4">
        <TrendingUp className="w-4 h-4 text-muted-foreground" />
        <span className="text-lg font-semibold tabular-nums" data-testid="text-avg-attention">
          {Math.round(averageAttention)}%
        </span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
          Average
        </span>
      </Card>
      <Card className="flex flex-col items-center gap-2 p-4">
        <Zap className="w-4 h-4 text-muted-foreground" />
        <span className="text-lg font-semibold tabular-nums" data-testid="text-longest-streak">
          {formatStreak(longestStreak)}
        </span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
          Best Streak
        </span>
      </Card>
    </div>
  );
}
