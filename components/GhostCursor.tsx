import React from "react";

interface GhostCursorProps {
  x: number;
  y: number;
  isMoving?: boolean;
}

export const GhostCursor = ({ x, y, isMoving }: GhostCursorProps) => {
  return (
    <div
      className={`absolute pointer-events-none z-50 transition-all ${
        isMoving ? 'duration-1000 ease-in-out' : 'duration-0'
      }`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="filter drop-shadow-lg"
      >
        <path
          d="M5 3L19 12L12 13L8 21L5 3Z"
          fill="#7C3AED"
          stroke="#9333EA"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
      {isMoving && (
        <div className="absolute inset-0 animate-ping">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 3L19 12L12 13L8 21L5 3Z"
              fill="#7C3AED"
              opacity="0.5"
            />
          </svg>
        </div>
      )}
    </div>
  );
};
