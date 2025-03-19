import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "../config";
import Loader from "./Loader";

function PaymentStatus() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id");
  const userId = searchParams.get("user_id");
  const [status, setStatus] = useState("Verifying Payment...");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyPayment = async () => {
      if (!orderId) {
        setStatus("Invalid Request. Order Id missing");
      }
      setLoading(true);
      setError("");
      try {
        const response = await axios.post(
          `${BACKEND_URL}/api/v1/verify-payment`,
          {
            orderId,
            userId,
          }
        );
        const { success } = response.data;
        if (success) {
          setStatus("Payment Verified. Redirecting...");
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        } else {
          throw new Error("Verification failed");
        }
      } catch (error) {
        console.log(error);
        setError("Error verifying payment.");
        setStatus("");
      } finally {
        setLoading(false);
      }
    };
    verifyPayment();
  }, [orderId, navigate]);

  return (
    <div className="flex flex-col h-screen w-screen items-center justify-center">
      <h1 className="text-white text-center text-2xl mt-10 px-5">
        {error ? error : status}
      </h1>
      {error && (
        <button
          className="mt-10 text-black bg-white px-3 py-2 rounded"
          onClick={() => navigate(`/payment/${userId}`)}
        >
          Try Again
        </button>
      )}
      {loading && <Loader />}
    </div>
  );
}

export default PaymentStatus;
