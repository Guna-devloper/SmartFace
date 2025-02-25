import React, { useEffect, useRef, useState } from "react";
import { FaceDetection } from "@mediapipe/face_detection";
import { Camera } from "@mediapipe/camera_utils";
import { db } from "../firebase";
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button, Card, Container } from "react-bootstrap";
import "./AttendanceReport.css";

const AttendanceReport = () => {
  const videoRef = useRef(null);
  const cameraRef = useRef(null);
  const isProcessing = useRef(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [rollNo, setRollNo] = useState(""); // Store User Roll Number
  const [faceDetected, setFaceDetected] = useState(false); // Track Face Detection

  useEffect(() => {
    if (!cameraOn || !rollNo) return;

    const faceDetection = new FaceDetection({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`,
    });

    faceDetection.setOptions({
      model: "short",
      minDetectionConfidence: 0.7,
    });

    faceDetection.onResults(async (results) => {
      if (results.detections.length > 0) {
        setFaceDetected(true);

        if (!isProcessing.current) {
          isProcessing.current = true;
          console.log("📸 Face Detected: Checking Attendance...");

          // ✅ Check Firestore for Roll Number & Validate Face Data
          const isUserValid = await verifyUser(rollNo, results.detections);
          if (isUserValid) {
            toast.success("✅ Attendance Verified: Marked Present!", {
              autoClose: 3000,
            });
            await markAttendance(rollNo, "Present");
          } else {
            toast.error("❌ Face or Roll No Not Verified: Marked Absent!", {
              autoClose: 3000,
            });
            await markAttendance(rollNo, "Absent");
          }

          stopCamera();
        }
      } else {
        setFaceDetected(false); // ❌ No Face Detected
      }
    });

    if (videoRef.current) {
      cameraRef.current = new Camera(videoRef.current, {
        onFrame: async () => {
          if (!isProcessing.current && videoRef.current?.readyState >= 2) {
            try {
              await faceDetection.send({ image: videoRef.current });
            } catch (error) {
              console.error("Face detection error:", error);
            }
          }
        },
        width: 640,
        height: 480,
      });
      cameraRef.current.start();
    }

    return () => stopCamera();
  }, [cameraOn, rollNo]);

  // ✅ FUNCTION TO VERIFY USER (Check Roll No & Face Data)
  const verifyUser = async (rollNo, faceData) => {
    try {
      console.log("🔍 Fetching student data from Firestore...");
      const usersRef = collection(db, "students");
      const q = query(usersRef, where("rollNo", "==", rollNo));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        console.warn("⚠️ Roll Number Not Found in Database!");
        return false;
      }

      let storedFaceData = null;
      snapshot.forEach((doc) => {
        storedFaceData = doc.data().faceData;
      });

      if (!storedFaceData) {
        console.warn("❌ No Face Data Found for this Roll Number!");
        return false;
      }

      // ✅ DEBUG LOGS TO CHECK DATA
      console.log("📌 Stored Face Data:", storedFaceData);
      console.log("📸 Detected Face Data:", faceData[0].boundingBox);

      // ✅ Compare detected face with stored face data
      const detectedFace = {
        x: faceData[0].boundingBox.x,
        y: faceData[0].boundingBox.y,
        width: faceData[0].boundingBox.width,
        height: faceData[0].boundingBox.height,
      };

      const isFaceMatched = compareFaces(storedFaceData, detectedFace);

      if (isFaceMatched) {
        console.log("✅ Face Verified Successfully!");
        return true;
      }

      console.warn("❌ Face Mismatch: Verification Failed!");
      return false;
    } catch (error) {
      console.error("❌ Error verifying user:", error);
      return false;
    }
  };

  // ✅ FUNCTION TO COMPARE FACES
  const compareFaces = (storedFace, detectedFace) => {
    const margin = 0.15; // Increased margin for better flexibility

    return (
      Math.abs(storedFace.x - detectedFace.x) < margin &&
      Math.abs(storedFace.y - detectedFace.y) < margin &&
      Math.abs(storedFace.width - detectedFace.width) < margin &&
      Math.abs(storedFace.height - detectedFace.height) < margin
    );
  };

  // ✅ FUNCTION TO MARK ATTENDANCE
  const markAttendance = async (rollNo, status) => {
    try {
      await addDoc(collection(db, "attendance_reports"), {
        rollNo,
        status,
        timestamp: new Date().toISOString(),
      });

      console.log(`📌 Attendance Updated: ${rollNo} → ${status}`);
    } catch (error) {
      console.error("❌ Error marking attendance:", error);
      toast.error("❌ Error saving attendance report");
    }
  };

  // ✅ START CAMERA FUNCTION
  const startCamera = () => {
    if (!rollNo) {
      toast.error("⚠️ Please Enter Roll Number!", { autoClose: 3000 });
      return;
    }
    isProcessing.current = false;
    setCameraOn(true);
  };

  // ✅ STOP CAMERA FUNCTION
  const stopCamera = () => {
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
    }
    isProcessing.current = false;
    setCameraOn(false);
  };

  return (
    <Container className="d-flex flex-column align-items-center justify-content-center vh-100">
      <Card className="p-4 text-center shadow-lg attendance-card">
        <h3 className="mb-3">📸 Attendance Report System</h3>

        {/* ✅ ROLL NUMBER INPUT */}
        <input
          type="text"
          className="form-control mb-2"
          placeholder="Enter Roll Number"
          value={rollNo}
          onChange={(e) => setRollNo(e.target.value)}
          required
        />

        {cameraOn ? (
          <>
            <video ref={videoRef} autoPlay playsInline className="video-feed"></video>
            {faceDetected ? (
              <p className="text-success mt-2">✅ Face Detected</p>
            ) : (
              <p className="text-danger mt-2">❌ No Face Detected</p>
            )}
            <Button variant="danger" className="mt-3 stop-btn" onClick={stopCamera}>
              🚫 Stop Camera
            </Button>
          </>
        ) : (
          <Button variant="success" className="start-btn" onClick={startCamera}>
            🎥 Start Camera
          </Button>
        )}
      </Card>

      <ToastContainer position="top-right" />
    </Container>
  );
};

export default AttendanceReport;
