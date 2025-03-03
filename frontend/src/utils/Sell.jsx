import React, { useState, useEffect } from 'react';
import { ImCross } from 'react-icons/im';
import { sellCoins } from '../../store/actions/withdrawalActions';
import { fetchMeData } from '../../store/actions/homeActions';
import { useDispatch } from 'react-redux';

// Reusable Input Component
const Input = ({ value, onChange, placeholder, readOnly = false, type = 'text' }) => (
    <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        className="w-full p-2 sm:p-3 bg-[#2C2C2C] text-white border border-transparent rounded-lg mb-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#505050] transition duration-300 text-sm sm:text-base"
    />
);

// Reusable Spinner Component
const Spinner = () => (
    <div className="spinner">
        <style jsx>{`
            .spinner {
                border: 4px solid #f3f3f3;
                border-top: 4px solid #000000;
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
);

function Send({ togglePopup, coinRanges, userData, company_id }) {
    const [loading, setLoading] = useState(false);
    const [rupeeValue, setRupeeValue] = useState(0);
    const [coinAmount, setCoinAmount] = useState('');
    const [selectedRate, setSelectedRate] = useState('');
    const [error, setError] = useState('');
    const upiId = userData?.upi_id; // Non-editable UPI ID
    const totalCoin = userData?.coins;
    const companyId = String(company_id);
    const dispatch = useDispatch();

    const handleInputChange = (e) => {
        const inputValue = e.target.value;
        const validValue = inputValue.replace(/[^0-9]/g, ''); // Remove non-numeric characters
      
        // If the value contains non-numeric characters, prevent the change
        if (validValue !== inputValue) {
          e.target.value = validValue; // Update input value with valid input
        }
      
        // Check for negative values and show an error
        if (validValue < 0) {
          setError('Amount cannot be negative.');
          setCoinAmount(0);
          return;
        }
      
        // Check if input exceeds total coins
        if (Number(validValue) > totalCoin) {
          setError(`You have only ${totalCoin} coins available.`);
        } else {
          setError('');
        }
      
        // Update coin amount with the valid input value
        setCoinAmount(validValue);
      
        // Determine the rate based on the input amount and update the selectedRate
        const range = coinRanges.find(
          (r) => Number(validValue) >= r.min_coins && Number(validValue) <= r.max_coins
        );
      
        if (range) {
          setSelectedRate(range.rate); // Update selected rate based on coin range
        } else {
          setSelectedRate(''); // Reset rate if input is out of range
        }
      };
      

    useEffect(() => {
        const totalRupees = coinAmount * selectedRate;
        setRupeeValue(totalRupees ? totalRupees.toFixed(2) : 0);
    }, [coinAmount, selectedRate]);

    const handleSubmit = () => {
        setError('');

        if (!coinAmount || isNaN(coinAmount) || coinAmount <= 0 || coinAmount > totalCoin) {
            setError('Please enter a valid coin amount within your balance.');
            return;
        }
        if (!selectedRate) {
            setError('No applicable rate found for the entered coin amount.');
            return;
        }
        if (!upiId || !companyId) {
            setError('Required UPI ID or Company ID is missing.');
            return;
        }

        setLoading(true);

        const payload = {
            upi_id: upiId,
            company_id: companyId,
            tranction_coin: Number(coinAmount),
            transction_amount: Number(rupeeValue),
            tranction_rate: Number(selectedRate),
        };

        dispatch(sellCoins(payload))
            .then(() => dispatch(fetchMeData()))
            .then(togglePopup)
            .catch(() => setError("Failed to sell coins. Please try again."))
            .finally(() => setLoading(false));
    };

    return (
        <div className="fixed inset-x-0 top-0 flex justify-center bg-transparent bg-opacity-40 backdrop-blur-sm z-50" onClick={togglePopup}>
            <div className="bg-[#1B1A1A] p-4 sm:p-6 rounded-t-3xl shadow-xl max-w-lg relative" onClick={(e) => e.stopPropagation()}>
                <button onClick={togglePopup} className="absolute top-5 right-5 text-gray-400 hover:text-gray-200 focus:outline-none transition duration-300">
                    <ImCross size={20} />
                </button>

                <h2 className="text-lg sm:text-2xl font-semibold text-center mb-4 text-[#E0E0E0]">Sell Coin</h2>

                <p className="text-sm sm:text-base text-[#B0B0B0] text-center mb-6">
                    Please enter the amount and your UPI ID to generate the QR code for selling your coins.
                </p>

                <Input
                    type="text"
                    value={coinAmount}
                    onChange={handleInputChange}
                    placeholder="Enter coin "
                />
                {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

                <div className="flex justify-between items-center w-full p-2 sm:p-3 bg-[#2C2C2C] text-white border border-transparent rounded-lg mb-3">
                    <div>Coin Rate: ₹{selectedRate || '0'}</div>
                    <div>= ₹{rupeeValue}</div>
                </div>

                <Input
                    value={upiId}
                    readOnly
                    placeholder="Your UPI ID"
                />

                <div className="flex justify-center items-center">
                    <button
                        onClick={handleSubmit}
                        className="btn bg-[#3A3A3A] text-white font-semibold hover:bg-[#505050] transition duration-300 ease-in-out w-full py-2 sm:py-3 text-sm sm:text-base rounded-lg shadow-lg flex justify-center"
                        disabled={loading}
                    >
                        {loading ? <Spinner /> : 'Submit'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Send;
