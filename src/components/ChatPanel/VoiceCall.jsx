/* eslint-disable no-debugger */
import React, { useState, useEffect } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";
import { useDispatch, useSelector } from "react-redux";
import { GETDOC, UPDATEDOC } from "../../server";
import voiceChat from "../../assets/voiceChat.png";
import { v4 as uuid } from "uuid";
import { onSnapshot, doc } from "firebase/firestore";
import { DB } from "../../server";
import { Timestamp, arrayUnion } from "firebase/firestore";
import { CreateToast } from "../../App";
const VoiceCall = () => {
  const User = useSelector((state) => ({ ...state.user })).user;
  const activeChat = useSelector((state) => ({ ...state.chat }));
  const [localAudioTrack, setLocalAudioTrack] = useState(null); // State to store the local audio track
  const [client, setClient] = useState(null);
  const [FetchedCall, setFetchedCall] = useState(null);
  const [onGoingCall, setOnGoingCall] = useState(false);
  const [userJoined, setUserJoined] = useState(false);
  const callAppID = import.meta.env.VITE_TEST_CALLID;

  //fetch the change in the call
  useEffect(() => {
    // Call the REALTIME function with the appropriate arguments
    if (activeChat.chatID) {
      const unsubscribe = onSnapshot(
        doc(DB, "chats", activeChat.chatID),
        (doc) => {
          setFetchedCall(doc.data().voiceCall);
        }
      );

      // Clean up the snapshot listener when the component unmounts
      return () => {
        unsubscribe();
      };
    }
  }, [activeChat.chatID]);
  //create a client for every load
  useEffect(() => {
    setClient(AgoraRTC.createClient({ mode: "rtc", codec: "vp8" }));
  }, []);
  const onCallAccepted = async () => {
    const FetchedUser = await GETDOC("Users", User.uid);
    const FetchOtherUser = await GETDOC("Users", activeChat.user.uid);
    if (FetchedUser.hasCall) {
      CreateToast("you can only have one call active", "error");
      return;
    }
    if (FetchOtherUser.hasCall) {
      CreateToast("Other user is in a call right now", "error");
      return;
    }
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
    await UPDATEDOC("Users", User.uid, {
      hasCall: true,
    });
  };
  //voice call status watcher
  useEffect(() => {
    const handleStatus = async () => {
      if (FetchedCall?.status === "Accepted") {
        await onCallAccepted();
        setOnGoingCall(true);
        setUserJoined(true);
      } else if (
        FetchedCall?.status === "Ended" ||
        FetchedCall?.status === "Ignored"
      ) {
        UPDATEDOC("Users", User.uid, {
          hasCall: false,
        });
        setOnGoingCall(false);
        setUserJoined(false);
        await onCallLeave();
      } else {
        setOnGoingCall(false);
        setUserJoined(false);
      }
    };
    handleStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [FetchedCall]);
  const StartCall = async () => {
    const FetchedUser = await GETDOC("Users", User.uid);
    const FetchOtherUser = await GETDOC("Users", activeChat.user.uid);
    if (FetchedUser.hasCall) {
      CreateToast("you can only have one call active", "error");
      return;
    }
    if (FetchOtherUser.hasCall) {
      CreateToast("Other user is in a call right now", "error");
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
            TimeStarted: Timestamp.now(),
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
            TimeStarted: Timestamp.now(),

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
      mediaContainer: [],
      text,
    };
    await UPDATEDOC("chats", activeChat.chatID, {
      messages: arrayUnion(objectToSend),
    });
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const leaveCall = async () => {
    await UPDATEDOC("chats", activeChat.chatID, {
      voiceCall: {
        channel: null,
        makerUID: null,
        remoteUID: null,
        status: "Ended",
      },
    });
    await UPDATEDOC("Users", User.uid, {
      hasCall: false,
    });
    await handleSendUpdate(`${User.displayName} has left a voice call`);
    await handleSendUpdate(`voice call has been ended`);
  };
  useEffect(() => {
    const handleBeforeUnload = async () => {
      await onCallLeave();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [onCallLeave, leaveCall]);

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
