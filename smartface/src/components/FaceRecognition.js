import React, { useEffect, useRef } from "react";
import { FaceDetection } from "@mediapipe/face_detection";
import { Camera } from "@mediapipe/camera_utils";

const FaceRecognition = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const faceDetection = new FaceDetection({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`,
    });

    faceDetection.setOptions({
      model: "short", // Use 'short' for lightweight detection
      minDetectionConfidence: 0.5,
    });

    faceDetection.onResults((results) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

      if (results.detections.length > 0) {
        results.detections.forEach((detection) => {
          const bbox = detection.boundingBox;
          ctx.strokeStyle = "red";
          ctx.lineWidth = 2;
          ctx.strokeRect(bbox.xCenter - bbox.width / 2, bbox.yCenter - bbox.height / 2, bbox.width, bbox.height);
        });
      }
    });

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        await faceDetection.send({ image: videoRef.current });
      },
      width: 640,
      height: 480,
    });

    camera.start();
  }, []);

  return (
    <div>
      <h2>Face Recognition using smartface</h2>
      <video ref={videoRef} autoPlay playsInline style={{ display: "none" }} />
      <canvas ref={canvasRef} width="640" height="480" />
    </div>
  );
};

export default FaceRecognition;
