import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}

export default function Card({ children, className = "", padded = true }: CardProps) {
  return (
    <div
      className={`fade-in bg-card dark:bg-darkCard border border-borderC dark:border-darkBorderC rounded-card shadow-card transition-colors duration-200 ${padded ? "p-4 sm:p-5" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
