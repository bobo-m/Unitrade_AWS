import React, { useState, useEffect, useMemo } from "react";
import { FaChevronLeft } from "react-icons/fa";
import Footer from "./Footer";
import { useNavigate } from "react-router-dom";
import {
  fetchHistory,
  fetchWithdrawal,
  userApprove,
} from "../../store/actions/homeActions";
import { useDispatch, useSelector } from "react-redux";
import Loader from "../components/Loader";
import Swal from "sweetalert2";

function Received() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux states
  const historyData = useSelector(
    (state) => state.apiData.data.history?.data || []
  );
  const withdrawal = useSelector(
    (state) => state.apiData.data.withdrawal?.data || []
  );
  const [activeTab, setActiveTab] = useState("History");

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(fetchHistory());
        await dispatch(fetchWithdrawal());
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dispatch]);

  // Group transactions by date
  const groupByDate = (data) =>
    data.reduce((acc, item) => {
      if (item.type !== "transfer" || item.coin_operation !== "cr") {
        return acc;
      }
      const date = new Date(item.transaction_date).toLocaleDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(item);
      return acc;
    }, {});

  // Memoized grouped transactions
  const groupedTransactions = useMemo(
    () => groupByDate(historyData),
    [historyData]
  );

  // Telegram API adjustments
  useEffect(() => {
    const tg = window.Telegram.WebApp;
    tg.disableClosingConfirmation();
    tg.disableVerticalSwipes();
  }, []);

  return (
    <div className="bg-white flex justify-center min-h-screen font-Inter overflow-hidden">
      {loading ? (
        <Loader />
      ) : (
        <div className="bg-black text-white w-full max-w-lg flex flex-col px-4 overflow-hidden">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={() => navigate(-1)}
              className="text-2xl text-white cursor-pointer"
            >
              <FaChevronLeft />
            </button>
          </div>

          <h1 className="text-center font-medium text-xl">Received</h1>

          {/* Transactions List */}
          <div className="flex-grow py-4 h-[400px] overflow-y-auto">
            {Object.keys(groupedTransactions).length > 0 ? (
              Object.keys(groupedTransactions).map((date) => (
                <div key={date} className="mb-6">
                  <p className="text-sm font-semibold text-gray-400 mb-3">
                    {date}
                  </p>
                  {groupedTransactions[date].map((transaction, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-3"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src="src/assets/logo/U.png"
                          className="w-5 h-5"
                          alt=""
                        />
                        <span className="flex flex-col">
                          <h3 className="text-sm font-semibold capitalize">
                            {transaction.title}
                          </h3>
                          <p className="text-xs">
                            Sender: {transaction.user_name}
                          </p>
                        </span>
                      </div>
                      <p className="text-sm font-medium">
                        {transaction.pending_coin === 0
                          ? `${transaction.earn_coin} Coins`
                          : ` ${transaction.pending_coin} Coins`}
                      </p>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400">
                No transactions found.
              </p>
            )}
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}

export default Received;
