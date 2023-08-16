import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { GETDOC, UPDATEDOC } from "../../server";
import { v4 as uuid } from "uuid";
import { Timestamp, arrayUnion } from "firebase/firestore";
import "./CallPopup.css";
const CallPopup = ({ FetchedCall }) => {
  const activeChat = useSelector((state) => ({ ...state.chat }));
  const User = useSelector((state) => ({ ...state.user })).user;
  const [seconds, setSeconds] = useState(10);
  let intervalId;
  //send message update
  async function handleSendUpdate(text) {
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
  }
  //incase of call accept
  const AcceptCall = async () => {
    let fetchedChat = await GETDOC("chats", activeChat.chatID);
    await UPDATEDOC("chats", activeChat.chatID, {
      voiceCall: {
        channel: activeChat.chatID,
        makerUID: fetchedChat.voiceCall.makerUID,
        remoteUID: User.uid,
        status: "Accepted",
      },
    });
    await handleSendUpdate(`${User.displayName} has joined the voice call`);
  };
  //in case of call decline
  const DeclineCall = async () => {
    await UPDATEDOC("chats", activeChat.chatID, {
      voiceCall: {
        channel: null,
        makerUID: null,
        remoteUID: null,
        status: "Declined",
      },
    });
    await handleSendUpdate(`${User.displayName} has Declined the voice call`);
  };
  //in case of call missed

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
        voiceCall: {
          channel: null,
          makerUID: null,
          remoteUID: null,
          status: "Ignored",
        },
      });
      handleSendUpdate(
        `${activeChat.user.displayName} has not answered the voice call`
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
      {FetchedCall?.makerUID === User.uid ? (
        //if the user is hte one who started the call

        <p>calling {activeChat.user.displayName}...</p>
      ) : (
        //else
        <>
          <p>
            {activeChat.user.displayName /*the user who started the call */} is
            requesting a call
          </p>
          <div className="button-wrapper">
            <button className="button" onClick={AcceptCall}>
              Accept
            </button>
            <button className="button" onClick={DeclineCall}>
              Decline
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CallPopup;
