import React, { useRef, useEffect } from "react";
import { VoiceButton } from "./VoiceButton";
import { GhostCursor } from "./GhostCursor";

interface InteractionCanvasProps {
  registerButton: (id: string, element: HTMLButtonElement | null) => void;
  lastButtonClick: { buttonId: string; timestamp: number } | null;
  cursorPosition: { x: number; y: number };
  isMoving: boolean;
  onCanvasReady: (canvas: HTMLDivElement) => void;
}

export const InteractionCanvas: React.FC<InteractionCanvasProps> = ({
  registerButton,
  lastButtonClick,
  cursorPosition,
  isMoving,
  onCanvasReady,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      onCanvasReady(canvasRef.current);
    }
  }, [onCanvasReady]);

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-lg font-semibold text-white">Voice-Controlled Cursor</h2>
      
      {/* Canvas area with fixed dimensions */}
      <div 
        ref={canvasRef}
        className="relative bg-zinc-900 border border-zinc-700 rounded-lg"
        style={{ width: '600px', height: '300px' }}
      >
        {/* Buttons positioned within the canvas */}
        <div className="absolute inset-0 flex items-center justify-center gap-16">
          <VoiceButton
            ref={(el) => registerButton('A', el)}
            id="A"
            onClick={() => console.log('Button A clicked!')}
            isClicked={lastButtonClick?.buttonId === 'A' && Date.now() - lastButtonClick.timestamp < 2000}
          />
          <VoiceButton
            ref={(el) => registerButton('B', el)}
            id="B"
            onClick={() => console.log('Button B clicked!')}
            isClicked={lastButtonClick?.buttonId === 'B' && Date.now() - lastButtonClick.timestamp < 2000}
          />
        </div>
        
        {/* Ghost Cursor positioned relative to canvas */}
        <GhostCursor 
          x={cursorPosition.x} 
          y={cursorPosition.y} 
          isMoving={isMoving}
        />
      </div>
      
      <p className="text-xs text-gray-400 text-center max-w-xs">
        Try saying: "Click on button A" or "Press button B"
      </p>
    </div>
  );
};
