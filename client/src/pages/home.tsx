import { useState, useEffect, useRef, useCallback } from "react";
import { useCamera } from "@/hooks/use-camera";
import { useFaceDetection } from "@/hooks/use-face-detection";
import { computeAttentionScore, type FocusMode } from "@/lib/attention-scoring";
import { WebcamPreview } from "@/components/webcam-preview";
import { SessionStats } from "@/components/session-stats";
import { ModeSelector } from "@/components/mode-selector";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff, Loader2, Eye, Bug } from "lucide-react";

const TICK_MS = 200;

export default function Home() {
  const { videoRef, status, error, startCamera, stopCamera } = useCamera();
  const isActive = status === "active";
  const { analysis, modelLoaded, modelLoading } = useFaceDetection(videoRef, isActive);

  const [score, setScore] = useState(0);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [averageAttention, setAverageAttention] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [showRefocusAlert, setShowRefocusAlert] = useState(false);
  const [focusMode, setFocusMode] = useState<FocusMode>("screen");
  const [showDebug, setShowDebug] = useState(false);

  const scoreHistoryRef = useRef<number[]>([]);
  const currentStreakRef = useRef(0);
  const lowScoreTimerRef = useRef(0);
  const eyesClosedTimerRef = useRef(0);
  const sessionStartRef = useRef<number | null>(null);
  const latestAnalysisRef = useRef(analysis);
  latestAnalysisRef.current = analysis;
  const focusModeRef = useRef(focusMode);
  focusModeRef.current = focusMode;

  useEffect(() => {
    startCamera();
  }, [startCamera]);

  useEffect(() => {
    if (!isActive || !modelLoaded) return;

    const tickInterval = TICK_MS / 1000;

    const tick = () => {
      const currentAnalysis = latestAnalysisRef.current;

      if (!currentAnalysis.eyesOpen && currentAnalysis.faceDetected) {
        eyesClosedTimerRef.current += tickInterval;
      } else {
        eyesClosedTimerRef.current = 0;
      }

      const newScore = computeAttentionScore(
        currentAnalysis,
        focusModeRef.current,
        eyesClosedTimerRef.current
      );
      setScore(newScore);

      scoreHistoryRef.current.push(newScore);
      const sum = scoreHistoryRef.current.reduce((a, b) => a + b, 0);
      setAverageAttention(sum / scoreHistoryRef.current.length);

      if (newScore >= 80) {
        currentStreakRef.current += tickInterval;
        setLongestStreak((prev) => Math.max(prev, Math.round(currentStreakRef.current)));
      } else {
        currentStreakRef.current = 0;
      }

      if (newScore < 40) {
        lowScoreTimerRef.current += tickInterval;
        if (lowScoreTimerRef.current >= 5) {
          setShowRefocusAlert(true);
        }
      } else {
        lowScoreTimerRef.current = 0;
        setShowRefocusAlert(false);
      }
    };

    tick();
    const interval = setInterval(tick, TICK_MS);
    return () => clearInterval(interval);
  }, [isActive, modelLoaded]);

  useEffect(() => {
    setAnimatedScore(score);
  }, [score]);

  useEffect(() => {
    if (!isActive) {
      sessionStartRef.current = null;
      return;
    }

    sessionStartRef.current = Date.now();
    const interval = setInterval(() => {
      if (sessionStartRef.current) {
        setSessionTime(Math.floor((Date.now() - sessionStartRef.current) / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  const handleToggle = useCallback(() => {
    if (isActive) {
      stopCamera();
      setScore(0);
      setAnimatedScore(0);
      setSessionTime(0);
      setAverageAttention(0);
      setLongestStreak(0);
      setShowRefocusAlert(false);
      scoreHistoryRef.current = [];
      currentStreakRef.current = 0;
      lowScoreTimerRef.current = 0;
      eyesClosedTimerRef.current = 0;
    } else {
      startCamera();
    }
  }, [isActive, startCamera, stopCamera]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-4 py-6 gap-4">
      <header className="flex items-center justify-between gap-2 w-full max-w-[640px]">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold tracking-tight" data-testid="text-app-title">EyeQ</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant={showDebug ? "secondary" : "ghost"}
            onClick={() => setShowDebug((d) => !d)}
            className="toggle-elevate"
            data-testid="button-toggle-debug"
          >
            <Bug className="w-4 h-4" />
          </Button>
          <ModeSelector mode={focusMode} onModeChange={setFocusMode} />
        </div>
      </header>

      {(status === "denied" || status === "error") && (
        <div className="flex flex-col items-center gap-3 max-w-sm text-center py-12">
          <CameraOff className="w-10 h-10 text-red-400" />
          <p className="text-sm text-muted-foreground" data-testid="text-camera-error">{error}</p>
          <Button onClick={startCamera} data-testid="button-retry-camera">
            Try again
          </Button>
        </div>
      )}

      {status === "requesting" && (
        <div className="flex flex-col items-center gap-3 py-12">
          <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
          <p className="text-sm text-muted-foreground" data-testid="text-camera-requesting">Requesting camera access...</p>
        </div>
      )}

      {isActive && modelLoading && (
        <div className="flex flex-col items-center gap-3 py-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground" data-testid="text-model-loading">Loading face detection model...</p>
        </div>
      )}

      <WebcamPreview
        ref={videoRef}
        isActive={isActive}
        score={score}
        animatedScore={animatedScore}
        showRefocusAlert={showRefocusAlert}
        analysis={analysis}
        showDebug={showDebug}
      />

      {isActive && modelLoaded && (
        <SessionStats
          sessionTime={sessionTime}
          averageAttention={averageAttention}
          longestStreak={longestStreak}
        />
      )}

      <div className="flex items-center gap-3">
        {(isActive || status === "idle") && (
          <Button
            variant={isActive ? "secondary" : "default"}
            onClick={handleToggle}
            data-testid="button-toggle-session"
          >
            {isActive ? (
              <>
                <CameraOff className="w-4 h-4 mr-2" />
                End Session
              </>
            ) : (
              <>
                <Camera className="w-4 h-4 mr-2" />
                Start Session
              </>
            )}
          </Button>
        )}
      </div>

      <p className="text-[10px] text-muted-foreground/60 max-w-xs text-center" data-testid="text-privacy-notice">
        All processing happens locally in your browser. No video data is stored or uploaded.
      </p>
    </div>
  );
}
