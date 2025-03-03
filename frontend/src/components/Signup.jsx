import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import icons for the eye button
import "react-toastify/dist/ReactToastify.css"; // Import the CSS for toast notifications
import "../Styles/LoginDesign.css";
import ToastNotification from "./Toast";
import { BACKEND_URL } from '../config';
// Custom Hook for Referral Code

function Signup() {
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState({
    user_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobile: "",
    upi_id: "",
    referral_by: "",
    user_type: "user",
  });
  const [errors, setErrors] = useState({
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");// Use location to access the URL parameters
  const [isChecked, setIsChecked] = useState(false); // State for terms checkbox

  useEffect(() => {
    const getReferralCode = () => {
      let referralCode = null;

      // Check if we are inside the Telegram Web App
      if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) {
        console.log("Inside Telegram Web App");

        // Decode initData
        const initDataDecoded = decodeURIComponent(window.Telegram.WebApp.initData);
        console.log("Decoded initData:", initDataDecoded);

        // Parse initData to extract start_param
        const urlParams = new URLSearchParams(initDataDecoded);
        referralCode = urlParams.get("start_param"); // Use 'start_param' instead of 'startapp'
        console.log("Referral Code from Telegram WebApp:", referralCode);
      }

      // Fallback to URL parameters if not in WebApp
      if (!referralCode) {
        const currentUrlParams = new URLSearchParams(window.location.search);
        referralCode = currentUrlParams.get("start_param"); // Check for 'start_param' in URL
        console.log("Referral Code from URL:", referralCode);
      }

      if (referralCode) {
        setValues((prev) => ({
          ...prev,
          referral_by: referralCode,
        }));
        console.log("Referral code set to state:", referralCode);
      } else {
        console.log("No referral code found");
      }
    };

    getReferralCode();
  }, [location]); // Run this effect when location changes

  const handleInput = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (name === "email" && errors.email) validateEmail(value);
    if (name === "mobile" && errors.mobile) validateMobile(value);
    if (name === "password" && errors.password) validatePassword(value);
    if (name === "confirmPassword" && errors.confirmPassword) validateConfirmPassword(value)
  };
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setErrors((prev) => ({
      ...prev,
      email: emailRegex.test(email) ? "" : "Invalid email address.",
    }));
  }
  // const handleFocus = () => {
  //   // Delay scrolling to give time for the keyboard to pop up
  //   setTimeout(() => {
  //     window.scrollTo({
  //       top: document.body.scrollHeight, // Scroll to bottom of the page
  //       behavior: 'smooth', // Smooth scrolling
  //     });
  //   }, 200); // Delay time to ensure the keyboard appears before scrolling
  // };

  const validateMobile = (mobile) => {
    const mobileRegex = /^[0-9]{10}$/;
    setErrors((prev) => ({
      ...prev,
      mobile: mobileRegex.test(mobile) ? "" : "Invalid mobile number.",
    }));
  };

  const validatePassword = (password) => {
    const minLength = 6;
    setErrors((prev) => ({
      ...prev,
      password:
        password.length >= minLength
          ? ""
          : `Password must be at least ${minLength} characters long.`,
    }));
  };
  const validateConfirmPassword = (confirmPassword) => {
    setErrors((prev) => ({
      ...prev,
      confirmPassword:
        confirmPassword === values.password ? "" : "Passwords do not match.",
    }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    if (name === "email") validateEmail(value);
    if (name === "mobile") validateMobile(value);
    if (name === "password") validatePassword(value);
    if (name === "confirmPassword") validateConfirmPassword(value);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
  // Check if terms and conditions are accepted
  if (!isChecked) {
    setToastMessage("Please agree to the Terms and Conditions.");
    setShowToast(true);
    return;
  }
    // Display validation errors if any field is invalid
    if (
      !values.email || errors.email ||
      !values.mobile || errors.mobile ||
      !values.password || errors.password ||
      !values.confirmPassword || errors.confirmPassword
    ) {
      setToastMessage("Please fill out the required fields correctly.");
      setShowToast(true);
      return; // Exit without sending the request
    }

    setLoading(true); // Start the loader while sending the request

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/api-register`,
        values
      );

      console.log("Server Response:", response);

      // Assuming user ID is returned in the response
      const userId = response.data.user.id;
      console.log("userId:", userId);

      setToastMessage("Registration successful!");
      setShowToast(true);

      // Redirect to the Payment page with the generated userId
      setTimeout(() => {
        navigate(`/payment/${userId}`);
      }, 500);
    } catch (err) {
      setLoading(false); // Ensure the loader stops in case of an error

      // Check if the error is from the server (err.response exists)
      if (err.response) {
        const errorMessages = err.response.data.error;

        if (typeof errorMessages === "string") {
          setToastMessage(errorMessages);
        } else if (Array.isArray(errorMessages) && errorMessages.length > 0) {
          setToastMessage(errorMessages[0]); // Show the first error message
        } else {
          setToastMessage("An unknown error occurred.");
        }
      } else if (err.request) {
        // Handle network errors or no response from server
        console.log("Network Error:", err);
        setToastMessage("Network error. Please check your connection.");
      } else {
        // Handle unexpected Axios-related errors
        console.log("Axios Error:", err);
        setToastMessage("An unexpected error occurred. Please try again.");
      }

      setShowToast(true); // Show the error toast
    } finally {
      setLoading(false); // Hide the loader after request completes
    }
  };

  useEffect(() => {
      const tg = window.Telegram.WebApp;

    tg.disableClosingConfirmation();
    tg.disableVerticalSwipes(); // Disable vertical swipes on mobile
    const handleResize = () => {
      const appHeight = window.innerHeight;
      document.documentElement.style.setProperty("--app-height", `${appHeight}px`);
    };

    handleResize(); // Set on component mount
    window.addEventListener("resize", handleResize); // Update on resize

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

 // useEffect(() => {
 //    // Disable drag and touch gestures
 //    const preventDrag = (e) => e.preventDefault();

 //    document.addEventListener("dragstart", preventDrag);

 //    return () => {
 //      document.removeEventListener("dragstart", preventDrag);
 //    };
 //  }, []);



  return (
    // <div className="bg-black flex justify-center items-center min-h-screen overflow-hidden">
   // <div
   //    className="bg-black flex justify-center items-center overflow-auto">
   //    <ToastNotification message={toastMessage} show={showToast} setShow={setShowToast} />
   //    <div className="w-full max-w-md bg-black text-white rounded-lg shadow-lg  font-Inter">

   //      <div id="content" className="p-6 space-y-6">

   //        <h2 className="text-2xl font-bold text-center text-white mb-6">Create account</h2>

   //        <form onSubmit={handleSubmit} className="space-y-4">
//    <div className="bg-black flex justify-center items-center h-screen overflow-hidden">
//       <ToastNotification message={toastMessage} show={showToast} setShow={setShowToast} />
// <div className="w-full max-w-lg bg-black text-white rounded-lg shadow-lg font-Inter flex flex-col h-[700px] overflow-hidden pb-[120px]">
//         <div id="content" className="p-6 space-y-6 flex-grow overflow-y-auto pb-[120px]">
//           <h2 className="text-2xl font-bold text-center text-white mb-6">Create account</h2>
<div className="bg-black flex justify-center items-center h-screen overflow-y-auto">
  <ToastNotification message={toastMessage} show={showToast} setShow={setShowToast} />
  <div className="w-full max-w-lg bg-black text-white rounded-lg shadow-lg font-Inter flex flex-col h-[100vh] overflow-hidden pb-[120px]">
    <div id="content" className="p-6 space-y-6 flex-grow overflow-y-auto pb-[120px]">
      <h2 className="text-2xl font-bold text-center text-white mb-6">Create account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input */}
            <div className="relative">
              <label className="absolute -top-2 left-3 text-xs text-gray-400 bg-black px-1">Name</label>
              <input
                type="text"
                name="user_name"
                value={values.user_name}
                onChange={handleInput}
                required
                className="w-full px-4 py-3 bg-black border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-500 text-sm"
                placeholder="Enter your name"
              />
            </div>

            {/* Mobile Number Input */}
            <div className="relative">
              <label className="absolute -top-2 left-3 text-xs text-gray-400 bg-black px-1">Mobile No</label>
              <input
                type="tel"
                name="mobile"
                value={values.mobile}

                onChange={handleInput}
                onBlur={handleBlur}
                required
                className="w-full px-4 py-3 bg-black border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-500 text-sm"
                placeholder="Enter your mobile number"
              />
              {errors.mobile && <span className="text-xs text-red-500">{errors.mobile}</span>}
            </div>

            {/* Email Input */}
            <div className="relative">
              <label className="absolute -top-2 left-3 text-xs text-gray-400 bg-black px-1">Email</label>
              <input
                type="email"
                name="email"
                value={values.email}
                onChange={handleInput}
                onBlur={handleBlur}
                required
                className="w-full px-4 py-3 bg-black border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-500 text-sm"
                placeholder="Enter your email id"
              />
              {errors.email && <span className="text-xs text-red-500">{errors.email}</span>}
            </div>

            {/* Password Input */}
            <div className="relative">
              <label className="absolute -top-2 left-3 text-xs text-gray-400 bg-black px-1">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={values.password}
                onChange={handleInput}
                onBlur={handleBlur}
                required
                className="w-full px-4 py-3 bg-black border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-500 text-sm"
                placeholder="Enter your password"
              />
              <button
                type="button"
                aria-label="Toggle Password Visibility"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 transition"
              >
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
              {errors.password && <span className="text-xs text-red-500">{errors.password}</span>}
            </div>

            {/* Confirm Password Input */}
            <div className="relative">
              <label className="absolute -top-2 left-3 text-xs text-gray-400 bg-black px-1">Confirm Password</label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={values.confirmPassword}
                onChange={handleInput}
                onBlur={handleBlur}
                required
                className="w-full px-4 py-3 bg-black border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-500 text-sm"
                placeholder="Enter your confirm password"
              />
              <button
                type="button"
                aria-label="Toggle Confirm Password Visibility"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 transition"
              >
                {showConfirmPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
              {errors.confirmPassword && (
                <span className="text-xs text-red-500">{errors.confirmPassword}</span>
              )}
            </div>
  {/* UPI ID Input */}
  <div className="relative">
  <label className="absolute -top-2 left-3 text-xs text-gray-400 bg-black px-1">UPI ID</label>
            <input
              type="text"
              name="upi_id"
              value={values.upi_id}
              onChange={handleInput}
              required
              aria-label="UPI ID"
              className="w-full px-4 py-3 bg-black border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-500 text-sm"
              placeholder="UPI ID"
            />
          </div>
            {/* Terms and Privacy */}
            <div className="flex items-center justify-center mt-4 space-x-2">
            <input
              type="checkbox"
              id="terms"
              name="terms"
              required
              checked={isChecked}
              className="w-4 h-4 text-blue-500 bg-[#1f2024] border-gray-300 rounded focus:ring-blue-500"
              onChange={(e) => setIsChecked(e.target.checked)} // Update state on change
            />
            <label htmlFor="terms" className="text-xs text-gray-400">
              By clicking 'Sign Up,' you agree to Block View's
              <Link to='/termsAndCondition' className="text-blue-500 hover:underline mx-1">Terms of Service</Link>
              and
              <Link to='/termsAndCondition' className="text-blue-500 hover:underline mx-1">Privacy Policy</Link>.
            </label>
          </div>
            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-[#6339F9] text-white font-bold rounded-full hover:bg-blue-700 transition"
              disabled={loading}
            >
               {loading ? (
                <div className="flex justify-center items-center">
                  <div className="spinner"></div>
                </div>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>
   {/* Spinner Styles */}
{/*    <style jsx>{`
          .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #000000;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            animation: spin 1s linear infinite;
          }
  
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style> */}
<style jsx>{`
  .spinner {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #000000;
    border-radius: 50%;
    width: 5vw;
    height: 5vw; 
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`}</style>
        


          {/* Login Link */}
          <p className="text-xs text-gray-400 text-center mt-2">
            Already have an account?
            <Link to="/login" className="text-blue-500 hover:underline ml-1">Log in</Link>
          </p>
        </div>
      </div>
    </div>


  );
}
const styles = {
  content: {
    // height: '100%', // Full viewport height
    // overflowY: 'auto', // Enable vertical scrolling
    WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
  },
};

export default Signup;

