import { forwardRef } from "react";

interface WebcamPreviewProps {
  isActive: boolean;
}

export const WebcamPreview = forwardRef<HTMLVideoElement, WebcamPreviewProps>(
  ({ isActive }, ref) => {
    return (
      <div
        className="relative overflow-hidden rounded-md border border-border/50"
        style={{ width: 200, height: 150 }}
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
            <span className="text-xs text-muted-foreground" data-testid="text-camera-off">Camera off</span>
          </div>
        )}
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          <div
            className={`w-2 h-2 rounded-full ${isActive ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
          />
          <span className="text-[10px] text-white/70 font-medium uppercase tracking-wider" data-testid="text-camera-status">
            {isActive ? "Live" : "Off"}
          </span>
        </div>
      </div>
    );
  }
);

WebcamPreview.displayName = "WebcamPreview";
