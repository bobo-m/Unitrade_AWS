import React, { useState, useEffect } from "react";
import "../Styles/Friends.css";
import { ImCross } from "react-icons/im";
import Logo from "../utils/Logo";
import Footer from "./Footer";
import QRCode from "qrcode";
import { fetchReffralData } from "../../store/actions/homeActions";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ToastNotification from "./Toast";
import { FRONTEND_URL } from "../config";
import Loader from "../components/Loader";
import Header from "./Header";

function Friend() {
  const dispatch = useDispatch();

  // State management
  const [loading, setLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  // Redux data
  const apiData = useSelector((state) => state.apiData.data);
  const referralData = apiData?.reffral?.data || null;
  const referralCode = referralData?.referral_code;

  // Replace with your actual bot username
  const botUsername = "TheUnitadeHub_bot";

  // Derived data
  const signupLink = `${FRONTEND_URL}/?referral_code=${referralCode}`;
  const telegramDeepLink = `${FRONTEND_URL}?startapp=${referralCode}`;

  // Fetch referral data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(fetchReffralData());
      } catch (error) {
        console.error("Error fetching referral data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dispatch]);

  // Generate QR code when referral code is available
  useEffect(() => {
    if (referralCode) {
      generateQRCode(telegramDeepLink);
    }
  }, [referralCode]);
 useEffect(() => {
    // Disable drag and touch gestures
    const preventDrag = (e) => e.preventDefault();
    const preventTouch = (e) => e.preventDefault();

    document.addEventListener("dragstart", preventDrag);
    document.addEventListener("touchmove", preventTouch, { passive: false });

    return () => {
      document.removeEventListener("dragstart", preventDrag);
      document.removeEventListener("touchmove", preventTouch);
    };
  }, []);

  const generateQRCode = async (link) => {
    try {
      const qrCode = await QRCode.toDataURL(link);
      setQrCodeUrl(qrCode);
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

 const handleShareClick = () => {
  if (referralCode) {
    try {
      // Construct a more engaging message with emojis
const message = encodeURIComponent(`
🌟 Join *UnitradeHub* today! 🚀

Pay ₹300, get 2000 coins instantly 💰, and start earning more by completing tasks and referring friends. 🏆  

📲 Register now using my referral link: ${telegramDeepLink}

🎉 Don't miss this chance to earn effortlessly!
`);

      // Construct the Telegram deep link
      const telegramLink = `https://t.me/share/url?url=${encodeURIComponent(
        telegramDeepLink
      )}&text=${message}`;

      // Open the Telegram link
      const opened = window.open(telegramLink, "_blank");

      if (!opened) {
        console.error("Failed to open Telegram link.");
        toast.error("Failed to open Telegram. Make sure Telegram is installed.");
      } else {
        console.log("Telegram link opened successfully.");
      }
    } catch (error) {
      console.error("Error sharing via Telegram:", error);
      toast.error("There was an error opening the Telegram link.");
    }
  } else {
    toast.error("Referral link is not available yet.");
  }
};


  // Copy referral link to clipboard
  const handleCopyClick = () => {
    if (referralCode) {
      navigator.clipboard.writeText(telegramDeepLink);
      setToastMessage("Referral deep link copied!");
      setShowToast(true);
    } else {
      toast.error("Referral link is not available yet.");
    }
  };

  // Display loader while data is loading


  return (
    <div className="bg-white flex justify-center font-Inter h-screen w-full overflow-hidden relative">
      <ToastNotification
        message={toastMessage}
        show={showToast}
        setShow={setShowToast}
      />
         {loading ? (
        <Loader />
      ) :
      <div className="w-full bg-black text-white min-h-screen flex flex-col max-w-lg relative ">
           {/* Header Section */}
           <Header/>
           <div style={{
            position: 'absolute',
            width: '239px',
            height: '239px',
            left: '160px',
            top: '116px',
            background: 'rgba(99, 57, 249, 0.25',
            filter: 'blur(100px)',
          }}>
            <img src="src/images/Ellipse 9.png" alt="" style={{ width: '100%', height: '100%' }} />
          </div>
        <div className="flex-grow relative z-0 py-6 top-10">
          {/* <Logo /> */}
          <div className="space-y-2 text-center">
            <div className="flex justify-center">
              <img
                src="https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcRBmgzOP_BRigp_fok6RcoiBegiIttLQ8fFVaZ-Hbj3YWdrjJ24"
                alt="User Avatar"
                className="w-22 h-20 md:w-32 md:h-32 rounded-full shadow-lg"
              />
            </div>
            <h2 className="text-center text-3xl font-bold text-white">
              Invite Friends
            </h2>
            <div className="flex justify-center items-center p-2 sm:p-3 rounded-lg mb-4 shadow-sm">
              {qrCodeUrl ? (
                <img
                  className="rounded-lg"
                  src={qrCodeUrl}
                  alt="Signup QR Code"
                />
              ) : (
                <p>Loading QR Code...</p>
              )}
            </div>
            <div onClick={handleShareClick} className="flex justify-center items-center mb-4">
              <button className="w-10/12 py-3 sm:py-4 text-sm sm:text-base font-semibold text-black bg-white rounded-lg shadow-md transform transition duration-300 ease-in-out hover:scale-105 hover:bg-gray-200 hover:shadow-lg">
                Share on Telegram
              </button>
            </div>
            <div onClick={handleCopyClick} className="flex justify-center items-center">
              <button className="w-10/12 py-3 sm:py-4 text-sm sm:text-base font-semibold text-black bg-white rounded-lg shadow-md transform transition duration-300 ease-in-out hover:scale-105 hover:bg-gray-200 hover:shadow-lg">
                Copy Link
              </button>
            </div>
          </div>
        </div>
        <div style={{
            position: 'absolute',
            width: '243px',
            height: '243px',
            left: '-91px',
            top: '423px',
            background: 'rgba(99, 57, 249, 0.25)',
            filter: 'blur(100px)',
          }}>
            <img src="src/images/Ellipse 8.png" alt="" style={{ width: '100%', height: '100%' }} />
          </div>
      </div>
}
              <Footer />
    </div>
  );
}

export default Friend;
