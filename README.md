# ✋ Gestura-Edu: Equal Voices, Different Languages

A real-time gesture recognition system using hand landmarks and Dynamic Time Warping (DTW). Lightweight and efficient — no deep learning models required. Define gestures on-the-fly and link them to commands for intuitive interaction.

---

## 📘 Table of Contents
1. [Introduction](#1-introduction)  
2. [System Requirements](#2-system-requirements)  
3. [Installation and Running Instructions](#3-installation-and-running-instructions)  
4. [Gesture Matching Algorithm](#4-gesture-matching-algorithm)  
5. [Complexity Analysis](#5-complexity-analysis)  
6. [Conclusion](#6-conclusion)  
7. [Future Improvements](#7-future-improvements)  

---

## 1. Introduction

This system provides a **real-time gesture recognition interface** using **MediaPipe hand landmarks** and **FastDTW**. It is:
- Lightweight and efficient (no deep learning model required)
- Customizable with on-the-fly gesture recording
- Ideal for hands-free desktop interactions or educational applications

---

## 2. System Requirements

### 🧑‍💻 Software

- Python 3.x

### 🧩 Python Libraries

| Library | Version | Description |
|--------|---------|-------------|
| `mediapipe` | 0.10.21 | Hand gesture detection & tracking |
| `numpy` | 1.26.4 | Numerical operations |
| `opencv-contrib-python` | 4.11.0.86 | Image & video processing |
| `fastdtw` | 0.3.4 | Fast Dynamic Time Warping |
| `scipy` | 1.15.2 | Scientific computation |
| `matplotlib` | 3.10.1 | Debugging & visualization |
| `jsonschema` | 4.23.0 | JSON format validation |
| `pillow` | 11.1.0 | Image handling |
| `customtkinter` | 5.2.2 | GUI components |
| `PyAutoGUI` | 0.9.54 | Mouse & keyboard simulation |
| `fastapi` | 0.115.11 | Backend API server |
| `requests` | 2.32.3 | HTTP request handler |
| `python-dotenv` | 1.0.1 | Environment variable management |

### 🖥️ Hardware

- CPU (GPU optional)
- Webcam (for real-time input)

---

## 3. Installation and Running Instructions

### 3.1 Directory Structure

gesture-edu/  
├── assets/  
│ └── gesturalogo.png  
├── backend/  
│ ├── gestures.json  
│ ├── lessons.py  
│ ├── lessons_endpoint.py  
│ ├── main.py  
│ ├── secret.env  
│ └── venv/  
├── index.html  
├── playground.html  
├── predictor.html  
├── scripts.js  
├── styles.css  
├── .gitignore  
└── README.md  


### 3.2 Backend Setup

```bash
cd your/extracted/location/gesture_edu
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3.3 Run the Backend Server
```bash
cd backend
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 3.4 Launch the Web Frontend
Open index.html in your browser to access the user interface.

## 4. Gesture Matching Algorithm

### 4.1 Dynamic Time Warping (DTW)

- Compares similarity between two time-series sequences.
- FastDTW reduces complexity from **O(N²)** to **O(N)**.
- Ideal for real-time applications.

### 4.2 Matching Stages

Gesture progression:
- Start → Mid1 → Mid2 → End
- System uses a timeout mechanism to reset the sequence if the user pauses too long.

### 4.3 DTW vs. CNN Comparison

| Metric               | Gesture Detection (DTW)     | CNN (Deep Learning)         |
|----------------------|-----------------------------|------------------------------|
| **Training**         | No training needed          | Requires labeled dataset     |
| **Real-Time**        | Yes                         | Slower without GPU           |
| **Accuracy**         | Moderate                    | High                         |
| **Time Complexity**  | O(G × N × M)                | O(C × D × F)                 |
| **Space Complexity** | O(G × N × 3)                | High                         |
| **Speed**            | Fast                        | Slower                       |
| **Scalability**      | Very scalable               | Limited by model size        |
| **Hardware**         | Low requirements            | GPU required                 |
| **Flexibility**      | High (record anytime)       | Low (requires retraining)    |
| **Error Rate**       | Higher                      | Lower                        |
| **Ease of Use**      | Simple setup                | Complex ML pipeline          |

---

## 5. Complexity Analysis

### 5.1 Time Complexity

 - O(G × N × M)
 - G = number of predefined gestures
 - N = keypoints per frame (typically 2 × 11 = 22)
 - M = number of recorded frames (typically 4)


### 5.2 Space Complexity

 - O(G × N × 3)
 - G = number of gestures
 - N = number of keypoints per gesture
 - 3D = (x, y, z) per keypoint

---

## 6. Conclusion

This gesture detection system offers a powerful, real-time, and low-resource solution for intuitive control and educational use cases. Its dynamic nature allows gesture definitions at runtime, making it extremely flexible and user-friendly without deep learning overhead.

---

## 7. Future Improvements

- 🔧 **Gesture refinement**  
  Increase the number of keypoints or consider temporal smoothing for better accuracy.

- 🧠 **Support complex gestures**  
  Add multi-pose gestures, hand-pose + face-expression combinations.

- 🧭 **Angle & position invariance**  
  Improve normalization to support gestures at different hand orientations.

---

## 📬 Feedback

Have suggestions or found a bug? Please open an [Issue](mailto:abhishekkcrs@gmail.com) or submit a pull request.

---
