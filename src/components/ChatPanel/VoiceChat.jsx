import React, { useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { useSelector } from "react-redux";
import { UPDATEDOC } from "../../server";
import voiceChat from "../../assets/voiceChat.png";
const VoiceChat = ({ FetchedCall }) => {
  const user = useSelector((state) => ({ ...state.user })).user;
  const activeChat = useSelector((state) => ({ ...state.chat }));
  const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  client.on("user-published", async (user, mediaType) => {
    await client.subscribe(user, mediaType);

    // if the media type is audio
    if (mediaType === "audio") {
      // get the audio track
      const remoteAudioTrack = user.audioTrack;
      // play the audio
      remoteAudioTrack.play();
    }
  });

  const StartCall = async () => {
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
      setLocalAudioTrack(await AgoraRTC.createMicrophoneAudioTrack());
      console.log("Local audio track created:", localAudioTrack);

      // publish local audio track
      await client.publish([localAudioTrack]);
    } catch (error) {
      console.error("Error starting call:", error);
    }
  };

  const leaveCall = async () => {
    await client.leave();
    await UPDATEDOC("chats", activeChat.chatID, {
      voiceCall: {
        appId: "",
        channel: null,
        token: null,
        uid: null,
      },
    });
  };

  return (
    <div style={{ display: "flex" }}>
      <p onClick={leaveCall}>Leave</p>
      <img src={voiceChat} onClick={StartCall} />
      <div
        id="circle"
        className={`circle ${FetchedCall?.channel ? "" : "Hidden"}`}
      ></div>
    </div>
  );
};

export default VoiceChat;
