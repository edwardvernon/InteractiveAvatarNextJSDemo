import { useState, useCallback, useRef, useEffect } from 'react';
import { useStreamingAvatarContext } from './context';
import { MessageSender } from './context';

interface CursorPosition {
  x: number;
  y: number;
}

interface ButtonClick {
  buttonId: string;
  timestamp: number;
}

export const useCursorCommands = () => {
  const { messages } = useStreamingAvatarContext();
  const [cursorPosition, setCursorPosition] = useState<CursorPosition>({ x: 300, y: 150 });
  const [isMoving, setIsMoving] = useState(false);
  const [lastButtonClick, setLastButtonClick] = useState<ButtonClick | null>(null);
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const canvasRef = useRef<HTMLDivElement | null>(null);

  const registerButton = useCallback((id: string, element: HTMLButtonElement | null) => {
    if (element) {
      buttonRefs.current[id] = element;
    }
  }, []);
  
  const registerCanvas = useCallback((canvas: HTMLDivElement | null) => {
    canvasRef.current = canvas;
  }, []);

  const processCommand = useCallback((message: string) => {
    const lowerMessage = message.toLowerCase();
    
    // Check for click commands
    if (lowerMessage.includes('click') || lowerMessage.includes('press')) {
      if (lowerMessage.includes('button a') || lowerMessage.includes('a button')) {
        clickButton('A');
        return true;
      } else if (lowerMessage.includes('button b') || lowerMessage.includes('b button')) {
        clickButton('B');
        return true;
      }
    }
    
    return false;
  }, []);

  const clickButton = useCallback((buttonId: string) => {
    const button = buttonRefs.current[buttonId];
    const canvas = canvasRef.current;
    
    if (button && canvas) {
      const buttonRect = button.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();
      
      // Calculate position relative to canvas
      const targetX = buttonRect.left + buttonRect.width / 2 - canvasRect.left;
      const targetY = buttonRect.top + buttonRect.height / 2 - canvasRect.top;
      
      // Move cursor to button
      setIsMoving(true);
      setCursorPosition({ x: targetX, y: targetY });
      
      // After animation, trigger click
      setTimeout(() => {
        setIsMoving(false);
        button.click();
        setLastButtonClick({ buttonId, timestamp: Date.now() });
        
        // Clear the click state after animation
        setTimeout(() => {
          setLastButtonClick(null);
        }, 2000);
      }, 1000);
    }
  }, []);
  
  // Process messages automatically
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      // Only process user messages
      if (lastMessage.sender === MessageSender.CLIENT) {
        processCommand(lastMessage.content);
      }
    }
  }, [messages, processCommand]);

  return {
    cursorPosition,
    isMoving,
    lastButtonClick,
    registerButton,
    registerCanvas,
    processCommand,
  };
};
