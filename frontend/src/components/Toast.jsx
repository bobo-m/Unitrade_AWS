// ToastNotification.js
import React, { useState, useEffect } from "react";
import { FaRegCheckCircle } from "react-icons/fa";

const ToastNotification = ({ message, show, setShow }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        setShow(false);
      }, 2000); // Auto-close after 2 seconds
      return () => clearTimeout(timer); // Cleanup timer on component unmount
    }
  }, [show, setShow]);

  if (!show) return null;

  return (
    <div
      style={{
        width: "70%",
        position: "fixed",
        top: "5%",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        backgroundColor: "#333",
        color: "#E5E5E5",
        padding: "10px 8px",
        borderRadius: "8px",
        fontSize: "14px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        zIndex: 1000,
        transition: "opacity 0.3s ease-in-out",
      }}
    >
      <FaRegCheckCircle size={16} className="text-[#E5E5E5]"/>
      {/* <div
        style={{
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          backgroundColor: "#E5E5E5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ fontSize: "12px", color: "#333" }}>✓</span>
      </div> */}
      <span>{message}</span>
    </div>
  );
};

export default ToastNotification;
