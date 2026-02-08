import { useEffect, useRef } from "react";
import { getAttentionColor } from "@/lib/attention-scoring";

interface AttentionMeterProps {
  score: number;
  animatedScore: number;
}

export function AttentionMeter({ score, animatedScore }: AttentionMeterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const displayScore = Math.round(animatedScore);
  const color = getAttentionColor(score);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = 280;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = 120;
    const lineWidth = 12;

    ctx.clearRect(0, 0, size, size);

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.stroke();

    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (Math.PI * 2 * (animatedScore / 100));

    if (animatedScore > 0) {
      const gradient = ctx.createConicGradient(startAngle, centerX, centerY);
      const fillRatio = animatedScore / 100;

      gradient.addColorStop(0, color);
      gradient.addColorStop(Math.min(fillRatio, 0.99), color);
      gradient.addColorStop(Math.min(fillRatio + 0.01, 1), "transparent");
      gradient.addColorStop(1, "transparent");

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.shadowColor = color;
      ctx.shadowBlur = 20;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }, [animatedScore, color, score]);

  return (
    <div className="relative flex items-center justify-center" data-testid="attention-meter">
      <canvas ref={canvasRef} className="absolute" />
      <div className="flex flex-col items-center justify-center z-10" style={{ width: 280, height: 280 }}>
        <span
          className="text-6xl font-bold tabular-nums transition-colors duration-300"
          style={{ color }}
          data-testid="text-attention-score"
        >
          {displayScore}
        </span>
        <span className="text-sm text-muted-foreground mt-1 uppercase tracking-widest">
          Attention
        </span>
      </div>
    </div>
  );
}
