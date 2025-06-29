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
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div
          className={`rounded-full transition-all duration-500 ease-in-out shadow-lg ${
            isAnimating ? 'scale-110' : 'scale-100'
          }`}
          style={{
            backgroundColor: color,
            width: `${size}px`,
            height: `${size}px`,
            boxShadow: `0 0 ${isAnimating ? '30px' : '20px'} ${color}40`,
          }}
        />
        {showSuccess && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white rounded-full p-2 shadow-lg animate-bounce">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        )}
      </div>
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-600 transition-all duration-300">
          Current color: <span className="font-semibold" style={{ color }}>{color}</span>
        </p>
        {showSuccess && colorName && (
          <p className="text-sm font-medium text-green-600 animate-pulse">
            ✓ Changed to {colorName}
          </p>
        )}
      </div>
    </div>
  );
};
