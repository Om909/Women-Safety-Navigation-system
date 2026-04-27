import React, { useRef, useState } from "react";
import Webcam from "react-webcam";

function CameraCapture({ onCapture }) {
  const webcamRef = useRef(null);
  const [cameraOpen, setCameraOpen] = useState(true);
  const [image, setImage] = useState(null);

  /* 📸 CAPTURE */
  const capture = () => {
    if (!webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();

    if (imageSrc) {
      setImage(imageSrc);
      onCapture && onCapture(imageSrc);
      setCameraOpen(false);
    }
  };

  /* 🔄 RETAKE */
  const retake = () => {
    setCameraOpen(true);
    setImage(null);
  };

  return (
    <div className="camera-card">

      {/* HEADER */}
      <h2 className="section-title">🚗 Vehicle Verification</h2>

      {cameraOpen ? (
        <>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="camera-view"
          />

          <button className="capture-btn" onClick={capture}>
            📸 Capture
          </button>
        </>
      ) : (
        <div className="preview">

          <img src={image} alt="vehicle" />

          <button className="retake-btn" onClick={retake}>
            🔄 Retake
          </button>

        </div>
      )}

    </div>
  );
}

export default CameraCapture;