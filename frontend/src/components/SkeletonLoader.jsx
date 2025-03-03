import React from "react";

const SkeletonLoader = () => {
  return (
    <div className="p-4 bg-black min-h-screen text-white flex flex-col max-w-lg w-full">
      {/* Skeleton for the banner */}
      <div className="skeleton skeleton-box"></div>
      <div className="skeleton skeleton-box"></div>

      {/* Skeleton for text */}
      <div className="skeleton skeleton-title"></div>
      <div className="skeleton skeleton-text"></div>
      <div className="skeleton skeleton-text"></div>

      {/* Skeleton for rows */}
      {[...Array(5)].map((_, index) => (
        <div
          key={index}
          className="flex justify-between items-center skeleton skeleton-box py-4 px-4 mb-4"
        ></div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
