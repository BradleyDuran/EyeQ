export interface FaceAnalysis {
  faceDetected: boolean;
  eyesFacingScreen: boolean;
  headFacingForward: boolean;
  notLookingDown: boolean;
}

export function computeAttentionScore(analysis: FaceAnalysis): number {
  let score = 0;

  if (analysis.faceDetected) score += 40;
  if (analysis.eyesFacingScreen) score += 30;
  if (analysis.headFacingForward) score += 20;
  if (analysis.notLookingDown) score += 10;

  return Math.max(0, Math.min(100, score));
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

export function getAttentionColorClass(score: number): string {
  if (score >= 80) return "text-green-500";
  if (score >= 40) return "text-yellow-500";
  return "text-red-500";
}
