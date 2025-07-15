import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import "./HeroSection.css";
import { Model } from "../../Model/Model";
import { Link } from "react-router-dom";

const HeroSection = () => {
  const [tshirtColor, setTshirtColor] = useState("red");

  // New state for animation
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Trigger animation on component mount
    setAnimate(true);
  }, []);

  const changeColor = (color) => {
    setTshirtColor(color);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      <div className={`heroMain ${animate ? "fadeIn" : ""}`}>
        <div className="sectionleft">
          <p className={`animated-text ${animate ? "slideIn" : ""}`}>Experience Luxury</p>
          <h1 className={`animated-title ${animate ? "zoomIn" : ""}`}>Premium Virtual Fashion</h1>
          <span className={`animated-description ${animate ? "fadeInUp" : ""}`}>
            Elevate your style with exclusive collections and immersive try-on technology.
          </span>
          <div className="heroLink">
            <Link to="/shop" onClick={scrollToTop}>
              <h5 className={`animated-button ${animate ? "bounce" : ""}`}>Shop the Collection</h5>
            </Link>
          </div>
        </div>
        <div className="sectionright">
          <Canvas
            className="canvasModel"
            camera={{ position: [0, 5, 15], fov: 50 }}
          >
            <ambientLight intensity={0.5} />
            <directionalLight
              position={[10, 10, 5]}
              intensity={2.5}
              color={"white"}
            />

            <OrbitControls
              enableZoom={false}
              enablePan={false}
              minAzimuthAngle={-Infinity}
              maxAzimuthAngle={Infinity}
              maxPolarAngle={Math.PI / 2}
              minPolarAngle={Math.PI / 2}
            />

            <Model color={tshirtColor} />
          </Canvas>
          <div className="heroColorBtn">
            <button
              onClick={() => changeColor("#353933")}
              style={{ backgroundColor: "#353933" }}
            ></button>
            <button
              onClick={() => changeColor("#EFBD4E")}
              style={{ backgroundColor: "#EFBD4E" }}
            ></button>
            <button
              onClick={() => changeColor("#726DE7")}
              style={{ backgroundColor: "#726DE7" }}
            ></button>
            <button
              onClick={() => changeColor("red")}
              style={{ backgroundColor: "red" }}
            ></button>
          </div>
        </div>
      </div>
      <style>
        {`
          .fadeIn {
            animation: fadeIn 1s forwards;
          }
          .slideIn {
            animation: slideIn 1s forwards;
          }
          .zoomIn {
            animation: zoomIn 1s forwards;
          }
          .fadeInUp {
            animation: fadeInUp 1s forwards;
          }
          .bounce {
            animation: bounce 1s forwards;
          }
          .pulse {
            animation: pulse 1.5s infinite;
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideIn {
            from { transform: translateX(-100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          @keyframes zoomIn {
            from { transform: scale(0.5); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          @keyframes fadeInUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-30px); }
            60% { transform: translateY(-15px); }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
        `}
      </style>
    </>
  );
};

export default HeroSection;
