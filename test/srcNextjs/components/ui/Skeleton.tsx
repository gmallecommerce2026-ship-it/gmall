import React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded-[4px] ${className}`}
      {...props}
    />
  );
};

export default Skeleton;