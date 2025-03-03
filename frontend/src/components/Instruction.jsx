import React from "react";
import { FaArrowLeft, FaCoins, FaShareAlt, FaTasks, FaSignInAlt, FaHandshake } from "react-icons/fa";

const InstructionPage = () => {
  return (
    <div className="bg-black text-white min-h-screen px-4 py-6 relative">
      {/* Back Button */}
      <button
        className="absolute top-4 left-4 flex items-center bg-gray-700 text-white px-3 py-2 rounded-full shadow-md hover:bg-gray-600 transition-all"
        onClick={() => window.history.back()}
      >
        <FaArrowLeft className="mr-2" />
        <span className="text-sm font-medium">Back</span>
      </button>

      {/* Page Title */}
      <h1 className=" text-2xl font-extrabold text-center pt-5 my-4">
        Unitrade Hub App: A Quick Guide
      </h1>

      {/* Instructions Section */}
      <div className="space-y-6 text-sm leading-relaxed">
        {/* Sign Up and Activate Section */}
        <div>
          <h2 className="text-xl font-semibold mb-2">
            1. Sign Up and Activate <span role="img" aria-label="signup">📱</span>
          </h2>
          <p>
            Create a free account on the Unitrade Hub app and make an initial payment of ₹300 to activate your account. <span role="img" aria-label="money">💸</span>
          </p>
          {/* <img
            src="https://via.placeholder.com/600x300"
            alt="Signup"
            className="w-full rounded-md my-4"
          /> */}
        </div>

        {/* Instant Coin Reward Section */}
        <div>
          <h2 className="text-xl font-semibold mb-2">
            2. Instant Coin Reward <span role="img" aria-label="coins">🪙</span>
          </h2>
          <p>
            Upon successful activation, you'll be instantly rewarded with 2000 coins. These coins serve as your in-app currency and can be used for various purposes, including redemption. <span role="img" aria-label="currency exchange">💱</span>
          </p>
          {/* <img
            src="https://via.placeholder.com/600x300"
            alt="Coins"
            className="w-full rounded-md my-4"
          /> */}
        </div>

        {/* Referral Program Section */}
        <div>
          <h2 className="text-xl font-semibold mb-2">
            3. Referral Program <span role="img" aria-label="referral">🔗</span>
          </h2>
          <p>
            <strong>Direct Referrals:</strong> Earn 200 coins for each friend you refer who signs up and makes the initial payment. <span role="img" aria-label="people">👥</span>
          </p>
          <p>
            <strong>Indirect Referrals:</strong> Continue earning coins from users referred by your direct referrals. <span role="img" aria-label="growth">📈</span>
          </p>
          {/* <img
            src="https://via.placeholder.com/600x300"
            alt="Referral"
            className="w-full rounded-md my-4"
          /> */}
        </div>

        {/* Coin Redemption Section */}
        <div>
          <h2 className="text-xl font-semibold mb-2">
            4. Coin Redemption <span role="img" aria-label="cash">💰</span>
          </h2>
          <p>
            Redeem accumulated coins for real money. Check the app for exchange rates and payout methods. <span role="img" aria-label="exchange">🔄</span>
          </p>
          {/* <img
            src="https://via.placeholder.com/600x300"
            alt="Redemption"
            className="w-full rounded-md my-4"
          /> */}
        </div>

        {/* Task-Based Earnings Section */}
        <div>
          <h2 className="text-xl font-semibold mb-2">
            5. Task-Based Earnings <span role="img" aria-label="tasks">📝</span>
          </h2>
          <p>
            <strong>Diverse Tasks:</strong> Earn coins by completing tasks like watching videos, following channels, or surveys. <span role="img" aria-label="video">📺</span>
          </p>
          <p>
            <strong>Coin Rewards:</strong> Additional coins for task completion can be redeemed. <span role="img" aria-label="reward">🎁</span>
          </p>
          {/* <img
            src="https://via.placeholder.com/600x300"
            alt="Tasks"
            className="w-full rounded-md my-4"
          /> */}
        </div>

        {/* Key Benefits */}
        <div>
          <h2 className="text-xl font-semibold mb-2">
            Key Benefits <span role="img" aria-label="star">⭐</span>
          </h2>
          <ul className="list-disc pl-4">
            <li>Quick Earnings: Instant rewards upon activation. ⚡</li>
            <li>Passive Income: Earn through direct and indirect referrals. 🤝</li>
            <li>Varied Tasks: Engaging options for earning more coins. 🌀</li>
            <li>Redemption: Coins can be converted into real money. 💳</li>
          </ul>
        </div>

        {/* Important Considerations */}
        <div>
          <h2 className="text-xl font-semibold mb-2">
            Important Considerations <span role="img" aria-label="exclamation">⚠️</span>
          </h2>
          <ul className="list-disc pl-4">
            <li>Initial Investment: ₹300 required upfront. 💼</li>
            <li>Terms and Conditions: Review rules and payout methods. 📑</li>
            <li>Legitimacy: Ensure the app's authenticity before investing. 🔍</li>
          </ul>
        </div>
      </div>

      {/* Footer Section */}
      <div className="text-center mt-8 text-sm text-gray-400">
        <p>
          Exercise caution with online earning opportunities. Conduct thorough research or consult a financial advisor. 💼
        </p>
      </div>
    </div>
  );
};

export default InstructionPage;
