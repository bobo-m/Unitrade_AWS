import React, { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { BiSolidUpvote, BiHistory } from "react-icons/bi";
import { BsPersonFillCheck, BsCurrencyRupee } from "react-icons/bs";
import { IoMdThumbsUp } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import Footer from "./Footer";
import Sell from "../utils/Sell";
import History from "../utils/History";
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserData, fetchCompanyData } from '../../store/actions/homeActions';
import { shareCoins } from "../../store/actions/coinActions";
import ShareCoin from "../utils/ShareCoin";
import { toast, ToastContainer } from "react-toastify";
import Loader from '../components/Loader';
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

function Withdrawal() {
  const MySwal = withReactContent(Swal);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);
  const [showHistoryPopup, setShowHistoryPopup] = useState(false);
  const [sharePopup, setSharePopup] = useState(false);
  const [selectedCoinRate, setSelectedCoinRate] = useState(null);
  const [userDetail, setUserDetail] = useState({
    tranction_coin: '',
    tranction_rate: '',
    transaction_id: '',
    transction_amount: '',
    upi_id: '',
    user_name: ''
  })
  const toggleSharePopup = () => {
    setSharePopup(!sharePopup);
  };
  const [sendData, setSendData] = useState({
    upi_id: '',
    sell_coin: ''
  });
  const { success } = useSelector((state) => ({
    success: state.coinData.success,

  }));

  const [sellData, setSellData] = useState({
    user_id: "",
    company_id: "",
    address: "",
    amount: "",
    coin_rate: "",
  });
  const dispatch = useDispatch();
  const { data, error } = useSelector((state) => state.moneyData);
  const apiUser = useSelector((state) => state.apiData.data.user);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(fetchUserData());
        await dispatch(fetchCompanyData());
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
      setShowHistoryPopup(false);
    } else if (index === 1) {
      setShowHistoryPopup(false);
    } else if (index === 2) {
      // setShowHistoryPopup(true);
      navigate('/history')
    }
  };

  const closePopups = () => {
    setShowHistoryPopup(false);
  };
  const togglePopup = () => {
    setShowPopup((prev) => !prev);
  };
  const resetUserDetail = () => {
    setUserDetail(null);
  };
  const handleSellClick = (amount, id, coin, upiId, userName) => {
    setUserDetail({ amount, id, coin, upiId, userName });
    togglePopup(); // Open the popup
    console.log('setUserDetail', setUserDetail)
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


  const handleSendInputChange = (e) => {
    const { name, value } = e.target;
    setSendData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const handleSendMoney = async () => {
    if (!sendData.sell_coin || !sendData.upi_id) {
      toast.warn("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      await dispatch(shareCoins(sendData));
      // toast.success("Coins sent successfully!");
    } catch (error) {
      toast.error("Failed to send coins.");
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
        sell_coin: '',
        upi_id: '',
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
        popup: "bg-gray-800 text-white rounded-lg shadow-lg w-[90%] sm:w-[400px]", // Adjust width for mobile
        title: "text-white text-sm sm:text-base font-bold", // Smaller text for mobile, larger for larger screens
        content: "text-gray-300 text-xs sm:text-sm", // Adjust description size for mobile
        confirmButton: "bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg text-xs sm:text-sm", // Button size adjustment
      },
    });
  };



  return (

    <>

      <div className="bg-white flex justify-center min-h-screen font-Inter overflow-hidden">
        <ToastContainer
          position="top-right"
          autoClose={1000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
          draggable
          theme="dark"
        />
        {loading ? (
          <Loader />
        ) :
          <div className="w-full bg-black text-white flex flex-col max-w-lg px-4 overflow-hidden">
            <div className="flex-grow relative z-0   top-10">
              {/* <Logo /> */}
              <div className="bg-black text-center py-4 ">
                <p className="text-2xl font-semibold">◥𝐔ɴɪᴛᴇᴅ々◤</p>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {/* Send Button */}
                <div
                  onClick={() => toggleSharePopup()}
                  className="text-white mx-auto cursor-pointer flex flex-col items-center transition duration-300 ease-in-out opacity-100"
                >
                  <div className="rounded-full w-8 h-8 bg-[#303030] flex justify-center items-center">
                    <BiSolidUpvote size={22} />
                  </div>
                  <span className="text-xs text-center font-Inter">Send</span>
                </div>

                {/* History Button */}
                <div
                  onClick={() => handleIconClick(2)}
                  className="text-white mx-auto cursor-pointer flex flex-col items-center transition duration-300 ease-in-out opacity-100"
                >
                  <div className="rounded-full w-8 h-8 bg-[#303030] flex justify-center items-center">
                    <BiHistory size={22} />
                  </div>
                  <span className="text-xs text-center font-Inter">History</span>
                </div>
              </div>

              <p className="text-center font-Inter text-xs text-[#f5eded] mb-4">
                Sell your points at your chosen price, anytime and anywhere. Get instant cash withdrawals with no delays!
              </p>

              <hr className="border-gray-300 mb-4 w-full mx-auto" />

              {/* Co-Companies List */}
              <div id="content" className="flex flex-col h-[400px] space-y-4 overflow-y-auto hide-scrollbar">
                {apiUser && apiUser.transactions && apiUser.transactions.length > 0 ? (
                  apiUser.transactions && apiUser.transactions.map((company, index) => (
                    <div key={index} className="py-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-sky-400 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold uppercase ">{company.user_name.charAt(0)}</span>
                          </div>
                          <span className="text-sm font-medium capitalize">{company.user_name}</span>
                        </div>
                        <div className="text-sm font-medium text-[#5B5A5C]">123 Orders (30D) | 98%</div>
                      </div>
                      <div className="flex justify-between items-center py-1.5">
                        <p className="font-bold flex  font-Inter items-center  ">
                          <BsCurrencyRupee className="" />  <span className="text-[20px] "> {company.transction_amount}</span></p>
                        <div className="text-sm font-medium text-[#5B5A5C]">Online</div>
                      </div>
                      <div className="flex justify-between items-start">
                        <div className="leading-4 ">
                          <p>
                            <span className="text-xs font-bold text-[#5B5A5C]">Coin</span>
                            <span className="text-xs font-medium ml-2 text-[#B8B7BA]">{company.tranction_coin}</span>
                          </p>
                          <p>
                            <span className="text-xs font-bold text-[#5B5A5C]">Coin Rate</span>
                            <span className="text-xs font-medium ml-2 text-[#B8B7BA]">{company.tranction_rate}</span>
                          </p>
                        </div>
                        <p className="flex items-start text-green-500 gap-0.5 self-start"> {/* Added self-start */}
                          <IoMdThumbsUp size={24} className="pt-1" />
                          <span className="text-sm font-medium leading-loose">100%</span>
                        </p>
                      </div>
                      <div className="flex justify-between items-center py-1.5 ">
                        <div className="">

                        </div>
                        {company.status === 'unapproved' && (
                          <button
                            className="leading-none px-3 py-1.5 text-sm rounded-full bg-red-600 flex text-white font-semibold hover:bg-red-500 transition duration-200 ease-in-out"
                            onClick={() => handleSellClick(company.transction_amount, company.transaction_id, company.tranction_coin, company.upi_id, company.user_name)}
                          >
                            Check
                          </button>
                        )}

                        {company.status === 'waiting' && (
                          <button
                            className="leading-none px-3 py-1.5 text-sm rounded-full bg-gray-600 flex text-white/70 font-semibold cursor-not-allowed"
                            disabled
                          >
                            Waiting
                          </button>
                        )}

                        {company.status === 'approved' && (
                          <button
                            className="leading-none px-3 py-1.5 text-sm rounded-full bg-green-600 flex text-white font-semibold"
                            disabled
                          >
                            Approved
                          </button>
                        )}
                        
                      </div>


                    </div>

                  )

                  )) : ""}
              </div>
            </div>


          </div>
        }
        <Footer />


        {
          showPopup && <Sell togglePopup={togglePopup} handleSellChange={handleSellChange} handleSellSubmit={handleSellSubmit} resetUserDetail={resetUserDetail}
            userDetail={userDetail} />
        }
        {
          sharePopup && <ShareCoin
            toggleSharePopup={toggleSharePopup}
            handleSendInputChange={handleSendInputChange}
            handleSendMoney={handleSendMoney}
            sendData={sendData}
            setSendData={setSendData}
          />
        }
        {
          showHistoryPopup && <History closePopups={closePopups} />
        }
      </div>
    </>




  );
}

export default Withdrawal;
