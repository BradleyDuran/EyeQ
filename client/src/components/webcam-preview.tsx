import { forwardRef } from "react";
import { getAttentionColor, getAttentionLabel, type FaceAnalysis } from "@/lib/attention-scoring";
import { Eye, AlertTriangle, XCircle } from "lucide-react";

interface WebcamPreviewProps {
  isActive: boolean;
  score: number;
  animatedScore: number;
  showRefocusAlert: boolean;
  analysis: FaceAnalysis;
  showDebug: boolean;
}

export const WebcamPreview = forwardRef<HTMLVideoElement, WebcamPreviewProps>(
  ({ isActive, score, animatedScore, showRefocusAlert, analysis, showDebug }, ref) => {
    const color = getAttentionColor(score);
    const label = getAttentionLabel(score);
    const displayScore = Number.isFinite(animatedScore) ? Math.round(animatedScore) : 0;
    const Icon = score >= 80 ? Eye : score >= 40 ? AlertTriangle : XCircle;

    return (
      <div
        className="relative overflow-hidden rounded-md border border-border/30 w-full"
        style={{ maxWidth: 640, aspectRatio: "4 / 3" }}
        data-testid="webcam-preview"
      >
        <video
          ref={ref}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{
            transform: "scaleX(-1)",
            visibility: isActive ? "visible" : "hidden",
          }}
        />

        {!isActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-card">
            <span className="text-sm text-muted-foreground" data-testid="text-camera-off">Camera off</span>
          </div>
        )}

        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <div
            className={`w-2 h-2 rounded-full ${isActive ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
          />
          <span className="text-[10px] text-white/80 font-medium uppercase tracking-wider" data-testid="text-camera-status">
            {isActive ? "Live" : "Off"}
          </span>
        </div>

        {isActive && (
          <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-md"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.6)",
                backdropFilter: "blur(8px)",
              }}
            >
              <span
                className="text-3xl font-bold tabular-nums"
                style={{ color }}
                data-testid="text-attention-score"
              >
                {displayScore}
              </span>
              <span className="text-xs text-white/50">%</span>
            </div>

            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                backdropFilter: "blur(8px)",
              }}
              data-testid="attention-feedback"
            >
              <Icon className="w-3 h-3" style={{ color }} />
              <span
                className="text-[10px] font-semibold uppercase tracking-wider"
                style={{ color }}
                data-testid="text-attention-label"
              >
                {label}
              </span>
            </div>
          </div>
        )}

        {isActive && showDebug && (
          <div
            className="absolute bottom-3 left-3 flex flex-col gap-0.5 px-2.5 py-2 rounded-md text-[10px] font-mono leading-tight"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              backdropFilter: "blur(8px)",
              color: "rgba(255, 255, 255, 0.9)",
            }}
            data-testid="debug-overlay"
          >
            <span>
              Face:{" "}
              <span style={{ color: analysis.faceDetected ? "#22c55e" : "#ef4444" }}>
                {analysis.faceDetected ? "YES" : "NO"}
              </span>
            </span>
            <span>
              Eyes:{" "}
              <span style={{ color: analysis.eyesOpen ? "#22c55e" : "#ef4444" }}>
                {analysis.eyesOpen ? "OPEN" : "CLOSED"}
              </span>
            </span>
            <span>
              Pitch: <span style={{ color: "#93c5fd" }}>{analysis.pitch.toFixed(1)}</span>
            </span>
            <span>
              Yaw: <span style={{ color: "#93c5fd" }}>{analysis.yaw.toFixed(1)}</span>
            </span>
            <span>
              Phone:{" "}
              <span style={{ color: analysis.phoneDetected ? "#ef4444" : "#22c55e" }}>
                {analysis.phoneDetected ? "DETECTED" : "NONE"}
              </span>
            </span>
            <span>
              Score: <span style={{ color }}>{score}</span>
            </span>
          </div>
        )}

        {showRefocusAlert && (
          <div
            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-md animate-pulse"
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.2)",
              border: "1px solid rgba(239, 68, 68, 0.5)",
              backdropFilter: "blur(8px)",
            }}
            data-testid="refocus-alert"
          >
            <Eye className="w-4 h-4 text-red-400" />
            <span className="text-sm font-bold text-red-400">Refocus</span>
          </div>
        )}
      </div>
    );
  }
);

WebcamPreview.displayName = "WebcamPreview";
