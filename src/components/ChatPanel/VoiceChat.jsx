import React, { useState, useEffect } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { useSelector } from "react-redux";
import { UPDATEDOC } from "../../server";
import voiceChat from "../../assets/voiceChat.png";

const VoiceChat = ({ FetchedCall }) => {
  const user = useSelector((state) => ({ ...state.user })).user;
  const activeChat = useSelector((state) => ({ ...state.chat }));
  const [client, setClient] = useState(null);
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [inCall, setInCall] = useState(false); // Track call status

  useEffect(() => {
    // Create Agora client when component mounts
    const agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    setClient(agoraClient);
  }, []);

  const StartCall = async () => {
    if (inCall) {
      // If already in a call, leave the channel
      await leaveCall();
    } else {
      // If not in a call, join the channel
      try {
        // join a channel
        await client.join(
          "f891c234043549558a9d24395c86e4d4",
          activeChat.chatID,
          null,
          user.uid
        );
        await UPDATEDOC("chats", activeChat.chatID, {
          voiceCall: {
            appId: "f891c234043549558a9d24395c86e4d4",
            channel: activeChat.chatID,
            token: null,
          },
        });
        // create local audio track
        const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        setLocalAudioTrack(localAudioTrack);
        console.log("Local audio track created:", localAudioTrack);

        // publish local audio track
        await client.publish([localAudioTrack]);
        setInCall(true); // Set the call status to true
      } catch (error) {
        console.error("Error starting call:", error);
      }
    }
  };

  const leaveCall = async () => {
    await UPDATEDOC("chats", activeChat.chatID, {
      voiceCall: {
        appId: "",
        channel: null,
        token: null,
        uid: null,
      },
    });
    await client?.leave(); // Ensure the client exists before calling leave()
    setInCall(false); // Set the call status to false
  };

  return (
    <div style={{ display: "flex" }}>
      <p onClick={leaveCall}>{inCall ? "Leave" : "End Call"}</p>
      <img src={voiceChat} onClick={StartCall} />
      <div
        id="circle"
        className={`circle ${FetchedCall?.channel ? "" : "Hidden"}`}
      ></div>
    </div>
  );
};

export default VoiceChat;
