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
- `client/src/hooks/use-face-detection.ts` - TensorFlow.js / MediaPipe Face Mesh detection
- `client/src/lib/attention-scoring.ts` - Score computation (0-100)
- `client/src/components/attention-meter.tsx` - Circular canvas-based meter
- `client/src/components/webcam-preview.tsx` - Small live webcam feed
- `client/src/components/session-stats.tsx` - Session time, average, streak
- `client/src/components/attention-feedback.tsx` - Status label + refocus alert

## Attention Algorithm
Updated every 500ms:
- +40 if face detected
- +30 if eyes facing screen
- +20 if head facing forward
- +10 if user not looking down
- Clamped 0-100

## Color Scale
- Green: 80-100 (Focused)
- Yellow: 40-79 (Distracted)
- Red: 0-39 (Not present)

## Tech Stack
- React + TypeScript + Vite
- TailwindCSS with shadcn/ui components
- TensorFlow.js + MediaPipe Face Mesh
- Dark mode by default
