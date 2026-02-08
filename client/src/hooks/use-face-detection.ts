import { useState, useEffect, useRef, useCallback } from "react";
import { type FaceAnalysis, NO_FACE_ANALYSIS } from "@/lib/attention-scoring";

interface FaceMeshKeypoints {
  noseTip: [number, number, number];
  foreheadTop: [number, number, number];
  chin: [number, number, number];
  leftEar: [number, number, number];
  rightEar: [number, number, number];
  leftEyeInner: [number, number, number];
  rightEyeInner: [number, number, number];
  leftEyeOuter: [number, number, number];
  rightEyeOuter: [number, number, number];
  leftIris: [number, number, number];
  rightIris: [number, number, number];
  leftEyeUpper: [number, number, number];
  leftEyeLower: [number, number, number];
  rightEyeUpper: [number, number, number];
  rightEyeLower: [number, number, number];
}

const KEYPOINT_INDICES = {
  noseTip: 1,
  foreheadTop: 10,
  chin: 152,
  leftEar: 234,
  rightEar: 454,
  leftEyeInner: 133,
  rightEyeInner: 362,
  leftEyeOuter: 33,
  rightEyeOuter: 263,
  leftIris: 468,
  rightIris: 473,
  leftEyeUpper: 159,
  leftEyeLower: 145,
  rightEyeUpper: 386,
  rightEyeLower: 374,
};

function getKeypointXYZ(keypoints: any[], index: number): [number, number, number] {
  const kp = keypoints[index];
  if (!kp) return [0, 0, 0];
  return [kp.x, kp.y, kp.z || 0];
}

function analyzeKeypoints(keypoints: any[]): Omit<FaceAnalysis, "phoneDetected"> {
  if (!keypoints || keypoints.length < 468) {
    return {
      faceDetected: false,
      yaw: 0,
      pitch: 0,
      gazeDeviation: 1,
      eyesOpen: false,
    };
  }

  const points: FaceMeshKeypoints = {
    noseTip: getKeypointXYZ(keypoints, KEYPOINT_INDICES.noseTip),
    foreheadTop: getKeypointXYZ(keypoints, KEYPOINT_INDICES.foreheadTop),
    chin: getKeypointXYZ(keypoints, KEYPOINT_INDICES.chin),
    leftEar: getKeypointXYZ(keypoints, KEYPOINT_INDICES.leftEar),
    rightEar: getKeypointXYZ(keypoints, KEYPOINT_INDICES.rightEar),
    leftEyeInner: getKeypointXYZ(keypoints, KEYPOINT_INDICES.leftEyeInner),
    rightEyeInner: getKeypointXYZ(keypoints, KEYPOINT_INDICES.rightEyeInner),
    leftEyeOuter: getKeypointXYZ(keypoints, KEYPOINT_INDICES.leftEyeOuter),
    rightEyeOuter: getKeypointXYZ(keypoints, KEYPOINT_INDICES.rightEyeOuter),
    leftIris: getKeypointXYZ(keypoints, KEYPOINT_INDICES.leftIris),
    rightIris: getKeypointXYZ(keypoints, KEYPOINT_INDICES.rightIris),
    leftEyeUpper: getKeypointXYZ(keypoints, KEYPOINT_INDICES.leftEyeUpper),
    leftEyeLower: getKeypointXYZ(keypoints, KEYPOINT_INDICES.leftEyeLower),
    rightEyeUpper: getKeypointXYZ(keypoints, KEYPOINT_INDICES.rightEyeUpper),
    rightEyeLower: getKeypointXYZ(keypoints, KEYPOINT_INDICES.rightEyeLower),
  };

  const yaw = computeYaw(points);
  const pitch = computePitch(points);
  const hasIris = keypoints.length >= 478;
  const gazeDeviation = computeGazeDeviation(points, hasIris);
  const eyesOpen = computeEyesOpen(points);

  return {
    faceDetected: true,
    yaw,
    pitch,
    gazeDeviation,
    eyesOpen,
  };
}

function computeYaw(points: FaceMeshKeypoints): number {
  const leftDist = Math.abs(points.noseTip[0] - points.leftEar[0]);
  const rightDist = Math.abs(points.noseTip[0] - points.rightEar[0]);
  const totalDist = leftDist + rightDist;
  if (totalDist === 0) return 0;
  const ratio = (rightDist - leftDist) / totalDist;
  return ratio * 90;
}

function computePitch(points: FaceMeshKeypoints): number {
  const faceHeight = Math.abs(points.foreheadTop[1] - points.chin[1]);
  if (faceHeight === 0) return 0;
  const noseRelative = (points.noseTip[1] - points.foreheadTop[1]) / faceHeight;
  const deviation = noseRelative - 0.45;
  return deviation * -90;
}

function computeEyesOpen(points: FaceMeshKeypoints): boolean {
  const leftHeight = Math.abs(points.leftEyeUpper[1] - points.leftEyeLower[1]);
  const rightHeight = Math.abs(points.rightEyeUpper[1] - points.rightEyeLower[1]);
  const leftWidth = Math.abs(points.leftEyeOuter[0] - points.leftEyeInner[0]);
  const rightWidth = Math.abs(points.rightEyeOuter[0] - points.rightEyeInner[0]);

  if (leftWidth === 0 || rightWidth === 0) return false;

  const leftRatio = leftHeight / leftWidth;
  const rightRatio = rightHeight / rightWidth;
  const avgRatio = (leftRatio + rightRatio) / 2;

  return avgRatio > 0.15;
}

