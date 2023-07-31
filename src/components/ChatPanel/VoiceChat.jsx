import React from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { useSelector } from "react-redux";
import { UPDATEDOC } from "../../server";
import voiceChat from "../../assets/voiceChat.png";
const VoiceChat = ({ FetchedCall }) => {
  console.log(FetchedCall);
  const user = useSelector((state) => ({ ...state.user })).user;
  const activeChat = useSelector((state) => ({ ...state.chat }));
  const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

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

    // publish local audio track
    await client.publish([localAudioTrack]);
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
  const getActiveUsers = () => {
    const activeUsers = client.remoteUsers;
    console.log(activeUsers);
  };

  return (
    <div style={{ display: "flex" }}>
      <p onClick={getActiveUsers}> view</p>
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
