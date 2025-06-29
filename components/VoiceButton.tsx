import React, { forwardRef } from "react";

interface VoiceButtonProps {
  id: string;
  onClick: () => void;
  isClicked?: boolean;
}

export const VoiceButton = forwardRef<HTMLButtonElement, VoiceButtonProps>(
  ({ id, onClick, isClicked = false }, ref) => {
    return (
      <button
        ref={ref}
        onClick={onClick}
        className={`
          px-8 py-4 text-lg font-semibold rounded-lg
          transition-all duration-300 transform
          ${isClicked 
            ? 'bg-green-500 text-white scale-95 shadow-lg shadow-green-500/50' 
            : 'bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-600'
          }
        `}
      >
        Button {id}
        {isClicked && (
          <span className="ml-2">✓</span>
        )}
      </button>
    );
  }
);

VoiceButton.displayName = 'VoiceButton';