function computeGazeDeviation(points: FaceMeshKeypoints, hasIris: boolean): number {
  if (!hasIris) return 0.1;

  const leftEyeWidth = Math.abs(points.leftEyeOuter[0] - points.leftEyeInner[0]);
  const rightEyeWidth = Math.abs(points.rightEyeOuter[0] - points.rightEyeInner[0]);

  if (leftEyeWidth === 0 || rightEyeWidth === 0) return 0.5;

  const leftEyeCenterX = (points.leftEyeOuter[0] + points.leftEyeInner[0]) / 2;
  const rightEyeCenterX = (points.rightEyeOuter[0] + points.rightEyeInner[0]) / 2;

  const leftIrisOffsetX = Math.abs(points.leftIris[0] - leftEyeCenterX) / leftEyeWidth;
  const rightIrisOffsetX = Math.abs(points.rightIris[0] - rightEyeCenterX) / rightEyeWidth;

  const leftEyeHeight = Math.abs(points.leftEyeUpper[1] - points.leftEyeLower[1]);
  const rightEyeHeight = Math.abs(points.rightEyeUpper[1] - points.rightEyeLower[1]);

  const leftEyeCenterY = (points.leftEyeUpper[1] + points.leftEyeLower[1]) / 2;
  const rightEyeCenterY = (points.rightEyeUpper[1] + points.rightEyeLower[1]) / 2;

  let leftIrisOffsetY = 0;
  let rightIrisOffsetY = 0;
  if (leftEyeHeight > 0) {
    leftIrisOffsetY = Math.abs(points.leftIris[1] - leftEyeCenterY) / leftEyeHeight;
  }
  if (rightEyeHeight > 0) {
    rightIrisOffsetY = Math.abs(points.rightIris[1] - rightEyeCenterY) / rightEyeHeight;
  }

  const avgOffsetX = (leftIrisOffsetX + rightIrisOffsetX) / 2;
  const avgOffsetY = (leftIrisOffsetY + rightIrisOffsetY) / 2;

  return Math.sqrt(avgOffsetX * avgOffsetX + avgOffsetY * avgOffsetY);
}

const DETECTION_INTERVAL_MS = 200;
const PHONE_DETECTION_INTERVAL_MS = 500;

export function useFaceDetection(videoRef: React.RefObject<HTMLVideoElement | null>, isActive: boolean) {
  const [analysis, setAnalysis] = useState<FaceAnalysis>(NO_FACE_ANALYSIS);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const detectorRef = useRef<any>(null);
  const objectDetectorRef = useRef<any>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phoneIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);
  const phoneDetectedRef = useRef(false);

  const loadModel = useCallback(async () => {
    if (detectorRef.current || modelLoading) return;
    setModelLoading(true);

    try {
      const faceLandmarksDetection = await import("@tensorflow-models/face-landmarks-detection");
      await import("@tensorflow/tfjs");
      const mediapipeFaceMesh = await import("@mediapipe/face_mesh");

      const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
      const detector = await faceLandmarksDetection.createDetector(model, {
        runtime: "mediapipe" as const,
        solutionPath: `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@${mediapipeFaceMesh.VERSION}`,
        refineLandmarks: true,
        maxFaces: 1,
      });

      if (mountedRef.current) {
        detectorRef.current = detector;
      }

      try {
        const cocoSsd = await import("@tensorflow-models/coco-ssd");
        const objModel = await cocoSsd.load({
          base: "lite_mobilenet_v2",
        });
        if (mountedRef.current) {
          objectDetectorRef.current = objModel;
        }
      } catch (err) {
        console.warn("Phone detection model failed to load:", err);
      }

      if (mountedRef.current) {
        setModelLoaded(true);
      }
    } catch (err) {
      console.error("Failed to load face detection model:", err);
    } finally {
      if (mountedRef.current) {
        setModelLoading(false);
      }
    }
  }, [modelLoading]);

  const detectFace = useCallback(async () => {
    if (!detectorRef.current || !videoRef.current) return;

    const video = videoRef.current;
    if (video.readyState < 2 || video.videoWidth === 0) return;

    try {
      const faces = await detectorRef.current.estimateFaces(video, {
        flipHorizontal: false,
      });

      if (!mountedRef.current) return;

      if (faces && faces.length > 0) {
        const faceResult = analyzeKeypoints(faces[0].keypoints);
        setAnalysis({
          ...faceResult,
          phoneDetected: phoneDetectedRef.current,
        });
      } else {
        setAnalysis({
          ...NO_FACE_ANALYSIS,
          phoneDetected: phoneDetectedRef.current,
        });
      }
    } catch {
    }
  }, [videoRef]);

  const detectPhone = useCallback(async () => {
    if (!objectDetectorRef.current || !videoRef.current) return;

    const video = videoRef.current;
    if (video.readyState < 2 || video.videoWidth === 0) return;

    try {
      const predictions = await objectDetectorRef.current.detect(video, 10, 0.3);

      if (!mountedRef.current) return;

      const hasPhone = predictions.some(
        (p: any) => p.class === "cell phone" && p.score > 0.3
      );
      phoneDetectedRef.current = hasPhone;
    } catch {
    }
  }, [videoRef]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (isActive && !detectorRef.current && !modelLoading) {
      loadModel();
    }
  }, [isActive, loadModel, modelLoading]);

  useEffect(() => {
    if (isActive && modelLoaded) {
      intervalRef.current = setInterval(detectFace, DETECTION_INTERVAL_MS);
      phoneIntervalRef.current = setInterval(detectPhone, PHONE_DETECTION_INTERVAL_MS);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (phoneIntervalRef.current) {
        clearInterval(phoneIntervalRef.current);
        phoneIntervalRef.current = null;
      }
    };
  }, [isActive, modelLoaded, detectFace, detectPhone]);

  return { analysis, modelLoaded, modelLoading };
}
