import React, { useEffect, useState } from "react";
import Video from "../../assets/videoChat.png";
import { v4 as uuid } from "uuid";
import { GETDOC, UPDATEDOC } from "../../server";
import { useSelector } from "react-redux";
import { Timestamp, arrayUnion, serverTimestamp } from "firebase/firestore";

export const VideoCall = ({ fetchedMeeting }) => {
  const activeChat = useSelector((state) => ({ ...state.chat }));
  const user = useSelector((state) => ({ ...state.user })).user;
  const [onGoingCall, setOnGoingVideo] = useState(false);
  const startMeeting = async () => {
    //set up the domain
    const domain = "meet.jit.si";
    //options for the domain
    const options = {
      roomName: uuid(),
      width: 500,
      height: 500,
      parentNode: document.querySelector("#Iframe"), //should be hidden and there is no window instead it will be popup
      lang: "en",
      userInfo: {
        email: user.email,
        displayName: user.displayName,
      },
    };
    //eslint doesn't nice with JitsiMeetExternalAPI
    // eslint-disable-next-line no-undef
    const api = new JitsiMeetExternalAPI(domain, options)._url;
    //check if its the user making the call is primary or secondary
    let fetchedData = await GETDOC("chats", activeChat.chatID);
    let fetchedVideoCall = fetchedData.VideoCall;

    if (fetchedVideoCall.makerUID) {
      await UPDATEDOC("chats", activeChat.chatID, {
        VideoCall: {
          channel: activeChat.chatID,
          makerUID: fetchedVideoCall.makerUID,
          remoteUID: user.uid,
        },
      });
      await handleSendUpdate(`${user.displayName} has joined the video call`);
    } else {
      await UPDATEDOC("chats", activeChat.chatID, {
        VideoCall: {
          channel: activeChat.chatID,
          makerUID: user.uid,
          remoteUID: null,
        },
      });
      await handleSendUpdate(`${user.displayName} has started a video call`);
    }
    //make a new window
    const newWindow = window.open(api, "_blank", "width=500,height=500");
    const parentElement = document.querySelector("#Iframe");
    //remove the iframe
    parentElement.removeChild(parentElement.firstChild);
    //check for window being closed
    const intervalId = setInterval(async () => {
      if (newWindow && newWindow.closed) {
        let fetchedData = await GETDOC("chats", activeChat.chatID);
        let fetchedVideoCall = fetchedData.VideoCall;
        if (fetchedVideoCall.makerUID === user.uid) {
          await UPDATEDOC("chats", activeChat.chatID, {
            VideoCall: {
              channel: fetchedVideoCall.channel,
              makerUID: null,
              remoteUID: fetchedVideoCall.remoteUID,
            },
          });

          clearInterval(intervalId);
        } else {
          await UPDATEDOC("chats", activeChat.chatID, {
            VideoCall: {
              channel: fetchedVideoCall.channel,
              makerUID: fetchedVideoCall.makerUID,
              remoteUID: null,
            },
          });

          clearInterval(intervalId);
        }
        await handleSendUpdate(`${user.displayName} has left a video call`);
      }
    }, 2000);
  };
  useEffect(() => {
    if (fetchedMeeting?.makerUID || fetchedMeeting?.remoteUID) {
      setOnGoingVideo(true);
    } else {
      setOnGoingVideo(false);
    }
  }, [fetchedMeeting]);
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
    await UPDATEDOC("UsersChats", user.uid, {
      [activeChat.chatID + ".lastMessage"]: {
        text: text,
        Sender: "SYSTEM",
      },
      [activeChat.chatID + ".date"]: serverTimestamp(),
    });

    await UPDATEDOC("UsersChats", activeChat.user.uid, {
      [activeChat.chatID + ".lastMessage"]: {
        text: text,
        Sender: "SYSTEM",
      },
      [activeChat.chatID + ".date"]: serverTimestamp(),
    });
  };
  return (
    <>
      <img src={Video} alt="Video" onClick={startMeeting} />
      <div
        id="circle"
        className={`circle ${onGoingCall ? "" : "Hidden"}`}
      ></div>
    </>
  );
};
