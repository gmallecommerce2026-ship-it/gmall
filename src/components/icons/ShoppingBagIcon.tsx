import React from "react";

interface IconProps {
  className?: string;
}

const ShoppingBagIcon: React.FC<IconProps> = ({ className = "" }) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M7.5 7.67001V6.70001C7.5 4.45001 9.31 2.24001 11.56 2.03001C14.24 1.77001 16.5 3.88001 16.5 6.51001V7.89001"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 22H15C19.02 22 19.74 20.39 19.95 18.43L20.7 12.43C20.97 9.99 20.27 8 16 8H8C3.73 8 3.03 9.99 3.3 12.43L4.05 18.43C4.26 20.39 4.98 22 9 22Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.4955 12H15.5045"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.49451 12H8.50349"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default ShoppingBagIcon;