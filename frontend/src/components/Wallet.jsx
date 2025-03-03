// // Wallet.jsx
// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import StripeCheckout from "react-stripe-checkout";
// import { loadStripe } from "@stripe/stripe-js";

// // Make sure to replace with your own publishable key
// const stripePromise = loadStripe(
//   "pk_test_51PnIdKHpoW7RRzCtszk0uxuNSNXsFg5ZBNI0kO5zKw4jxtgLGse6qEYIjlszYr01WDWETooUjQapm3rzS1A9b9Ic00xNgSE6Xw"
// );

// const Wallet = ({ userId }) => {
//   const [walletBalance, setWalletBalance] = useState(0);
//   const [message, setMessage] = useState("");

//   useEffect(() => {
//     // Fetch user wallet balance when the component mounts
//     const fetchUser = async () => {
//       try {
//         const response = await axios.get(`/api/user/${userId}`);
//         setWalletBalance(response.data.walletBalance);
//       } catch (error) {
//         console.error("Error fetching user:", error);
//       }
//     };
//     fetchUser();
//   }, [userId]);

//   const handleToken = async (token) => {
//     try {
//       const response = await axios.post("/api/payment", { token, userId });
//       if (response.data.success) {
//         setWalletBalance(response.data.walletBalance);
//         setMessage("Payment successful! ₹100 has been added to your wallet.");
//       } else {
//         setMessage("Payment failed.");
//       }
//     } catch (error) {
//       console.error("Error processing payment:", error);
//       setMessage("Payment failed.");
//     }
//   };

//   const handleWithdraw = async () => {
//     try {
//       const response = await axios.post("/api/withdraw", { userId });
//       if (response.data.success) {
//         setWalletBalance(response.data.walletBalance);
//         setMessage("Withdrawal successful! ₹100 has been transferred.");
//       } else {
//         setMessage("Withdrawal failed.");
//       }
//     } catch (error) {
//       console.error("Error processing withdrawal:", error);
//       setMessage("Withdrawal failed.");
//     }
//   };

//   return (
//     <div>
//       <h2>Your Wallet Balance: ₹{walletBalance}</h2>

//       <StripeCheckout
//         stripeKey="pk_test_51PnIdKHpoW7RRzCtszk0uxuNSNXsFg5ZBNI0kO5zKw4jxtgLGse6qEYIjlszYr01WDWETooUjQapm3rzS1A9b9Ic00xNgSE6Xw" // Replace with your Stripe public key
//         token={handleToken}
//         amount={30000} // 300 Rs in paise
//         name="Add Money"
//         disabled={walletBalance > 0}
//       >
//         <button disabled={walletBalance > 0}>Add Money</button>
//       </StripeCheckout>

//       <button onClick={handleWithdraw} disabled={walletBalance === 0}>
//         Withdraw Funds
//       </button>

//       {message && <p>{message}</p>}
//     </div>
//   );
// };

// export default Wallet;
