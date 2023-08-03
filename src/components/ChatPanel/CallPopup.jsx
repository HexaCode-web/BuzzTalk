import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { GETDOC, UPDATEDOC } from "../../server";
import { v4 as uuid } from "uuid";
import { Timestamp, arrayUnion } from "firebase/firestore";

const CallPopup = ({ FetchedCall }) => {
  const activeChat = useSelector((state) => ({ ...state.chat }));
  const User = useSelector((state) => ({ ...state.user })).user;
  const [seconds, setSeconds] = useState(10);
  let intervalId;
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const IgnoreCall = async () => {
    await UPDATEDOC("chats", activeChat.chatID, {
      voiceCall: {
        channel: null,
        makerUID: null,
        remoteUID: null,
        status: "Ignored",
      },
    });
    await handleSendUpdate(
      `${User.displayName} has not answered the voice call`
    );
  };
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
      IgnoreCall();
    }
  }, [IgnoreCall, seconds]);
  return (
    <div className="CallPopup">
      {FetchedCall?.makerUID === User.uid ? (
        <p>calling {activeChat.user.displayName}...</p>
      ) : (
        <>
          <p>{activeChat.user.displayName} is requesting a call</p>
          <div className="button-wrapper">
            <button className="button" onClick={AcceptCall}>
              Accept
            </button>
            <button className="button" onClick={DeclineCall}>
              Decline
            </button>
            <button className="button" onClick={IgnoreCall}>
              Ignore
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CallPopup;
