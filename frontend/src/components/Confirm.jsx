import React, { useState, useEffect } from 'react';
import { IoLogOutOutline } from "react-icons/io5";
import { Link } from "react-router-dom";

function Confirm() {
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(false), 1500); // Animation duration (1.5s)
    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, []);

  return (
    <>
      <style>
        {`
          @keyframes dance {
            0% {
              transform: rotate(0deg) translateY(0);
            }
            25% {
              transform: rotate(-5deg) translateY(-5px);
            }
            50% {
              transform: rotate(5deg) translateY(5px);
            }
            75% {
              transform: rotate(-5deg) translateY(-5px);
            }
            100% {
              transform: rotate(0deg) translateY(0);
            }
          }
          .container {
            position: relative;
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }
          .image {
            width: 360px;
            height: 270px;
            margin-bottom: 20px;
          }
          .image.animate {
            animation: dance 1.5s ease-out;
          }
          .message {
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            padding: 0;
            gap: 12px;
            font-family: 'Inter';
            font-size: 14px;
            color: #9896A1;
            margin-bottom: 30px;
          }
          .button {
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            padding: 10px 24px;
            gap: 10px;
            width: 233px;
            height: 40px;
            background-color: #6339F9;
            color: #FFFFFF;
            border: none;
            border-radius: 9999px;
            cursor: pointer;
            text-decoration: none;
            font-size: 15px;
          }
        `}
      </style>
      <div className="container">
        <img
          className={`image ${animate ? 'animate' : ''}`}
          src="src/images/sad-face-b 1.png"
          alt="Sad Face"
        />
        <div className="message">You successfully created an account</div>
        <Link to="/login" className="button">
          Go to the login Page <IoLogOutOutline size={22} />
        </Link>
      </div>
    </>
  );
}

export default Confirm;
