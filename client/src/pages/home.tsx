import { useState, useEffect, useRef, useCallback } from "react";
import { useCamera } from "@/hooks/use-camera";
import { useFaceDetection } from "@/hooks/use-face-detection";
import { computeAttentionScore } from "@/lib/attention-scoring";
import { AttentionMeter } from "@/components/attention-meter";
import { WebcamPreview } from "@/components/webcam-preview";
import { SessionStats } from "@/components/session-stats";
import { AttentionFeedback } from "@/components/attention-feedback";
import { Button } from "@/components/ui/button";
import { Camera, CameraOff, Loader2, Eye } from "lucide-react";

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

  const scoreHistoryRef = useRef<number[]>([]);
  const currentStreakRef = useRef(0);
  const lowScoreTimerRef = useRef(0);
  const sessionStartRef = useRef<number | null>(null);

  useEffect(() => {
    startCamera();
  }, [startCamera]);

  const latestAnalysisRef = useRef(analysis);
  latestAnalysisRef.current = analysis;

  useEffect(() => {
    if (!isActive || !modelLoaded) return;

    const tick = () => {
      const currentAnalysis = latestAnalysisRef.current;
      const newScore = computeAttentionScore(currentAnalysis);
      setScore(newScore);

      scoreHistoryRef.current.push(newScore);
      const sum = scoreHistoryRef.current.reduce((a, b) => a + b, 0);
      setAverageAttention(sum / scoreHistoryRef.current.length);

      if (newScore >= 80) {
        currentStreakRef.current += 0.5;
        setLongestStreak((prev) => Math.max(prev, Math.round(currentStreakRef.current)));
      } else {
        currentStreakRef.current = 0;
      }

      if (newScore < 40) {
        lowScoreTimerRef.current += 0.5;
        if (lowScoreTimerRef.current >= 5) {
          setShowRefocusAlert(true);
        }
      } else {
        lowScoreTimerRef.current = 0;
        setShowRefocusAlert(false);
      }
    };

    tick();
    const interval = setInterval(tick, 500);
    return () => clearInterval(interval);
  }, [isActive, modelLoaded]);

  useEffect(() => {
    const target = score;
    const step = () => {
      setAnimatedScore((prev) => {
        const diff = target - prev;
        if (Math.abs(diff) < 0.5) return target;
        return prev + diff * 0.15;
      });
    };
    const id = requestAnimationFrame(function animate() {
      step();
      requestAnimationFrame(animate);
    });
    return () => cancelAnimationFrame(id);
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
    } else {
      startCamera();
    }
  }, [isActive, startCamera, stopCamera]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8 gap-6">
      <header className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-2">
          <Eye className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-app-title">EyeQ</h1>
        </div>
        <p className="text-xs text-muted-foreground">
          Real-time attention tracking
        </p>
      </header>

      {(status === "denied" || status === "error") && (
        <div className="flex flex-col items-center gap-3 max-w-sm text-center">
          <CameraOff className="w-10 h-10 text-red-400" />
          <p className="text-sm text-muted-foreground" data-testid="text-camera-error">{error}</p>
          <Button onClick={startCamera} data-testid="button-retry-camera">
            Try again
          </Button>
        </div>
      )}

      {status === "requesting" && (
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
          <p className="text-sm text-muted-foreground" data-testid="text-camera-requesting">Requesting camera access...</p>
        </div>
      )}

      {isActive && modelLoading && (
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground" data-testid="text-model-loading">Loading face detection model...</p>
        </div>
      )}

      {isActive && modelLoaded && (
        <>
          <AttentionMeter score={score} animatedScore={animatedScore} />
          <AttentionFeedback score={score} showRefocusAlert={showRefocusAlert} />
          <SessionStats
            sessionTime={sessionTime}
            averageAttention={averageAttention}
            longestStreak={longestStreak}
          />
        </>
      )}

      <WebcamPreview ref={videoRef} isActive={isActive} />

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

      <p className="text-[10px] text-muted-foreground/60 max-w-xs text-center" data-testid="text-privacy-notice">
        All processing happens locally in your browser. No video data is stored or uploaded.
      </p>
    </div>
  );
}
