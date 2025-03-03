import React from 'react';
import { ImCross } from "react-icons/im";

function History({ closePopups }) {
  return (
    <div className="fixed inset-0 flex items-end justify-center bg-transparent bg-opacity-40 backdrop-blur-sm z-50" onClick={closePopups}>
    <div
      className="bg-black w-full sm:max-w-lg p-2 sm:p-6 rounded-t-3xl shadow-xl relative"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={closePopups}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 focus:outline-none transition duration-300"
      >
        <ImCross size={18} />
      </button>
  
      <h2 className="text-lg sm:text-xl font-semibold text-center mb-3 text-[#E0E0E0]">
        History
      </h2>
      
      {/* Scrollable content container */}
      <div className="overflow-y-auto max-h-[70vh] px-3">
        <div className="mt-4">
          <p className="text-[#ACACAC] text-lg font-semibold">Nov 7, 2024</p>
          <div className="flex items-center justify-between py-2">
            <img className="w-10 h-10" src="\src\Img\rupees.png" alt="" />
            <h3 className="text-sm capitalize text-white font-semibold">Receive from daily rewards</h3>
            <p className="text-sm capitalize text-white font-semibold">+ 200 Coin</p>
          </div>
          <div className="flex items-center justify-between py-2">
            <img className="w-10 h-10" src="\src\Img\rupees.png" alt="" />
            <h3 className="text-sm capitalize text-white font-semibold">Receive from daily rewards</h3>
            <p className="text-sm capitalize text-white font-semibold">+ 200 Coin</p>
          </div>
          <div className="flex items-center justify-between py-2">
            <img className="w-10 h-10" src="\src\Img\rupees.png" alt="" />
            <h3 className="text-sm capitalize text-white font-semibold">Receive from daily rewards</h3>
            <p className="text-sm capitalize text-white font-semibold">+ 200 Coin</p>
          </div>
          {/* Repeat other items similarly */}
        </div>
  
        <div className="mt-4">
          <p className="text-[#ACACAC] text-lg font-semibold">Nov 6, 2024</p>
          <div className="flex items-center justify-between py-2">
            <img className="w-10 h-10" src="\src\Img\rupees.png" alt="" />
            <h3 className="text-sm capitalize text-white font-semibold">Receive from daily rewards</h3>
            <p className="text-sm capitalize text-white font-semibold">+ 200 Coin</p>
          </div>
          <div className="flex items-center justify-between py-2">
            <img className="w-10 h-10" src="\src\Img\rupees.png" alt="" />
            <h3 className="text-sm capitalize text-white font-semibold">Receive from daily rewards</h3>
            <p className="text-sm capitalize text-white font-semibold">+ 200 Coin</p>
          </div>
          {/* Repeat other items similarly */}
        </div>
  
        <div className="mt-4">
          <p className="text-[#ACACAC] text-lg font-semibold">Nov 5, 2024</p>
          <div className="flex items-center justify-between py-2">
            <img className="w-10 h-10" src="\src\Img\rupees.png" alt="" />
            <h3 className="text-sm capitalize text-white font-semibold">Receive from daily rewards</h3>
            <p className="text-sm capitalize text-white font-semibold">+ 200 Coin</p>
          </div>
          <div className="flex items-center justify-between py-2">
            <img className="w-10 h-10" src="\src\Img\rupees.png" alt="" />
            <h3 className="text-sm capitalize text-white font-semibold">Receive from daily rewards</h3>
            <p className="text-sm capitalize text-white font-semibold">+ 200 Coin</p>
          </div>
          {/* Repeat other items similarly */}
        </div>
      </div>
    </div>
  </div>
  
  )
}

export default History