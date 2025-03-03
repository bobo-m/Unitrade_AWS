import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../Styles/LoginDesign.css";
import { useDispatch } from "react-redux";
import { login } from "../../store/actions/authActions";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import icons for the eye button
import ToastNotification from "./Toast";
import { logo } from "../images/index";
import Loader from '../components/Loader';
import Swal from "sweetalert2"; // Import SweetAlert2
function Login() {
  const dispatch = useDispatch();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const navigate = useNavigate();
  const extractErrorMessage = (errorResponse) => {
    try {
      // Log the received error response to see its structure
      console.log('Received Error Response:', errorResponse);
  
      // Check if the message field exists and parse it
      if (errorResponse?.message) {
        const parsedMessage = JSON.parse(errorResponse.message);
        console.log('Parsed Message:', parsedMessage);
        
        // Extract the error message from the parsed message
        return parsedMessage?.error || "An unknown error occurred.";
      }
  
      // If no message, return the default error
      return "An unknown error occurred.";
    } catch (error) {
      console.error("Error parsing the response:", error);
      return "An unknown error occurred.";
    }
  };
  
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors(""); // Clear previous error message
    setLoading(true); // Set loading state to true
  
    try {
      // Dispatch the login action and capture the response
      const response = await dispatch(login({ mobile, password }));
  
      console.log("API Response: ", response); // Log the API response for debugging
  
      // Check if the login is successful
      if (response?.success && response?.token) {
        setToastMessage("Login successful!");
        setShowToast(true);
        navigate("/home"); // Navigate to home on success
      } else if (response?.status === 0 && response?.message === "Your account is not active yet. Please wait for activation.") {
        // Handle account not active yet condition
        setToastMessage("Your account is not active yet. Please wait for activation.");
        setShowToast(true); // Show the toast message
      } else if (response?.status === "payment_required" && response?.message === "Your account is not yet confirmed or active. Please complete the necessary steps.") {
        // Handle payment required condition
        setToastMessage("Your account is not yet confirmed or active. Please complete the necessary steps.");
        setShowToast(true); // Show the toast message
  
        // Optionally, show a SweetAlert for payment instructions
        const userId = response?.user?.id;
        Swal.fire({
          title: "Payment Required",
          text: "Your account is not yet activated. Please complete the payment to activate your account.",
          icon: "warning",
          background: "#333", // Dark mode background
          color: "#fff", // Dark mode text color
          confirmButtonText: "Go to Payment",
          confirmButtonColor: "red", // Customize button color if needed
        }).then((result) => {
          if (result.isConfirmed && userId) {
            navigate(`/payment/${userId}`); // Navigate to payment page
          }
        });
      } else {
        // Default error handling if no token or other error occurred
        const errorMessage = extractErrorMessage(response);
        setToastMessage(errorMessage); // Show the error message in toast
        setShowToast(true); // Show the toast with the error message
      }
    } catch (error) {
      const errorMessage = error?.message || "An unknown error occurred."; // Catch any errors during the try block
      setErrors(errorMessage); // Update the error state for UI display
      setToastMessage(errorMessage); // Show the error message in toast
      setShowToast(true);

    } finally {
      setLoading(false); // Reset loading state after success or failure
    }
  };
  
  
  
  
  

  const [firstName, setFirstName] = useState("");

  useEffect(() => {
    const tg = window.Telegram.WebApp;
    const firstName = tg.initDataUnsafe?.user?.first_name;
    setFirstName(firstName);

    // Use Telegram API to disable closing confirmation
    tg.disableClosingConfirmation();

    tg.disableVerticalSwipes(); // Disable vertical swipes on mobile
  }, []);

  return (
    <div className="bg-black flex justify-center items-center min-h-screen">
      <ToastNotification message={toastMessage} show={showToast} setShow={setShowToast} />
      <div className="w-full max-w-lg bg-black text-white shadow-2xl rounded-2xl overflow-hidden font-Inter">
        {/* Header Section */}
        <div className="p-6 sm:p-10 shadow-lg">
          {/* Header content (optional) */}
        </div>

        {/* Form Section */}
        <div className="p-6 sm:p-8 space-y-6">
          <h2 className="text-2xl font-semibold text-center text-white mb-6">
            Log in to your account
          </h2>

          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6 px-2 sm:px-4">
            <div className="relative">
              <label className="absolute -top-2 left-3 text-xs text-gray-400 bg-black px-1">Mobile No</label>
              <input
                type="number"
                name="mobile"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
                className="w-full px-4 py-3 bg-black border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-500 text-sm"
                placeholder="Mobile Number"
                autoComplete="mobile"
              />
            </div>

            <div className="relative">
              <label className="absolute -top-2 left-3 text-xs text-gray-400 bg-black px-1">Password</label>
              <input
                type={showPassword ? "text" : "password"} // Toggle input type
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-black border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-500 text-sm"
                placeholder="Password"
                autoComplete="current-password"
              />

              {/* Toggle Button */}
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)} // Toggle password visibility
                className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 hover:text-[#00c6ff] transition duration-300"
              >
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                className={`w-full py-3 bg-[#6339F9] text-white font-bold rounded-full hover:bg-blue-700 transition ${
                  loading ? "cursor-not-allowed opacity-70" : "hover:scale-105 hover:bg-blue-600 hover:shadow-lg"
                }`}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex justify-center items-center">
                    <div className="spinner"></div> {/* Custom spinner */}
                  </div>
                ) : (
                  "Log In" // Normal button text
                )}
              </button>
            </div>
          </form>

          <div className="text-center">
            <Link
              to="/forgot"
              className="text-xs sm:text-sm text-[#b0b0b0] hover:text-white transition-all"
            >
              Forgot Password?
            </Link>
          </div>
        </div>

        {/* CSS for Custom Spinner */}
        <style jsx>{`
          .spinner {
            border: 4px solid #f3f3f3; /* Light background */
            border-top: 4px solid #000000; /* Black color */
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

        {/* Footer Section */}
        <div className="bg-[#111113] py-4 sm:py-6 text-center rounded-b-2xl">
          <p    className="text-xs sm:text-sm text-[#909090]">
            New to Unitrade?
            <Link to="/" className="text-white font-semibold hover:underline ml-1">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;


