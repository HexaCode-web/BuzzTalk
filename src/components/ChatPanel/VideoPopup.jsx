import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { GETDOC, UPDATEDOC } from "../../server";
import { v4 as uuid } from "uuid";
import { Timestamp, arrayUnion, serverTimestamp } from "firebase/firestore";
import "./CallPopup.css";
import { CreateToast } from "../../App";

const VideoPopup = ({ FetchedVideo }) => {
  const activeChat = useSelector((state) => ({ ...state.chat }));
  const User = useSelector((state) => ({ ...state.user })).user;
  const [seconds, setSeconds] = useState(10);
  let intervalId;
  //send message update
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
    await UPDATEDOC("UsersChats", User.uid, {
      [activeChat.chatID + ".lastMessage"]: {
        text: text,
        Sender: "SYSTEM",
        UserSeen: true,
      },
      [activeChat.chatID + ".date"]: serverTimestamp(),
    });
    const FetchedUser = await GETDOC("Users", activeChat.user.uid);

    await UPDATEDOC("UsersChats", activeChat.user.uid, {
      [activeChat.chatID + ".lastMessage"]: {
        text: text,
        Sender: "SYSTEM",
        UserSeen: activeChat.inChat && FetchedUser.active ? true : false,
      },
      [activeChat.chatID + ".date"]: serverTimestamp(),
    });
  };
  //incase of call accept
  const AcceptVideo = async () => {
    let fetchedChat = await GETDOC("chats", activeChat.chatID);
    await UPDATEDOC("chats", activeChat.chatID, {
      VideoCall: {
        channel: activeChat.chatID,
        makerUID: fetchedChat.VideoCall.makerUID,
        remoteUID: User.uid,
        status: "Accepted",
      },
    });
    await handleSendUpdate(`${User.displayName} has joined the Video call`);
  };
  //in case of call decline
  const DeclineVideo = async () => {
    await UPDATEDOC("chats", activeChat.chatID, {
      VideoCall: {
        channel: null,
        makerUID: null,
        remoteUID: null,
        status: "Declined",
      },
    });
    await handleSendUpdate(`${User.displayName} has Declined the Video call`);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps

  //start the countdown
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    intervalId = setInterval(() => {
      setSeconds((prevSeconds) => prevSeconds - 1);
    }, 1000);

    // Clean up the interval and reset the timer when the component unmounts
    return () => {
      clearInterval(intervalId);
      setSeconds(30);
    };
  }, []);

  // Stop the timer when it reaches 0
  useEffect(() => {
    if (seconds === 0) {
      clearInterval(intervalId);
    }
  }, [intervalId, seconds]);
  useEffect(() => {
    if (seconds === 0) {
      UPDATEDOC("chats", activeChat.chatID, {
        VideoCall: {
          channel: null,
          makerUID: null,
          remoteUID: null,
          status: "Ignored",
        },
      });
      handleSendUpdate(
        `${activeChat.user.displayName} has not answered the Video call`
      );
    }
  }, [
    activeChat.chatID,
    activeChat.user.displayName,
    handleSendUpdate,
    seconds,
  ]);
  return (
    <div className="CallPopup">
      {FetchedVideo?.makerUID === User.uid ? (
        //if the user is hte one who started the call

        <p>video calling {activeChat.user.displayName}...</p>
      ) : (
        //else
        <>
          <p>
            {activeChat.user.displayName /*the user who started the call */} is
            requesting a video call
          </p>
          <div className="button-wrapper">
            <button className="button" onClick={AcceptVideo}>
              Accept
            </button>
            <button className="button" onClick={DeclineVideo}>
              Decline
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default VideoPopup;
