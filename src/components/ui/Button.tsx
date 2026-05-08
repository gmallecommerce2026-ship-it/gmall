// TS-fix wiki 0031: Button props - thêm isLoading + leftIcon (đa dụng cho admin/auth flow)
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  // Thêm "ghost" vào định nghĩa kiểu
  variant?: "primary" | "secondary" | "outline" | "ghost";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  className = "",
  variant = "primary",
  isLoading = false,
  leftIcon,
  disabled,
  ...props
}) => {
  const baseStyle =
    "relative px-6 py-3 rounded-xl font-sans font-semibold text-base " +
    "transition-all duration-200 ease-out " +
    "active:scale-95 disabled:opacity-50 disabled:pointer-events-none " +
    "focus:outline-none focus:ring-4 focus:ring-offset-1 overflow-hidden";

  const variantStyles = {
    primary:
      "bg-brand-orange text-white shadow-lg shadow-orange-500/30 " +
      "hover:bg-brand-orange-dark hover:shadow-orange-500/40 " +
      "focus:ring-orange-200",
    secondary:
      "bg-gray-100 text-gray-800 hover:bg-gray-200 hover:text-gray-900 " +
      "focus:ring-gray-200",
    outline:
      "border-2 border-brand-orange text-brand-orange bg-transparent " +
      "hover:bg-orange-50 focus:ring-orange-100",
    // Thêm style mặc định cho ghost (nền trong suốt, hover nhẹ)
    ghost:
      "bg-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900 " +
      "focus:ring-gray-100"
  };

  return (
    <button
      className={`${baseStyle} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {isLoading && (
          <span
            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
        )}
        {!isLoading && leftIcon}
        {children}
      </span>
    </button>
  );
};

export default Button;
