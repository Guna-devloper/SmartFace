import React, { useEffect, useRef, useState } from "react";
import { FaceDetection } from "@mediapipe/face_detection";
import { Camera } from "@mediapipe/camera_utils";
import { db, collection, addDoc, getDocs, query } from "../firebase";
import { where } from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button, Card, Container, Spinner } from "react-bootstrap";
import "./AttendanceTracker.css";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

const AttendanceTracker = () => {
  const videoRef = useRef(null);
  const cameraRef = useRef(null);
  const isProcessing = useRef(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rollNo, setRollNo] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!cameraOn || !videoRef.current) return;

    const faceDetection = new FaceDetection({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`,
    });

    faceDetection.setOptions({
      model: "short",
      minDetectionConfidence: 0.6,
    });

    faceDetection.onResults(async (results) => {
      if (results.detections.length > 0 && !isProcessing.current) {
        isProcessing.current = true;
        console.log("📸 Face Detected: Checking Attendance...");

        // ✅ Ensure rollNo and name are provided
        if (!rollNo.trim() || !name.trim()) {
          toast.error("⚠️ Please Enter Roll Number & Name!", { autoClose: 3000 });
          stopCamera();
          return;
        }

        const detectedFace = results.detections[0].boundingBox;

        const alreadyMarked = await checkDuplicateAttendance(rollNo);
        if (alreadyMarked) {
          toast.error("❌ Attendance Already Marked!", { autoClose: 3000 });
          stopCamera();
          return;
        }

        // ✅ MARK ATTENDANCE
        try {
          await addDoc(collection(db, "attendance"), {
            rollNo,
            name,
            timestamp: new Date().toISOString(),
          });

          // ✅ SAVE STUDENT FACE DATA
          await addDoc(collection(db, "students"), {
            rollNo,
            name,
            faceData: {
              x: detectedFace.x || 0,
              y: detectedFace.y || 0,
              width: detectedFace.width || 0,
              height: detectedFace.height || 0,
            },
          });

          toast.success("✅ Attendance Marked & Face Data Saved!", { autoClose: 3000 });
          console.log(`✅ Attendance Recorded for Roll No: ${rollNo}`);
          stopCamera();
        } catch (error) {
          console.error("❌ Error marking attendance:", error);
          toast.error("❌ Error marking attendance. Please try again.");
          isProcessing.current = false; // Reset to allow retry
        }
      }
    });

    cameraRef.current = new Camera(videoRef.current, {
      onFrame: async () => {
        if (!isProcessing.current && videoRef.current && videoRef.current.readyState >= 2) {
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

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }
    };
  }, [cameraOn]);

  // ✅ FUNCTION TO CHECK DUPLICATE ATTENDANCE
  const checkDuplicateAttendance = async (rollNo) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const attendanceRef = collection(db, "attendance");

      const q = query(
        attendanceRef,
        where("rollNo", "==", rollNo),
        where("timestamp", ">=", today)
      );

      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      console.error("❌ Error checking duplicate:", error);
      return false;
    }
  };

  // ✅ START CAMERA FUNCTION
  const startCamera = () => {
    if (!rollNo.trim() || !name.trim()) {
      toast.error("⚠️ Please Enter Roll Number & Name!", { autoClose: 3000 });
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

  // ✅ LOGOUT FUNCTION
  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Container className="d-flex flex-column align-items-center justify-content-center vh-100">
      <Card className="p-4 text-center shadow-lg attendance-card">
        <h3 className="mb-3">📸 Face-Based Attendance Tracker</h3>

        {/* ✅ ROLL NUMBER INPUT */}
        <input
          type="text"
          className="form-control mb-2"
          placeholder="Enter Roll Number"
          value={rollNo}
          onChange={(e) => setRollNo(e.target.value)}
          required
        />

        {/* ✅ STUDENT NAME INPUT */}
        <input
          type="text"
          className="form-control mb-2"
          placeholder="Enter Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        {cameraOn ? (
          <>
            {loading ? (
              <Spinner animation="border" variant="primary" className="mt-3" />
            ) : (
              <video ref={videoRef} autoPlay playsInline className="video-feed"></video>
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

        <Button variant="warning" className="mt-3 logout-btn" onClick={handleLogout}>
          🔓 Logout
        </Button>
      </Card>

      <ToastContainer position="top-right" />
    </Container>
  );
};

export default AttendanceTracker;
