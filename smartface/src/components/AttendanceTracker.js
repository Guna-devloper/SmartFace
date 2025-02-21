import React, { useEffect, useRef, useState } from "react";
import { FaceDetection } from "@mediapipe/face_detection";
import { Camera } from "@mediapipe/camera_utils";
import { db, collection, addDoc } from "../firebase"; // Import Firebase
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button, Card, Container, Spinner } from "react-bootstrap"; // Bootstrap Components
import "./AttendanceTracker.css"; // Custom CSS for styling
import { auth } from "../firebase"; // Import Firebase auth
import { useNavigate } from "react-router-dom"; // Import useNavigate
const AttendanceTracker = () => {
  const videoRef = useRef(null);
  const cameraRef = useRef(null);
  const isProcessing = useRef(false); // Flag to prevent multiple submissions
  const [cameraOn, setCameraOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Hook for redirection
  useEffect(() => {
    if (!cameraOn) return;
  
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
  
        console.log("Face Detected: Marking attendance...");
  
        try {
          await addDoc(collection(db, "attendance"), {
            name: "Unknown User",
            timestamp: new Date().toISOString(),
          });
  
          toast.success("✅ Attendance Marked Successfully!", {
            autoClose: 3000,
          });
  
          stopCamera();
        } catch (error) {
          console.error("Error marking attendance:", error);
          toast.error("❌ Error marking attendance");
        }
      }
    });
  
    if (videoRef.current) {
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
    }
  
    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }
    };
  }, [cameraOn]);
  

  // Function to start camera
  const startCamera = () => {
    isProcessing.current = false; // Reset processing state
    setCameraOn(true);
  };

  // Function to stop camera
  const stopCamera = () => {
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null; // Clear camera reference
    }
    isProcessing.current = false;
    setCameraOn(false);
  };
  
 const handleLogout = async () => {
    try {
      await auth.signOut(); // Sign out from Firebase
      navigate("/"); // Redirect to login page
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  return (
    <Container className="d-flex flex-column align-items-center justify-content-center vh-100">
      <Card className="p-4 text-center shadow-lg attendance-card">
        <h3 className="mb-3">📸 Face-Based Attendance Tracker</h3>

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

      {/* Toast Notification */}
      <ToastContainer position="top-right" />
    </Container>
  );
};

export default AttendanceTracker;
