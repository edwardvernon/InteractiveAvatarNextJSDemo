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
import { ColorCircle } from "./ColorCircle";
import { useColorCommands } from "./logic/useColorCommands";
import { useStreamingAvatarContext } from "./logic";

import { AVATARS } from "@/app/lib/constants";

const DEFAULT_CONFIG: StartAvatarRequest = {
  quality: AvatarQuality.Low,
  avatarName: "Wayne_20240711",
  knowledgeId: undefined,
  knowledgeBase: `You are an interactive AI avatar assistant with access to a special feature: 
    a colored circle displayed on the screen that you can change. When users ask you to change 
    the circle's color (e.g., "make the circle red" or "change the circle to blue"), you should 
    acknowledge that you've changed the color and confirm which color it now is. The circle will 
    automatically change color when users make these requests. Available colors include red, blue, 
    green, yellow, purple, orange, pink, brown, black, white, and many other standard colors. 
    Always respond as if you have the ability to change the circle's color directly.`,
  voice: {
    rate: 1.5,
    emotion: VoiceEmotion.EXCITED,
    model: ElevenLabsModel.eleven_flash_v2_5,
  },
  language: "en",
  voiceChatTransport: VoiceChatTransport.WEBSOCKET,
  sttSettings: {
    provider: STTProvider.DEEPGRAM,
  },
};

function InteractiveAvatar() {
  const { initAvatar, startAvatar, stopAvatar, sessionState, stream } =
    useStreamingAvatarSession();
  const { startVoiceChat } = useVoiceChat();
  const { circleColor } = useStreamingAvatarContext();
  
  // Enable color command processing
  const { lastColorChange } = useColorCommands();

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
          {/* Main content - Colored circle */}
          <div className="flex flex-col items-center">
            <ColorCircle 
              color={circleColor} 
              size={140}
              showSuccess={!!lastColorChange && Date.now() - lastColorChange.timestamp < 3000}
              colorName={lastColorChange?.colorName}
            />
            <p className="text-xs text-gray-400 mt-1 text-center max-w-xs">
              Try saying: "Change the circle to blue" or "Make it red"
            </p>
          </div>
          
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
