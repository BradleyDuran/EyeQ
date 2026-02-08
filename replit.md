# EyeQ - Real-time Attention Tracking

## Overview
EyeQ is a browser-based attention tracking application that uses the webcam and computer vision (MediaPipe Face Mesh via TensorFlow.js) to estimate user attention in real time. All processing happens client-side — no video data is stored or uploaded.

## Architecture
- **Frontend-only logic**: Camera, face detection, scoring, and UI all run in the browser
- **Backend**: Express server that serves the React frontend (no API routes needed)
- **No database**: Attention values are only stored in memory during the session

## Key Files
- `client/src/pages/home.tsx` - Main page with all state management
- `client/src/hooks/use-camera.ts` - Webcam access hook
- `client/src/hooks/use-face-detection.ts` - TensorFlow.js / MediaPipe Face Mesh detection (200ms interval)
- `client/src/lib/attention-scoring.ts` - Score computation (0-100) with focus modes
- `client/src/components/webcam-preview.tsx` - Large webcam feed with overlaid score + feedback
- `client/src/components/session-stats.tsx` - Session time, average, streak
- `client/src/components/mode-selector.tsx` - Screen / Reading mode toggle

## Focus Modes
1. **Screen Mode** (default): For laptop/monitor work. Looking at screen = high attention, looking down/away = low.
2. **Reading Mode**: For book/notebook work. Looking down is acceptable. Penalizes face disappearing, eyes closed, head turned sideways.

## Attention Algorithm
Updated every 200ms with continuous scoring:
- Face detection: 200ms interval via MediaPipe Face Mesh
- Score computation: 200ms tick using raw yaw, pitch, gaze deviation values
- Instant drop to 0 when face not detected
- Continuous scoring with gradual falloff based on head rotation and gaze deviation
- Faster animation decay for score drops (0.35 lerp) vs increases (0.25 lerp)

### Screen Mode Scoring
- +40 for face detected
- +20 for head forward (gradual: full at <10° yaw, linear decay to 20°)
- +10 for not looking down (gradual based on pitch)
- +30 for eyes on screen (gradual: full at <0.15 gaze deviation, linear decay to 0.4)

### Reading Mode Scoring
- +40 for face detected
- +25 for head forward (gradual: full at <15° yaw, linear decay to 30°)
- +25 for eyes open
- +10 for head in reading position (pitch between -40° and +10°)

## Color Scale
- Green: 80-100 (Focused)
- Yellow: 40-79 (Distracted)
- Red: 0-39 (Not present)

## Refocus Alert
Appears when attention stays below 40 for 5+ seconds.

## Tech Stack
- React + TypeScript + Vite
- TailwindCSS with shadcn/ui components
- TensorFlow.js + MediaPipe Face Mesh
- Dark mode by default
