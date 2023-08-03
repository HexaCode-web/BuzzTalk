import React, { useState, useEffect } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { useDispatch, useSelector } from "react-redux";
import { GETDOC, UPDATEDOC } from "../../server";
import voiceChat from "../../assets/voiceChat.png";
import { v4 as uuid } from "uuid";

import { Timestamp, arrayUnion } from "firebase/firestore";
import { CreateToast } from "../../App";
const VoiceCall = ({ FetchedCall }) => {
  const User = useSelector((state) => ({ ...state.user })).user;
  const dispatch = useDispatch();
  const activeChat = useSelector((state) => ({ ...state.chat }));
  const [localAudioTrack, setLocalAudioTrack] = useState(null); // State to store the local audio track
  const [client, setClient] = useState(null);
  const [onGoingCall, setOnGoingCall] = useState(false);
  const [userJoined, setUserJoined] = useState(false);
  useEffect(() => {
    setClient(AgoraRTC.createClient({ mode: "rtc", codec: "vp8" }));
  }, []);
  const callAppID = import.meta.env.VITE_TEST_CALLID;
  const onCallAccepted = async () => {
    const handleUserPublished = async (user, mediaType) => {
      await client.subscribe(user, mediaType);
      // if the media type is audio
      if (mediaType === "audio") {
        // get the audio track
        const remoteAudioTrack = user.audioTrack;
        // play the audio
        remoteAudioTrack.play();
      }
    };
    client.on("user-published", handleUserPublished);

    await client.join(callAppID, activeChat.chatID, null, User.uid);
    const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();

    // publish local audio track
    await client.publish([audioTrack]);

    // Save the local audio track in the state
    setLocalAudioTrack(audioTrack);
    setUserJoined(true);
  };
  useEffect(() => {
    if (FetchedCall?.status === "Accepted") {
      onCallAccepted();
      setOnGoingCall(true);
      setUserJoined(true);
      UPDATEDOC("Users", User.uid, {
        hasCall: true,
      });
    } else if (FetchedCall?.status === "Ended") {
      onCallLeave();
    } else {
      setOnGoingCall(false);
      setUserJoined(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [FetchedCall]);
  const StartCall = async () => {
    if (User.hasCall) {
      CreateToast("you can only have one call active", "error");
      return;
    }
    try {
      await UPDATEDOC("Users", User.uid, {
        hasCall: true,
      });
      let fetchedChat = await GETDOC("chats", activeChat.chatID);
      if (fetchedChat.voiceCall.makerUID) {
        await UPDATEDOC("chats", activeChat.chatID, {
          voiceCall: {
            channel: activeChat.chatID,
            makerUID: fetchedChat.voiceCall.makerUID,
            remoteUID: User.uid,
            status: "Ringing",
          },
        });
        await handleSendUpdate(`${User.displayName} has joined the voice call`);
      } else {
        await UPDATEDOC("chats", activeChat.chatID, {
          voiceCall: {
            channel: activeChat.chatID,
            makerUID: User.uid,
            remoteUID: null,
            status: "Ringing",
          },
        });
        await handleSendUpdate(
          `${User.displayName} has started the voice call`
        );
      }
    } catch (error) {
      console.error("Error starting call:", error);
    }
  };
  const handleSendUpdate = async (text) => {
    let objectToSend = {
      id: uuid(),
      SenderID: "SYSTEM",
      date: Timestamp.now(),
      text,
    };
    await UPDATEDOC("chats", activeChat.chatID, {
      messages: arrayUnion(objectToSend),
    });
  };
  const onCallLeave = async () => {
    try {
      // Unsubscribe from all remote audio tracks
      client.remoteUsers.forEach((user) => {
        const remoteAudioTrack = user.audioTrack;
        if (remoteAudioTrack) {
          remoteAudioTrack.stop(); // Stop the remote audio track
          remoteAudioTrack.close(); // Stop the remote audio track
        }
      });

      // Stop the local audio track if it exists
      if (localAudioTrack) {
        localAudioTrack.close();
        localAudioTrack.stop();
      }

      await client.leave();
    } catch (error) {
      console.error("Error leaving call:", error);
    }
  };
  const leaveCall = async () => {
    await UPDATEDOC("chats", activeChat.chatID, {
      voiceCall: {
        channel: null,
        makerUID: null,
        remoteUID: null,
        status: "Ended",
      },
    });
    onCallLeave();
    await handleSendUpdate(`${User.displayName} has left a voice call`);
    await handleSendUpdate(`voice call has been ended`);
  };
  useEffect(() => {
    const handleBeforeUnload = async () => {
      await UPDATEDOC("chats", activeChat.chatID, {
        voiceCall: {
          channel: null,
          makerUID: null,
          remoteUID: null,
          status: "Ended",
        },
      });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [activeChat.chatID]);
  return (
    <div className="VoiceCallWrapper">
      <button
        className={`button ${userJoined ? "" : "Hidden"}`}
        onClick={leaveCall}
      >
        Leave
      </button>

      <img src={voiceChat} onClick={StartCall} />
      <div
        id="circle"
        className={`circle ${onGoingCall ? "" : "Hidden"}`}
      ></div>
    </div>
  );
};

export default VoiceCall;
