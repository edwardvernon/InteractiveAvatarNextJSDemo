import { ToggleGroup, ToggleGroupItem } from "@radix-ui/react-toggle-group";
import React from "react";

import { useVoiceChat } from "../logic/useVoiceChat";
import { Button } from "../Button";
import { useInterrupt } from "../logic/useInterrupt";

import { AudioInput } from "./AudioInput";
import { TextInput } from "./TextInput";

export const AvatarControls: React.FC = () => {
  const {
    isVoiceChatActive,
  } = useVoiceChat();
  const { interrupt } = useInterrupt();

  return (
    <div className="flex gap-2 items-center justify-center">
      {isVoiceChatActive && (
        <>
          <AudioInput />
          <Button 
            className="!bg-zinc-700 !text-white !p-2 rounded-full" 
            onClick={interrupt}
            title="Interrupt"
          >
            <span className="sr-only">Interrupt</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="9" x2="15" y2="15"></line>
              <line x1="15" y1="9" x2="9" y2="15"></line>
            </svg>
          </Button>
        </>
      )}
    </div>
  );
};
