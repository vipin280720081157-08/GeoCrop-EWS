import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}

export default function Card({ children, className = "", padded = true }: CardProps) {
  return (
    <div
      className={`fade-in bg-card border border-borderC rounded-card shadow-card ${padded ? "p-5" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
