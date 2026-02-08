# EyeQ

## Overview

EyeQ is a browser-based attention tracking app that uses your webcam to estimate how focused you are in real time.

## What it does

EyeQ watches your face through the webcam and calculates an attention score from **0 to 100**, updated every **200 milliseconds**.

The score is based on:
- Whether your face is visible
- If your eyes are open
- Head direction (yaw and pitch)
- Eye gaze direction

## Focus Modes

### Screen Mode
Designed for working on a laptop or monitor.
- Looking at the screen scores high
- Looking away or down scores low

### Reading Mode
Designed for reading a book or notebook.
- Looking down is expected and allowed
- Penalizes:
  - Eyes closing too long
  - Head turning sideways
  - Face disappearing from frame

## Phone Detection

If a **cell phone is detected in the camera frame**, the attention score immediately drops to **0** in **both modes**.

## On-Screen Features

- Large live webcam feed
- Real-time attention score with color labels:
  - Green = Focused
  - Yellow = Distracted
  - Red = Not present
- Session statistics:
  - Total session time
  - Average attention score
  - Current focus streak
- Refocus alert if attention stays low for more than 5 seconds
- Optional debug overlay (bug icon) showing:
  - Face detection status
  - Eye detection status
  - Head angles
  - Phone detection
  - Raw attention score

## Privacy

All processing happens **entirely in the browser**.

- No video is stored
- No video is uploaded
- No data is sent anywhere

The backend only serves the web page.  
All computer vision runs locally on your device.

## Tech Stack

- React
- TensorFlow.js
- MediaPipe Face Mesh
- COCO-SSD (for phone detection)
- WebRTC
- Tailwind CSS

## Run Locally

```bash
npm install
npm run dev
