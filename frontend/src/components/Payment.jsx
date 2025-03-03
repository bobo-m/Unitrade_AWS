import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom"; // Import useParams for retrieving URL params
import axios from "axios";
import "../Styles/Tasks.css";
import { logo } from "../images/index";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import the CSS for toast notifications
import "../Styles/LoginDesign.css";
import { ImCross } from "react-icons/im";
import { BACKEND_URL } from "../config";
import { useDispatch, useSelector } from "react-redux";
import { fetchAPIData } from "../../store/actions/homeActions";
import { FaCopy } from "react-icons/fa"; // Make sure to install react-icons
import QRCode from "qrcode";
import Loader from "../components/Loader";

function Payment() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const apiData = useSelector((state) => state.apiData.data.apisettings);
  const apiSettings = apiData?.settings || [];
  const { id } = useParams(); // Extract userId from URL
  const [firstName, setFirstName] = useState("");
  const [screenshot, setScreenshot] = useState(null); // To store the selected file
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [transaction_id, setTransactionId] = useState(""); // State for transaction ID
  const [utr_no, setUtrNo] = useState(""); // State for UTR No
  const [showLink, setShowLink] = useState(false);
  const handleImageClick = () => {
    setShowLink(true);
  };
  useEffect(() => {
    // Initialize Telegram WebApp
    const tg = window.Telegram.WebApp;

    // Extract user information
    const firstName = tg.initDataUnsafe?.user?.first_name;
    setFirstName(firstName);

    // Fetch additional API data
    dispatch(fetchAPIData("apiSettings"));
  }, [dispatch]);
  useEffect(() => {
    const generateQRCode = async () => {
      if (apiSettings && apiSettings.upi) {
        try {
          const upiString = apiSettings.upi;
          const url = await QRCode.toDataURL(upiString);
          setQrCodeUrl(url);
        } catch (err) {
          console.error("Error generating QR Code:", err);
        }
      }
    };

    generateQRCode(); // Generate QR code when apiSettings is updated
  }, [apiSettings]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setScreenshot(selectedFile);
    console.log("Selected File:", selectedFile); // Log the selected file for debugging
  };
  const togglePopup = () => {
    setShowPopup(!showPopup);
  };
  const handleUpload = async () => {
    if (transaction_id && utr_no) {
      setLoading(true); // Show loader when upload starts
      try {
        const formData = new FormData();

        // Only append screenshot if it exists
        if (screenshot) {
          formData.append("pay_image", screenshot); // Append the screenshot if it exists
        }

        // Append other fields regardless of screenshot
        formData.append("user_id", id); // Send the userId with the image
        formData.append("utr_no", utr_no); // Send UTR No
        formData.append("transaction_id", transaction_id); // Send Transaction ID

        const response = await axios.post(
          `${BACKEND_URL}/api/v1/upload-screenshot/${id}`, // Use dynamic id in URL
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        toast.success("Verification successful!");

        setTimeout(() => {
          setLoading(false); // Hide loader after success
          navigate("/confirm");
        }, 2000);
      } catch (err) {
        console.error("Error uploading screenshot:", err); // Log detailed error for debugging
        if (err.response) {
          console.error("Response Error:", err.response.data); // Handle specific response errors
          toast.error(
            err.response.data.error || "An error occurred during the upload."
          ); // Show error toast
        } else {
          toast.error("An error occurred while uploading. Please try again."); // Fallback error toast
        }
      }
    } else {
      toast.warn("Please provide transaction ID and UTR No."); // Warn if transaction ID or UTR No is missing
    }
  };

  const handleCopy = () => {
    const upiId =
      apiSettings && apiSettings.upi ? apiSettings.upi : "admin@upi";

    navigator.clipboard
      .writeText(upiId)
      .then(() => {
        toast("UPI ID copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  // if (loading) {
  //   return <Loader />;
  // }
  return (
    <div className="bg-white flex justify-center items-center min-h-screen">
      <div className="w-full max-w-lg bg-black text-white min-h-screen shadow-lg overflow-hidden flex flex-col">
        {/* Toast Notification */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar
          closeOnClick
          pauseOnHover
          draggable
          theme="dark"
        />

        {loading && <Loader />}

        {/* Main Content */}
        <div className="px-5 py-6 flex-grow space-y-8 flex flex-col justify-center">
          {/* UPI ID Section */}
          <div className="flex items-center justify-between bg-black p-4 rounded-lg shadow-md border border-white">
            <span className="text-xs text-white">Admin's UPI ID:</span>
            <span className="font-semibold text-white">
              {apiSettings?.upi || "admin@upi"}
            </span>
            <button onClick={handleCopy}>
              <FaCopy
                className="text-white hover:text-black transition duration-150"
                title="Copy UPI ID"
              />
            </button>
          </div>

          {/* QR Code Section */}
          <div className="flex flex-col items-center space-y-2">
            <h4 className="text-xs font-semibold text-white">Scan to Pay</h4>
            {/*           <div className="bg-white p-3 rounded-lg shadow-md w-48 h-48 flex items-center justify-center">
            {qrCodeUrl ? (
              // <img src={qrCodeUrl} alt="QR Code" className="object-contain w-full h-full rounded-md shadow-lg" />
              <img src={apiSettings?.qr_code || ""} alt="QR Code" className="object-contain w-full h-full rounded-md shadow-lg" />
            ) : (
              <div className="w-full h-full bg-black rounded-md flex items-center justify-center">
                <span className="text-white text-sm">No QR Code Available</span>
              </div>
            )}
          </div> */}
            <div className="bg-white p-3 rounded-lg shadow-md w-48 h-48 flex items-center justify-center">
              {qrCodeUrl ? (
                <a
                  href="upi://pay?pa=singhnarukaarjun@okicici&pn=ArjunSingh&am=300&cu=INR"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={apiSettings?.qr_code || ""}
                    alt="QR Code"
                    className="object-contain w-full h-full rounded-md shadow-lg cursor-pointer"
                  />
                </a>
              ) : (
                <div className="w-full h-full bg-black rounded-md flex items-center justify-center">
                  <span className="text-white text-sm">
                    No QR Code Available
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Upload Section */}
          <div className="flex justify-center">
            <button
              onClick={togglePopup}
              className="w-full py-3 sm:py-4 text-sm sm:text-base uppercase font-Inter font-bold text-black bg-white rounded-lg shadow-md transform transition duration-300 ease-in-out hover:scale-105 hover:bg-gray-200 hover:shadow-lg"
            >
              Upload Payment Proof
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-black py-3 text-center text-white border-t border-white">
          <p className="text-xs">
            Need help?{" "}
            <a href="#" className="text-white font-medium hover:underline">
              Contact Support
            </a>
          </p>
        </div>
      </div>

      {/* Popup Modal */}
      {showPopup && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-transparent bg-opacity-40 backdrop-blur-sm z-50 "
          onClick={togglePopup}
        >
          <div
            className="bg-[#1B1A1A] p-4 sm:p-6 rounded-t-3xl shadow-xl w-full max-w-lg relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={togglePopup}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-200 focus:outline-none transition duration-300"
            >
              <ImCross size={20} />
            </button>

            <h2 className="text-lg sm:text-2xl font-semibold text-center mb-4 text-[#E0E0E0]">
              Upload Screenshot
            </h2>
            <p className="text-sm sm:text-base text-[#B0B0B0] text-center mb-6">
              Kindly upload the transaction ID, UTR number, or a screenshot of
              the payment for processing and verification.
            </p>

            <input
              type="text"
              value={transaction_id}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Enter Transaction Id"
              className="w-full p-2 sm:p-3 bg-[#2C2C2C] text-white border border-transparent rounded-lg mb-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#505050] transition duration-300 text-sm sm:text-base"
            />
            <input
              type="text"
              value={utr_no}
              onChange={(e) => setUtrNo(e.target.value)}
              placeholder="Enter UTR No."
              className="w-full p-2 sm:p-3 bg-[#2C2C2C] text-white border border-transparent rounded-lg mb-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#505050] transition duration-300 text-sm sm:text-base"
            />

            <p className="text-sm sm:text-base text-[#B0B0B0] text-center mb-6">
              OR
            </p>
            <input
              type="file"
              id="file"
              onChange={handleFileChange}
              placeholder="Enter referral link for QR code"
              className="w-full p-2 sm:p-3 bg-[#2C2C2C] text-white border border-transparent rounded-lg mb-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#505050] transition duration-300 text-sm sm:text-base"
            />

            <div className="flex justify-center items-center mb-2">
              <button
                className="btn bg-[#3A3A3A] text-white font-semibold hover:bg-[#505050] transition duration-300 ease-in-out w-full py-2 sm:py-3 text-sm sm:text-base rounded-lg shadow-lg"
                onClick={handleUpload}
              >
                {loading ? "Uploading..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Payment;
