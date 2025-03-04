import React, { useState , useEffect} from "react";
import { Link, useNavigate, useLocation  } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import icons for the eye button
import "react-toastify/dist/ReactToastify.css"; // Import the CSS for toast notifications
import "../Styles/LoginDesign.css";
import ToastNotification from "./Toast";
import { BACKEND_URL } from '../config';
import Loader from '../components/Loader';
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
  const [keyboardVisible, setKeyboardVisible] = useState(false);
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

  const handleFocus = (e) => {
    const inputElement = e.target;
    setTimeout(() => {
      inputElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300); // Delay to allow keyboard to open
  };

  return (
    <div className="bg-black flex justify-center items-center min-h-screen overflow-hidden" >
    <ToastNotification message={toastMessage} show={showToast} setShow={setShowToast} />
    <div   
                  className="w-full max-w-lg bg-black text-white min-h-screen sm:h-auto  shadow-2xl  "

    >

      <div id="content" className="p-4 sm:p-6 space-y-6 h-full overflow-y-auto touch-auto"  >
        <h2 className="text-2xl sm:text-4xl font-bold text-center mb-4 sm:mb-6 tracking-tight text-[#eaeaea]">
          Sign Up
        </h2>
  
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 " >
  
          {/* Name and Mobile Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="relative">
              <input
                type="text"
                name="user_name"
                onFocus={handleFocus} // Add this
                value={values.user_name}
                onChange={handleInput}
                required
                aria-label="Name"
                className="w-full px-4 py-3 bg-[#1f2024] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c6ff] placeholder-gray-400 text-sm sm:text-base "
                placeholder="Name"
              />

            </div>
            <div className="relative">
              <input
                type="tel"
                name="mobile"
                value={values.mobile}
                onFocus={handleFocus} // Add this
                onChange={handleInput}
                onBlur={handleBlur}
                required
                aria-label="Mobile No."
                className="w-full px-4 py-3 bg-[#1f2024] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c6ff] placeholder-gray-400 text-sm sm:text-base "
                placeholder="Mobile No."
              />
                        {errors.mobile && <span className="error-message text-xs text-red-500">{errors.mobile}</span>}

            </div>
          </div>
          
  
          {/* Email Input */}
          <div className="relative">
            <input
              type="email"
              name="email"
              value={values.email}
              onFocus={handleFocus} // Add this
              onChange={handleInput}
              onBlur={handleBlur}
              required
              aria-label="Email"
              className="w-full px-4 py-3 bg-[#1f2024] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c6ff] placeholder-gray-400 text-sm sm:text-base "
              placeholder="Email"
            />
                      {errors.email && <span className="error-message text-xs text-red-500">{errors.email}</span>}

          </div>
  
          {/* Password and Confirm Password Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={values.password}
                onFocus={handleFocus} // Add this
                onChange={handleInput}
                onBlur={handleBlur}
                required
                aria-label="Password"
                className="w-full px-4 py-3 bg-[#1f2024] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c6ff] placeholder-gray-400 text-sm sm:text-base "
                placeholder="Password"
              />
              <button
                type="button"
                aria-label="Toggle Password Visibility"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 hover:text-[#00c6ff] transition"
              >
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
              {errors.password && <span className="error-message text-xs text-red-500">{errors.password}</span>}

            </div>
  
            {/* Confirm Password */}
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={values.confirmPassword}
                onFocus={handleFocus} // Add this
                onChange={handleInput}
                onBlur={handleBlur}
                required
                aria-label="Confirm Password"
                className="w-full px-4 py-3 bg-[#1f2024] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c6ff] placeholder-gray-400 text-sm sm:text-base "
                placeholder="Confirm Password"
              />
              <button
                type="button"
                aria-label="Toggle Confirm Password Visibility"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 hover:text-[#00c6ff] transition"
              >
                {showConfirmPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
              {errors.confirmPassword && (
            <span className="error-message text-xs text-red-500">{errors.confirmPassword}</span>
          )}
            </div>
         
          </div>
  
          {/* UPI ID Input */}
          <div className="relative">
            <input
              type="text"
              name="upi_id"
              value={values.upi_id}
              onFocus={handleFocus} // Add this
              onChange={handleInput}
              required
              aria-label="UPI ID"
              className="w-full px-4 py-3 bg-[#1f2024] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00c6ff] placeholder-gray-400 text-sm sm:text-base "
              placeholder="UPI ID"
            />
          </div>
  
          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="w-full py-3 sm:py-4 text-sm sm:text-base uppercase font-bold text-black bg-white rounded-lg shadow-md hover:scale-105 hover:shadow-lg transition-transform"
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
          </div>
        </form>
  
        {/* Spinner Styles */}
        <style jsx>{`
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
        `}</style>
      </div>
  
      {/* Footer */}
      <div className="bg-[#111113] py-4 sm:py-6 text-center">
        <p className="text-xs sm:text-sm text-[#909090]">
          Already have an account?
          <Link to="/login" className="text-white font-semibold hover:underline ml-1">
            Login
          </Link>
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
