import React from "react";

const LoadingSpinner = ({ size = "default", text = "Loading..." }) => {
  const sizeClasses = {
    small: "w-8 h-8",
    default: "w-16 h-16",
    large: "w-24 h-24",
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Outer ring */}
        <div className="absolute inset-0 border-4 border-orange-200 rounded-full"></div>
        {/* Spinning ring */}
        <div className="absolute inset-0 border-4 border-orange-600 rounded-full border-t-transparent animate-spin"></div>
        {/* Center Om symbol */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={size === "small" ? "text-lg" : size === "large" ? "text-4xl" : "text-2xl"}>
            🕉️
          </span>
        </div>
      </div>
      {text && (
        <p className="mt-4 text-gray-600 font-medium animate-pulse">{text}</p>
      )}
    </div>
  );
};

// Full page loading spinner
export const FullPageSpinner = ({ text = "Loading..." }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
    <LoadingSpinner size="large" text={text} />
  </div>
);

// Inline/small loading spinner
export const InlineSpinner = () => (
  <div className="inline-flex items-center">
    <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin mr-2"></div>
    <span className="text-sm text-gray-600">Loading...</span>
  </div>
);

// Button loading spinner
export const ButtonSpinner = () => (
  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
);

export default LoadingSpinner;
