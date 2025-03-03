import React, {useState  } from 'react';
import { ImCross } from "react-icons/im";

function ShareCoin({ toggleSharePopup, handleSendInputChange, handleSendMoney , sendData, loading, userData }) {
  const totalCoin = userData?.coins || 0; // Ensure totalCoin has a default value
  const refferalCode = userData?.referral_code || "";
  const [error, setError] = useState(''); // State for error message
  const handleAmountChange = (e) => {
    const inputValue = e.target.value;
    const validValue = inputValue.replace(/[^0-9]/g, ''); // Remove non-numeric characters
    
 // If the value contains decimals or negative signs, prevent the change
 if (validValue !== inputValue) {
  e.target.value = validValue; // Update input value with valid input
}

    // Validate the input value against totalCoin
    if (Number(inputValue) > totalCoin) {
      setError(`You have only ${totalCoin} coins available.`);
    } else {
      setError(''); // Clear error if input is valid
    }

    // Pass the value to the parent handler
    handleSendInputChange(e);
  };
  const handleReferralCodeChange = (e) => {
    const inputReferralCode = e.target.value;

    // Validate if the entered referral code is the same as the logged-in user's referral code
    if (inputReferralCode === refferalCode) {
      setError("You cannot use your own referral code.");
    } else {
      setError(''); // Clear error if the referral code is different
    }

    // Pass the value to the parent handler
    handleSendInputChange(e);
  };
  
  return (
    <div className="fixed inset-x-0 top-0 flex justify-center bg-transparent bg-opacity-40 backdrop-blur-sm z-50" onClick={toggleSharePopup}>
    <div className="bg-[#1B1A1A] p-4 sm:p-6 rounded-t-3xl shadow-xl w-full max-w-lg relative" onClick={(e) => e.stopPropagation()}>
        <button
            onClick={toggleSharePopup}
            className="absolute top-5 right-5 text-gray-400 hover:text-gray-200 focus:outline-none transition duration-300"
        >
            <ImCross size={20} />
        </button>

        <h2 className="text-lg sm:text-2xl font-semibold text-center mb-4 text-[#E0E0E0]">
            Share Coin with Your Frens
        </h2>

        {/* Description */}
        <p className="text-sm sm:text-base text-[#B0B0B0] text-center mb-6">
         Invite your friends to join and experience the benefits of our coin system together!
        </p>

            <input
                type="text"
                name="recipientReferralCode"
                value={sendData.recipientReferralCode}
                onChange={handleReferralCodeChange}
                placeholder="Referral Code"
                className="w-full uppercase p-2 sm:p-3 bg-[#2C2C2C] text-white border border-transparent rounded-lg mb-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#505050] transition duration-300 text-sm sm:text-base"
            />
            <input
                  type="text" // Set type to text to handle custom validation
                    name="amount"
                    value={sendData.amount}
                    onChange={handleAmountChange}
                placeholder="Enter Coin"
                className="w-full p-2 sm:p-3 bg-[#2C2C2C] text-white border border-transparent rounded-lg mb-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#505050] transition duration-300 text-sm sm:text-base"
            />
   {/* Error Message */}
   {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <div className="flex justify-center items-center">
            <button onClick={handleSendMoney} className="btn bg-[#3A3A3A] text-white font-semibold hover:bg-[#505050] transition duration-300 ease-in-out w-full py-2 sm:py-3 text-sm sm:text-base rounded-lg shadow-lg"     disabled={loading || error !== ''} >
            {loading ? (
              <div className="flex justify-center items-center">
                <div className="spinner"></div> {/* Custom spinner */}
              </div>
            ) : (
              'Submit' // Normal button text
            )}
            </button>
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
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    </div>
</div>
  )
}

export default ShareCoin
