import React, { useEffect, useState } from "react";

interface ColorCircleProps {
  color: string;
  size?: number;
  showSuccess?: boolean;
  colorName?: string;
}

export const ColorCircle: React.FC<ColorCircleProps> = ({ 
  color = "#3B82F6", 
  size = 120,
  showSuccess = false,
  colorName
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    if (showSuccess) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    }
  }, [showSuccess, color]);
  
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <div
          className={`rounded-full transition-all duration-500 ease-in-out shadow-lg ${
            isAnimating ? 'scale-110' : 'scale-100'
          }`}
          style={{
            backgroundColor: color,
            width: `${size}px`,
            height: `${size}px`,
            boxShadow: `0 0 ${isAnimating ? '20px' : '15px'} ${color}40`,
          }}
        />
        {showSuccess && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="rounded-full animate-bounce">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        )}
      </div>
      <div className="text-center space-y-1">
        <p className="text-xs text-gray-300 transition-all duration-300">
          Current color: <span className="font-semibold" style={{ color }}>{color}</span>
        </p>
        {showSuccess && colorName && (
          <p className="text-xs font-medium text-green-400 animate-pulse">
            ✓ Changed to {colorName}
          </p>
        )}
      </div>
    </div>
  );
};
