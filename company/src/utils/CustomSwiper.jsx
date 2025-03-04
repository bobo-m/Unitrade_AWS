import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.css";
import { FaRegCheckCircle } from "react-icons/fa";
import { useState } from "react";

const CustomSwiper = ({
  banners,
  followed,
  togglePopup,
  isVideoWatched,
  handleWatchButtonClick,
  handleCheckButtonClick,
  handleFollowButtonClick,
  watchTimes,
  loadingState,
}) => {
  const slidesPerView = banners && banners.length === 1 ? 1 : 1.1; // Adjust slides per view

  // State to manage per-task request status
  const [isRequestInProgress, setRequestInProgress] = useState({});

  const handleButtonClick = async (taskKey, action, ...args) => {

    if (isRequestInProgress[taskKey]) return; // Prevent multiple clicks for the same task

    setRequestInProgress((prev) => ({ ...prev, [taskKey]: true }));
    try {
      await action(...args); // Execute the action (e.g., API call)
    } catch (error) {
      console.error("Error in task action:", error);
    } finally {
      setRequestInProgress((prev) => ({ ...prev, [taskKey]: false }));
    }
  };

  // Gradient backgrounds for each slide
  const gradientBackgrounds = [
    "from-gray-300 to-gray-400", // First slide
    "from-[#ebe0e2] to-[#ebe0e2]", // Second slide
    "from-[#e1d0a1] to-[#e1d0a1]", // Third slide
    "from-[#e1b1a1] to-[#e1b1a1]", // Fourth slide
    "from-[#b3d396] to-[#b3d396]", // Fivth slide
    "from-[#e7dee8] to-[#e7dee8]", // Sixth slide
    "from-[#dde1e7] to-[#dde1e7]", // Seventh slide
  ];

  return (
    <div className="flex justify-center items-center">
      <Swiper
        spaceBetween={12}
        slidesPerView={slidesPerView}
        pagination={{ clickable: true }}
        className="rounded-lg shadow-lg overflow-hidden mb-4"
      >
        {banners &&
          banners.map((banner, index) => {
            const taskKey = `task${banner.quest_id}`;
            const bgGradient = gradientBackgrounds[index % gradientBackgrounds.length];

            return (
              <SwiperSlide key={banner.quest_id}>
                <div
                  className={`bg-gradient-to-r ${bgGradient} p-4 rounded-lg shadow-lg max-h-[600px] max-w-[98%] mx-auto`}
                >
                  {/* Banner Header */}
                  <div className="flex items-center">
                    <img
                      src={banner.image}
                      alt={banner.quest_name}
                      className="h-10 w-10 rounded-full shadow-md"
                    />
                  </div>

                  {/* Quest Details */}
                  <div className="pb-3 pt-10">
                    <h1 className="text-black text-base font-bold">
                      {banner.quest_name}
                    </h1>
                    <p className="text-gray-700 text-xs font-bold">
                      +{parseInt(banner.coin_earn)} Coins
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between">
                    {banner.status === "completed" ? (
                      <p className="bg-[#282828] text-white w-20 flex justify-center py-2 rounded-full text-xs font-bold">
                        <FaRegCheckCircle size={20} className="text-[#606060]" />
                      </p>
                    ) : banner.status === "waiting" ? (
                      <p
                        className="bg-[#282828] text-[#aaa3a3] w-20 flex justify-center py-2 rounded-full text-sm font-bold"
                        aria-disabled
                      >
                        Waiting
                      </p>
                    ) : (
                      <>
                        {/* Watch Task */}
                        {banner.activity === "watch" && !watchTimes[taskKey] && (
                          <a
                            href={banner.quest_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() =>
                              handleButtonClick(
                                taskKey,
                                handleWatchButtonClick,
                                taskKey,
                                banner.quest_url
                              )
                            }
                            className="bg-gray-900 text-white w-20 flex justify-center py-1.5 rounded-full text-sm font-bold"
                          >
                            Watch
                          </a>
                        )}

                        {banner.activity === "watch" && watchTimes[taskKey] && (
                          <button
                          disabled={loadingState[taskKey] || isRequestInProgress[taskKey]}
                            onClick={() => {
                              setRequestInProgress(prev => ({ ...prev, [taskKey]: true }));
                              handleCheckButtonClick(
                                taskKey,
                                banner.quest_id
                              )
                            }
                             
                            }
                            className={`bg-gray-900 text-white w-20 flex justify-center py-1.5 rounded-full text-sm font-bold ${
                              loadingState[taskKey] || isRequestInProgress[taskKey] ? "opacity-75 cursor-not-allowed" : ""
                            }`}
                          >
                            {loadingState[taskKey] || isRequestInProgress[taskKey] ? (
                              <div className="flex justify-center items-center">
                                <div className="spinner"></div>
                              </div>
                            ) : (
                              "Verify"
                            )}
                          </button>
                        )}

                        {/* Follow Task */}
                        {banner.activity === "follow" && !followed[taskKey] && (
                          <a
                            href={banner.quest_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() =>
                              handleButtonClick(
                                taskKey,
                                handleFollowButtonClick,
                                taskKey
                              )
                            }
                            className="bg-gray-900 text-white w-20 flex justify-center py-1.5 rounded-full text-sm font-bold"
                          >
                            Follow
                          </a>
                        )}

                        {banner.activity === "follow" && followed[taskKey] && (
                          <button
                            onClick={() =>
                              handleButtonClick(
                                taskKey,
                                togglePopup,
                                taskKey,
                                banner.quest_id
                              )
                            }
                            className={`bg-gray-900 text-white w-20 flex justify-center py-1.5 rounded-full text-sm font-bold ${
                              isRequestInProgress[taskKey]
                                ? "opacity-75 cursor-wait"
                                : ""
                            }`}
                          >
                            Verify
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
      </Swiper>
    </div>
  );
};

export default CustomSwiper;
