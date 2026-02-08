export type FocusMode = "screen" | "reading";

export interface FaceAnalysis {
  faceDetected: boolean;
  yaw: number;
  pitch: number;
  gazeDeviation: number;
  eyesOpen: boolean;
}

export const NO_FACE_ANALYSIS: FaceAnalysis = {
  faceDetected: false,
  yaw: 0,
  pitch: 0,
  gazeDeviation: 1,
  eyesOpen: false,
};

export function computeAttentionScore(analysis: FaceAnalysis, mode: FocusMode): number {
  if (!analysis.faceDetected) return 0;

  if (mode === "reading") {
    return computeReadingScore(analysis);
  }

  return computeScreenScore(analysis);
}

function computeScreenScore(a: FaceAnalysis): number {
  let score = 0;

  score += 40;

  const absYaw = Math.abs(a.yaw);
  if (absYaw < 10) score += 20;
  else if (absYaw < 20) score += 20 * (1 - (absYaw - 10) / 10);

  if (a.pitch > -15) {
    const pitchPenalty = Math.max(0, Math.min(1, (a.pitch + 15) / 30));
    score += 10 * pitchPenalty;
  }

  if (a.eyesOpen) {
    if (a.gazeDeviation < 0.15) score += 30;
    else if (a.gazeDeviation < 0.4) score += 30 * (1 - (a.gazeDeviation - 0.15) / 0.25);
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

function computeReadingScore(a: FaceAnalysis): number {
  let score = 0;

  score += 40;

  const absYaw = Math.abs(a.yaw);
  if (absYaw < 15) score += 25;
  else if (absYaw < 30) score += 25 * (1 - (absYaw - 15) / 15);

  if (a.eyesOpen) {
    score += 25;
  }

  if (a.pitch > -40 && a.pitch < 10) {
    score += 10;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function getAttentionLabel(score: number): string {
  if (score >= 80) return "Focused";
  if (score >= 40) return "Distracted";
  return "Not present";
}

export function getAttentionColor(score: number): string {
  if (score >= 80) return "#22c55e";
  if (score >= 40) return "#eab308";
  return "#ef4444";
}
