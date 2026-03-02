import React from "react";

interface IconProps {
  className?: string;
  hasNotification?: boolean;
}

const BellIcon: React.FC<IconProps> = ({ className = "", hasNotification = false }) => {
  return (
    <div className={`relative ${className}`}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full text-current" // Inherit màu từ parent
      >
        <path
          d="M12.02 2.90991C8.70997 2.90991 6.01997 5.59991 6.01997 8.90991V11.7999C6.01997 12.4099 5.75997 13.3399 5.44997 13.8599L4.29997 15.7699C3.58997 16.9499 4.07997 18.2599 5.37997 18.2599H18.66C19.96 18.2599 20.45 16.9499 19.74 15.7699L18.59 13.8599C18.28 13.3399 18.02 12.4099 18.02 11.7999V8.90991C18.02 5.60991 15.32 2.90991 12.02 2.90991Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
        />
        <path
          d="M13.87 3.20002C13.56 3.11002 13.24 3.04002 12.91 3.01002C11.95 2.92002 11.03 3.19002 10.3 3.73002"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15.02 19.06C15.02 20.71 13.67 22.06 12.02 22.06C11.2 22.06 10.44 21.72 9.90002 21.18C9.36002 20.64 9.02002 19.88 9.02002 19.06"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeMiterlimit="10"
        />
      </svg>
      {/* Chấm đỏ thông báo (Optional) */}
      {hasNotification && (
        <span className="absolute top-0 right-0.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
      )}
    </div>
  );
};

export default BellIcon;