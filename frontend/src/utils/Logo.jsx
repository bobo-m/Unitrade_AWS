import React, { useState } from "react";
import { logo } from '../images/index';
import { PiDotsThreeCircle } from "react-icons/pi";
import { ImCross } from "react-icons/im";

function Logo() {
  const [showPopup, setShowPopup] = useState(false);
  const togglePopup = () => {
    setShowPopup(!showPopup);
  };
  return (
<>
  <div className="relative flex items-center py-4 z-50">
    {/* First div with title and logo centered */}
    <div className="flex justify-center items-center space-x-1 absolute left-1/2 transform -translate-x-1/2">
      <h1 className=" text-xl font-extrabold">UNITRADE</h1>
      <img src={logo} alt="logo" className="w-6 h-6 mt-0.5" />
    </div>

    {/* Second div with the icon aligned to the right */}
    {/* <div className="ml-auto cursor-pointer" onClick={togglePopup}>
      <PiDotsThreeCircle size={38} />
    </div> */}
  </div>

  {showPopup && (
    <div
      className="fixed inset-0 flex items-start justify-center bg-transparent bg-opacity-40 backdrop-blur-sm z-50 " // Increased z-index to 60
      onClick={togglePopup}
    >
      <div
        className="bg-[#1B1A1A] p-4 sm:p-6 rounded-t-3xl shadow-xl w-full sm:max-w-lg relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={togglePopup}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-200 focus:outline-none transition duration-300"
        >
          <ImCross size={20} />
        </button>

        <h2 className="text-lg sm:text-2xl font-semibold text-center mb-4 text-[#E0E0E0]">Edit Profile</h2>

        {/* Profile Picture Upload */}
        <div className="flex justify-center mb-6">
          <label className="block w-24 h-24 rounded-full overflow-hidden bg-gray-500 cursor-pointer hover:bg-gray-600 transition duration-300 ease-in-out">
            <input type="file" className="hidden" />
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbuSgq4lgvJRBR0YjTaIPH_4ptfPau1pjDXksEpbnBzsoUjwkaYiGIxPrDflVNihee5wY&usqp=CAU"
              alt="Profile"
              className="object-cover w-full h-full"
            />
          </label>
        </div>

        {/* Name Field */}
        <input
          type="text"
          id="name"
          placeholder="Enter Your Name"
          className="w-full p-2 sm:p-3 bg-[#2C2C2C] text-white border border-transparent rounded-lg mb-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#505050] transition duration-300 text-sm sm:text-base"
        />

        {/* Email Field */}
        <input
          type="email"
          id="email"
          placeholder="Enter Your Email"
          className="w-full p-2 sm:p-3 bg-[#2C2C2C] text-white border border-transparent rounded-lg mb-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#505050] transition duration-300 text-sm sm:text-base"
        />

        {/* Phone Number Field */}
        <input
          type="tel"
          id="phone"
          placeholder="Enter Your Phone Number"
          className="w-full p-2 sm:p-3 bg-[#2C2C2C] text-white border border-transparent rounded-lg mb-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#505050] transition duration-300 text-sm sm:text-base"
        />

        {/* Save Changes Button */}
        <div className="flex justify-center items-center">
          <button className="btn bg-[#3A3A3A] text-white font-semibold hover:bg-[#505050] transition duration-300 ease-in-out w-full py-2 sm:py-3 text-sm sm:text-base rounded-lg shadow-lg">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )}
</>







  )
}

export default Logo