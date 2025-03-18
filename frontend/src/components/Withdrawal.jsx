import React, { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { BiSolidUpvote, BiHistory } from "react-icons/bi";
import { BsPersonFillCheck, BsCurrencyRupee } from "react-icons/bs";
import { IoMdThumbsUp } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import WithdrawCoin from "../utils/WithdrawCoin";
import Footer from "./Footer";
import Sell from "../utils/Sell";
import History from "../utils/History";
import { useDispatch, useSelector } from "react-redux";
import { fetchAPIData, fetchMeData } from "../../store/actions/homeActions";
import { shareCoins } from "../../store/actions/coinActions";
import ShareCoin from "../utils/ShareCoin";
import { toast, ToastContainer } from "react-toastify";
import Loader from "../components/Loader";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import Header from "./Header";
import ellipse9 from "../images/Ellipse 9.png";
import ellipse8 from "../images/Ellipse 8.png";
import logo from "../assets/logo/U.png";
import { BACKEND_URL } from "../config";
import { fetcherGet, fetcherPost } from "../../store/fetcher";

function Withdrawal() {
  const MySwal = withReactContent(Swal);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  const [showReceivePopup, setShowReceivePopup] = useState(false);
  const [showSendPopup, setShowSendPopup] = useState(false);
  const [showHistoryPopup, setShowHistoryPopup] = useState(false);
  const [showWithdrawal, setShowWithdrawalPopup] = useState(false);
  const [sharePopup, setSharePopup] = useState(false);
  const [selectedCoinRate, setSelectedCoinRate] = useState(null);
  const [company_id, setCompany_id] = useState(null);
  const [expandedCompanyId, setExpandedCompanyId] = useState(null); // State to track the expanded company
  const [apiError, setApiError] = useState(""); // State for error message for the name of the receiver

  // Toggle function to expand/collapse a row
  const toggleExpandRow = (companyId) => {
    // If the clicked row is already expanded, collapse it (set null)
    if (expandedCompanyId === companyId) {
      setExpandedCompanyId(null);
    } else {
      // Otherwise, expand the clicked row
      setExpandedCompanyId(companyId);
    }
  };
  const toggleSharePopup = () => {
    setSharePopup(!sharePopup);
    setSendData({ amount: "", recipientReferralCode: "" });
  };
  const [sendData, setSendData] = useState({
    recipientReferralCode: "",
    amount: "",
  });
  const { success } = useSelector((state) => ({
    success: state.coinData.success,
  }));
  const [receiveData, setReceiveData] = useState({
    toAddress: "",
    fromAddress: "",
    amount: "",
  });
  const [sellData, setSellData] = useState({
    user_id: "",
    company_id: "",
    address: "",
    amount: "",
    coin_rate: "",
  });
  const dispatch = useDispatch();
  const { data, error } = useSelector((state) => state.moneyData);
  const apiCompanies = useSelector((state) => state.apiData.data.apicompanies);
  const apiData = useSelector((state) => state.apiData.data);
  const userData = (apiData && apiData.me && apiData.me.data) || null;
  // console.log('apiCompanies', apiCompanies)
  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(fetchAPIData("apiCompanies"));
        await dispatch(fetchMeData());
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error("Error fetching data", error);
      }
    };
    fetchData();
  }, [dispatch]);

  const handleIconClick = (index) => {
    setActiveIndex(index);
    // Close all pop-ups when clicking a different icon
    if (index === 0) {
      setShowReceivePopup(true);
      setShowSendPopup(false);
      setShowHistoryPopup(false);
    } else if (index === 1) {
      setShowReceivePopup(false);
      setShowSendPopup(true);
      setShowHistoryPopup(false);
    } else if (index === 2) {
      setShowReceivePopup(false);
      setShowSendPopup(false);
      // setShowHistoryPopup(true);
      navigate("/history");
    } else if (index === 3) {
      setShowReceivePopup(false);
      setShowSendPopup(false);
      navigate("/received");
    }
  };

  const closePopups = () => {
    setShowReceivePopup(false);
    setShowSendPopup(false);
    setShowHistoryPopup(false);
  };
  const togglePopup = () => {
    setShowPopup(!showPopup);
  };
  const handleSellClick = (coinRanges, company_id) => {
    const { max_coins, min_coins, rate } = coinRanges;
    if (min_coins > max_coins) {
      console.log("Error: Minimum coins cannot be greater than maximum coins!");
    } else {
      console.log("Processing the sell operation...");
      // Example API call or further logic
    }
    setSelectedCoinRate(coinRanges); // Set the selected coin rate
    setCompany_id(company_id); // Set the selected coin rate
    togglePopup(); // Open the popup
  };
  const toggleWithdrawalPopup = () => {
    setShowWithdrawalPopup(!showWithdrawal);
  };
  const [inputValue, setInputValue] = useState("");
  const qrRef = useRef(null);

  useEffect(() => {
    if (qrRef.current) {
      generateQRCode(inputValue);
    }
  }, [inputValue]);

  const generateQRCode = (text) => {
    QRCode.toCanvas(qrRef.current, text, (error) => {
      if (error) {
        console.error(error);
      }
    });
  };

  const handleReceiveMoney = () => {
    const id = 1; // Replace with the actual id logic as needed
    const { toAddress, fromAddress, amount } = receiveData;
    dispatch(receiveMoney(id, toAddress, fromAddress, amount));
    closePopups(); // Close popup after dispatching the action
  };
  const handleReceiveInputChange = (e) => {
    const { name, value } = e.target;
    setReceiveData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSendInputChange = async (e) => {
    const { name, value } = e.target;
    setSendData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === "recipientReferralCode") {
      const referralCode = value.toUpperCase();
      const referralCodeRegex = /^UNITRADE\d+$/;
      if (!referralCodeRegex.test(referralCode)) {
        setSendData((prevData) => {
          const { receiver, ...filteredData } = prevData;
          return filteredData;
        });
        setApiError("");
      } else {
        try {
          const { userName } = await fetcherPost(
            `${BACKEND_URL}/api/v1/user-name`,
            {
              referralCode: referralCode,
            }
          );
          setSendData((prevData) => ({
            ...prevData,
            receiver: userName,
          }));
          setApiError("");
        } catch (error) {
          setApiError("No user found with the referral code");
          setSendData((prevData) => {
            const { receiver, ...filteredData } = prevData;
            return filteredData;
          });
        }
      }
    }
  };
  const handleSendMoney = async () => {
    if (!sendData.amount || !sendData.recipientReferralCode) {
      toast.warn("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      await dispatch(shareCoins(sendData));
      dispatch(fetchMeData());
    } catch (error) {
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // console.log('Success:', success);
    // console.log('Error:', error);

    if (success) {
      setSharePopup(false); // Close the popup on success

      // Reset the form state if needed
      setSendData({
        amount: "",
        recipientReferralCode: "",
      });
    } else if (error) {
    }
  }, [success, error]);
  const handleSellChange = (e) => {
    const { name, value } = e.target;
    setSellData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSellSubmit = (e) => {
    e.preventDefault();

    const user_id = "your_user_id"; // Replace with actual user_id
    const company_id = "your_company_id"; // Replace with actual company_id

    dispatch(sellMoney(user_id, company_id, sellData));
  };

  // SweetAlert function for attractive alert
  const showAlert = () => {
    MySwal.fire({
      title: "Insufficient Referrals!",
      text: "You need to connect with at least 2 people to sell coins.",
      icon: "warning",
      confirmButtonText: "Okay",
      buttonsStyling: true,
      customClass: {
        popup:
          "bg-gray-800 text-white rounded-lg shadow-lg w-[90%] sm:w-[400px]", // Adjust width for mobile
        title: "text-white text-sm sm:text-base font-bold", // Smaller text for mobile, larger for larger screens
        content: "text-gray-300 text-xs sm:text-sm", // Adjust description size for mobile
        confirmButton:
          "bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg text-xs sm:text-sm", // Button size adjustment
      },
    });
  };

  // Handle Button Click
  const handleButtonClick = (coinRanges, companyId) => {
    if (userData && userData.referral_count >= 2) {
      // Open popup or perform the Sell action
      handleSellClick(coinRanges, companyId);
    } else {
      // Show SweetAlert
      showAlert();
    }
  };

  // SweetAlert function for attractive alert
  const showAlertShare = () => {
    MySwal.fire({
      title: "Insufficient Referrals!",
      text: "You need to connect with at least 2 people to share coins.",
      icon: "warning",
      confirmButtonText: "Okay",
      buttonsStyling: true,
      customClass: {
        popup:
          "bg-gray-800 text-white rounded-lg shadow-lg w-[90%] sm:w-[400px]", // Adjust width for mobile
        title: "text-white text-sm sm:text-base font-bold", // Smaller text for mobile, larger for larger screens
        content: "text-gray-300 text-xs sm:text-sm", // Adjust description size for mobile
        confirmButton:
          "bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg text-xs sm:text-sm", // Button size adjustment
      },
    });
  };
  // Handle Button Click
  const handleButtonShare = () => {
    if (userData && userData.referral_count >= 2) {
      // Open popup or perform the Sell action
      toggleSharePopup();
    } else {
      // Show SweetAlert
      showAlertShare();
    }
  };

  return (
    <>
      <div className="bg-white flex justify-center min-h-screen font-Inter overflow-hidden">
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
          draggable
          theme="dark"
        />
        {loading ? (
          <Loader />
        ) : (
          // <div className="w-full bg-black text-white flex flex-col max-w-lg  overflow-hidden">
          <div className="w-full bg-black text-white flex flex-col max-w-lg h-screen ">
            {/* Header Section */}
            <Header />
            <div
              style={{
                position: "absolute",
                width: "239px",
                height: "239px",
                left: "160px",
                top: "116px",
                background: "rgba(99, 57, 249, 0.25",
                filter: "blur(100px)",
              }}
            >
              <img
                src={ellipse9}
                alt=""
                style={{ width: "100%", height: "100%" }}
              />
            </div>
            <div
              style={{
                position: "absolute",
                width: "243px",
                height: "243px",
                left: "-91px",
                top: "423px",
                background: "rgba(99, 57, 249, 0.25)",
                filter: "blur(100px)",
              }}
            >
              <img
                src={ellipse8}
                alt=""
                style={{ width: "100%", height: "100%" }}
              />
            </div>
            <div className="flex-grow relative z-0  px-4">
              {/* <Logo /> */}
              <div
                className="relative p-4 rounded-lg shadow-lg"
                style={{
                  backgroundImage: "url(src/assets/gif/star.gif)", // Provide the path to your GIF here
                  backgroundSize: "cover", // Ensures the GIF covers the entire background
                  backgroundPosition: "center", // Centers the GIF
                  backgroundRepeat: "no-repeat", // Prevents the GIF from repeating
                }}
              >
                <h2 className="text-center text-2xl mb-2 font-Inter">Wallet</h2>
                <div className="flex items-center justify-center font-Inter leading-3 text-[34px] font-extrabold mb-4">
                  <img src={logo} alt="Logo" className="w-8 h-8" />
                  <p>{userData ? userData.coins : "0"}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  {/* Send Button */}
                  <div
                    onClick={() => handleButtonShare()}
                    className="text-white mx-auto cursor-pointer flex flex-col items-center transition duration-300 ease-in-out opacity-100"
                  >
                    <div className="rounded-full w-8 h-8 bg-[#303030] flex justify-center items-center">
                      <BiSolidUpvote size={22} />
                    </div>
                    <span className="text-xs text-center font-Inter">Send</span>
                  </div>

                  {/* Received Button */}
                  <div
                    onClick={() => handleIconClick(3)}
                    className="text-white mx-auto cursor-pointer flex flex-col items-center transition duration-300 ease-in-out opacity-100"
                  >
                    <div className="rounded-full w-8 h-8 bg-[#303030] flex justify-center items-center rotate-180">
                      <BiSolidUpvote size={22} />
                    </div>
                    <span className="text-xs text-center font-Inter">
                      Received
                    </span>
                  </div>

                  {/* History Button */}
                  <div
                    onClick={() => handleIconClick(2)}
                    className="text-white mx-auto cursor-pointer flex flex-col items-center transition duration-300 ease-in-out opacity-100"
                  >
                    <div className="rounded-full w-8 h-8 bg-[#303030] flex justify-center items-center">
                      <BiHistory size={22} />
                    </div>
                    <span className="text-xs text-center font-Inter">
                      History
                    </span>
                  </div>
                </div>

                <p className="text-center font-Inter text-xs text-[#f5eded] mb-4">
                  Sell your points at your chosen price, anytime and anywhere.
                  Get instant cash withdrawals with no delays!
                </p>
              </div>

              <hr className="border-gray-300 mb-4 w-full mx-auto" />

              {/* Co-Companies List */}
              <div className="flex flex-col h-[400px] space-y-4 overflow-y-auto hide-scrollbar pb-8">
                {apiCompanies &&
                apiCompanies.data &&
                apiCompanies.data.length > 0 ? (
                  apiCompanies.data.map((company) => (
                    <div key={company.company_id} className="py-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-sky-400 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold uppercase">
                              {company.company_name.charAt(0)}
                            </span>
                          </div>
                          <span className="text-sm font-medium capitalize">
                            {company.company_name}
                          </span>
                        </div>
                      </div>

                      {/* Always show the first coin range */}
                      {company.coin_ranges &&
                        company.coin_ranges.length > 0 && (
                          <div className="flex justify-between items-start mb-1">
                            <div className="leading-4">
                              <p>
                                <span className="text-xs font-bold text-[#5B5A5C]">
                                  Coin
                                </span>
                                <span className="text-xs font-medium ml-2 text-[#B8B7BA]">
                                  {company.coin_ranges[0].min_coins} -{" "}
                                  {company.coin_ranges[0].max_coins} : Rate{" "}
                                  {company.coin_ranges[0].rate}
                                </span>
                              </p>
                            </div>
                          </div>
                        )}

                      {/* Toggle button to expand/collapse */}
                      {company.coin_ranges &&
                        company.coin_ranges.length > 1 && (
                          <>
                            {/* <button
                            onClick={() => toggleExpandRow(company.company_id)}
                            className="text-xs font-medium text-blue-500 hover:underline"
                          >
                            {expandedCompanyId === company.company_id
                              ? "Show Less"
                              : "Show More"}
                          </button> */}

                            {/* Show remaining coin ranges if expanded */}
                            {expandedCompanyId === company.company_id &&
                              company.coin_ranges
                                .slice(1)
                                .map((range, index) => (
                                  <div
                                    key={index}
                                    className="flex justify-between items-start mb-1"
                                  >
                                    <div className="leading-4">
                                      <p>
                                        <span className="text-xs font-bold text-[#5B5A5C]">
                                          Coin
                                        </span>
                                        <span className="text-xs font-medium ml-2 text-[#B8B7BA]">
                                          {range.min_coins} - {range.max_coins}{" "}
                                          : Rate {range.rate}
                                        </span>
                                      </p>
                                    </div>
                                  </div>
                                ))}
                            {/* Toggle button to expand/collapse */}
                            <button
                              onClick={() =>
                                toggleExpandRow(company.company_id)
                              }
                              className="text-xs font-medium text-blue-500 hover:underline flex items-center gap-1"
                            >
                              {expandedCompanyId === company.company_id ? (
                                <>
                                  <span>Show Less</span>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className="w-4 h-4"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M19 14l-7-7-7 7"
                                    />
                                  </svg>
                                </>
                              ) : (
                                <>
                                  <span>Show More</span>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className="w-4 h-4"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M5 10l7 7 7-7"
                                    />
                                  </svg>
                                </>
                              )}
                            </button>
                          </>
                        )}

                      <div className="flex justify-between items-center py-1.5">
                        <div className=""></div>
                        <button
                          className="leading-none px-3 py-1.5 text-sm rounded-full bg-red-600 flex text-white font-semibold hover:bg-red-500 transition duration-200 ease-in-out"
                          onClick={() =>
                            handleButtonClick(
                              company.coin_ranges,
                              company.company_id
                            )
                          }
                        >
                          Sell
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No companies found</p>
                )}
              </div>
            </div>

            {/* <div style={{
            position: 'absolute',
            width: '243px',
            height: '243px',
            left: '-91px',
            top: '423px',
            background: 'rgba(99, 57, 249, 0.25)',
            filter: 'blur(100px)',
          }}>
            <img src="src/images/Ellipse 8.png" alt="" style={{ width: '100%', height: '100%' }} />
          </div> */}
          </div>
        )}
        <Footer />

        {showWithdrawal && (
          <WithdrawCoin
            toggleWithdrawalPopup={toggleWithdrawalPopup}
            handleReceiveMoney={handleReceiveMoney}
            handleReceiveInputChange={handleReceiveInputChange}
            receiveData={receiveData}
          />
        )}
        {showPopup && (
          <Sell
            togglePopup={togglePopup}
            handleSellChange={handleSellChange}
            handleSellSubmit={handleSellSubmit}
            coinRanges={selectedCoinRate}
            userData={userData}
            company_id={company_id}
          />
        )}
        {sharePopup && (
          <ShareCoin
            toggleSharePopup={toggleSharePopup}
            handleSendInputChange={handleSendInputChange}
            handleSendMoney={handleSendMoney}
            sendData={sendData}
            setSendData={setSendData}
            userData={userData}
            apiError={apiError}
          />
        )}
        {showHistoryPopup && <History closePopups={closePopups} />}
      </div>
    </>
  );
}

export default Withdrawal;
