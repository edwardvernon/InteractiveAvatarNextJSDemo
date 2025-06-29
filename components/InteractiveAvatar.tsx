import {
  AvatarQuality,
  StreamingEvents,
  VoiceChatTransport,
  VoiceEmotion,
  StartAvatarRequest,
  STTProvider,
  ElevenLabsModel,
} from "@heygen/streaming-avatar";
import { useEffect, useRef, useState } from "react";
import { useMemoizedFn, useUnmount } from "ahooks";

import { Button } from "./Button";
import { AvatarConfig } from "./AvatarConfig";
import { AvatarVideo } from "./AvatarSession/AvatarVideo";
import { useStreamingAvatarSession } from "./logic/useStreamingAvatarSession";
import { AvatarControls } from "./AvatarSession/AvatarControls";
import { useVoiceChat } from "./logic/useVoiceChat";
import { StreamingAvatarProvider, StreamingAvatarSessionState } from "./logic";
import { LoadingIcon } from "./Icons";
import { MessageHistory } from "./AvatarSession/MessageHistory";
import { InteractionCanvas } from "./InteractionCanvas";
import { useCursorCommands } from "./logic/useCursorCommands";
import { useStreamingAvatarContext } from "./logic";

import { AVATARS } from "@/app/lib/constants";

const DEFAULT_CONFIG: StartAvatarRequest = {
  quality: AvatarQuality.High,
  avatarName: AVATARS[0].avatar_id,
  voice: {
    rate: 1.5,
    emotion: VoiceEmotion.EXCITED,
  },
  language: "en",
  voiceChatTransport: VoiceChatTransport.WEBSOCKET,
  sttSettings: {
    provider: STTProvider.DEEPGRAM,
  },
  knowledgeBase: `You are an AI assistant integrated with a voice-controlled cursor interface. The user can see two buttons on their screen: Button A and Button B.
    
    When the user asks you to click on a button, you should acknowledge their request naturally. The system will automatically move a ghost cursor to the button and click it.
    
    Common commands include:
    - "Click on button A" or "Press button A"
    - "Click on button B" or "Press button B"
    - "Click A" or "Click B"
    
    Always confirm when you understand a click request, and acknowledge that you're clicking the requested button.
    
    Be conversational and friendly in your responses.`
};

function InteractiveAvatar() {
  const { initAvatar, startAvatar, stopAvatar, sessionState, stream } =
    useStreamingAvatarSession();
  const { startVoiceChat } = useVoiceChat();
  const { circleColor } = useStreamingAvatarContext();
  
  // Enable cursor command processing
  const { 
    cursorPosition, 
    isMoving, 
    lastButtonClick, 
    registerButton,
    registerCanvas,
    processCommand 
  } = useCursorCommands();

  const [config, setConfig] = useState<StartAvatarRequest>(DEFAULT_CONFIG);

  const mediaStream = useRef<HTMLVideoElement>(null);

  async function fetchAccessToken() {
    try {
      const response = await fetch("/api/get-access-token", {
        method: "POST",
      });
      const token = await response.text();

      console.log("Access Token:", token); // Log the token to verify

      return token;
    } catch (error) {
      console.error("Error fetching access token:", error);
      throw error;
    }
  }

  const startSessionV2 = useMemoizedFn(async (isVoiceChat: boolean) => {
    try {
      const newToken = await fetchAccessToken();
      const avatar = initAvatar(newToken);

      avatar.on(StreamingEvents.AVATAR_START_TALKING, (e) => {
        console.log("Avatar started talking", e);
      });
      avatar.on(StreamingEvents.AVATAR_STOP_TALKING, (e) => {
        console.log("Avatar stopped talking", e);
      });
      avatar.on(StreamingEvents.STREAM_DISCONNECTED, () => {
        console.log("Stream disconnected");
      });
      avatar.on(StreamingEvents.STREAM_READY, (event) => {
        console.log(">>>>> Stream ready:", event.detail);
      });
      avatar.on(StreamingEvents.USER_START, (event) => {
        console.log(">>>>> User started talking:", event);
      });
      avatar.on(StreamingEvents.USER_STOP, (event) => {
        console.log(">>>>> User stopped talking:", event);
      });
      avatar.on(StreamingEvents.USER_END_MESSAGE, (event) => {
        console.log(">>>>> User end message:", event);
      });
      avatar.on(StreamingEvents.USER_TALKING_MESSAGE, (event) => {
        console.log(">>>>> User talking message:", event);
      });
      avatar.on(StreamingEvents.AVATAR_TALKING_MESSAGE, (event) => {
        console.log(">>>>> Avatar talking message:", event);
      });
      avatar.on(StreamingEvents.AVATAR_END_MESSAGE, (event) => {
        console.log(">>>>> Avatar end message:", event);
      });

      await startAvatar(config);

      if (isVoiceChat) {
        await startVoiceChat();
      }
    } catch (error) {
      console.error("Error starting avatar session:", error);
    }
  });

  useUnmount(() => {
    stopAvatar();
  });

  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.onloadedmetadata = () => {
        mediaStream.current!.play();
      };
    }
  }, [mediaStream, stream]);

  return (
    <div className="w-full h-screen flex flex-col items-center bg-black relative overflow-hidden">
      {sessionState === StreamingAvatarSessionState.INACTIVE ? (
        <div className="flex flex-col items-center w-full mt-20">
          <h2 className="text-xl font-bold mb-2 text-white">Voice-Controlled Circle Demo</h2>
          <p className="text-gray-400 text-center mb-4 text-sm">Start a voice chat with Wayne to change the circle's color</p>
          <div className="flex flex-row gap-4">
            <Button onClick={() => startSessionV2(true)} className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-600">
              Start Voice Chat with Wayne
            </Button>
          </div>
        </div>
      ) : sessionState === StreamingAvatarSessionState.CONNECTING ? (
        <div className="flex flex-col items-center w-full mt-20">
          <LoadingIcon />
          <p className="text-gray-400 mt-2 text-sm">Connecting to Wayne...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center w-full mt-10 gap-6">
          {/* Main content - Interactive Canvas */}
          <InteractionCanvas
            registerButton={registerButton}
            lastButtonClick={lastButtonClick}
            cursorPosition={cursorPosition}
            isMoving={isMoving}
            onCanvasReady={registerCanvas}
          />
          
          {/* Avatar in circle */}
          <div className="flex flex-col items-center">
            <div className="rounded-full overflow-hidden" style={{ width: '140px', height: '140px' }}>
              <div className="w-full h-full overflow-hidden">
                <AvatarVideo ref={mediaStream} circular={true} />
              </div>
            </div>
            <div className="mt-1 flex justify-center">
              <AvatarControls />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InteractiveAvatarWrapper() {
  return (
    <StreamingAvatarProvider basePath={process.env.NEXT_PUBLIC_BASE_API_URL}>
      <InteractiveAvatar />
    </StreamingAvatarProvider>
  );
}
