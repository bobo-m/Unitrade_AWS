import React from 'react';
import { ImCross } from "react-icons/im";

function Follow({togglePopup, handleFileChange, handleSubmit, isUploading,  task, questId, screenshotRequired}) {
    return (
        <div className="fixed inset-x-0 top-0 flex  justify-center bg-transparent bg-opacity-40 backdrop-blur-sm z-50" onClick={togglePopup}>
            <div className="bg-[#1B1A1A] p-4 sm:p-6 rounded-t-3xl shadow-xl min-w-[420px] max-w-lg relative" onClick={(e) => e.stopPropagation()}>
                <button onClick={togglePopup} className="absolute top-5 right-5 text-gray-400 hover:text-gray-200 focus:outline-none transition duration-300">
                    <ImCross size={20} />
                </button>

                <h2 className="text-lg sm:text-2xl font-semibold text-center mb-4 text-[#E0E0E0]">Upload Screenshot</h2>

                <p className="text-sm sm:text-base text-[#B0B0B0] text-center mb-6">Follow the specified channel and upload a screenshot of the followed page. After uploading, your task will be marked as complete.</p>

                <input
                    type="file"
                    id="file"
                    onChange={handleFileChange}
                    placeholder="Enter refferal link for QR code"
                    className="w-full p-2 sm:p-3 bg-[#2C2C2C] text-white border border-transparent rounded-lg mb-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#505050] transition duration-300 text-sm sm:text-base"
                />


                <div className="flex justify-center items-center mb-2">
                    <button className="btn bg-[#3A3A3A] text-white font-semibold hover:bg-[#505050] transition duration-300 ease-in-out w-full py-2 sm:py-3 text-sm sm:text-base rounded-lg shadow-lg"
                  onClick={() => handleSubmit(task, questId, screenshotRequired)} 
                      disabled={isUploading}>
                        {isUploading ? 'Uploading...' : 'Submit'}
                    </button>
                </div>

            </div>
        </div>
    )
}

export default Follow
