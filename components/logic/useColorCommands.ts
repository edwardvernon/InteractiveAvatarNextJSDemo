import { useEffect, useRef, useState } from "react";
import { useStreamingAvatarContext } from "./context";
import { parseColorCommand } from "@/utils/colorParser";
import { MessageSender } from "./context";

export const useColorCommands = () => {
  const { messages, setCircleColor } = useStreamingAvatarContext();
  const lastProcessedMessageId = useRef<string | null>(null);
  const [lastColorChange, setLastColorChange] = useState<{color: string, colorName: string, timestamp: number} | null>(null);

  useEffect(() => {
    // Get the latest user message
    const userMessages = messages.filter(msg => msg.sender === MessageSender.CLIENT);
    const latestMessage = userMessages[userMessages.length - 1];

    if (!latestMessage || latestMessage.id === lastProcessedMessageId.current) {
      return;
    }

    // Parse the message for color commands
    const colorCommand = parseColorCommand(latestMessage.content);

    if (colorCommand.detected && colorCommand.color && colorCommand.colorName) {
      lastProcessedMessageId.current = latestMessage.id;
      
      // Update the circle color immediately with visual feedback
      setCircleColor(colorCommand.color);
      setLastColorChange({
        color: colorCommand.color,
        colorName: colorCommand.colorName,
        timestamp: Date.now()
      });
      
      // Clear the visual feedback after 3 seconds
      setTimeout(() => {
        setLastColorChange(null);
      }, 3000);
    }
  }, [messages, setCircleColor]);

  return {
    lastColorChange
  };
};
