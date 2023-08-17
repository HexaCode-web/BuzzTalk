import React, { useEffect, useRef, useState } from "react";
import Video from "../../assets/videoChat.png";
import { v4 as uuid } from "uuid";
import { GETDOC, UPDATEDOC } from "../../server";
import { useSelector } from "react-redux";
import { Timestamp, arrayUnion, serverTimestamp } from "firebase/firestore";
import { onSnapshot, doc } from "firebase/firestore";
import { DB } from "../../server";
import { CreateToast } from "../../App";

export const VideoCall = ({ fetchedMeeting }) => {
  const activeChat = useSelector((state) => ({ ...state.chat }));
  const user = useSelector((state) => ({ ...state.user })).user;
  const [FetchedVideo, setFetchedVideo] = useState(null);
  const [onGoingCall, setOnGoingVideo] = useState(false);
  const [count, setCount] = useState(0);
  useEffect(() => {
    // Call the REALTIME function with the appropriate arguments
    if (activeChat.chatID) {
      const unsubscribe = onSnapshot(
        doc(DB, "chats", activeChat.chatID),
        (doc) => {
          setFetchedVideo(doc.data().VideoCall);
        }
      );

      // Clean up the snapshot listener when the component unmounts
      return () => {
        unsubscribe();
      };
    }
  }, [activeChat.chatID]);
  useEffect(() => {
    const handleStatus = async () => {
      if (FetchedVideo?.status === "Accepted") {
        lunchMeeting();
        setOnGoingVideo(true);
        await UPDATEDOC("Users", user.uid, {
          hasCall: true,
        });
      } else if (
        FetchedVideo?.status === "Ended" ||
        FetchedVideo?.status === "Ignored"
      ) {
        UPDATEDOC("Users", user.uid, {
          hasCall: false,
        });
        setOnGoingVideo(false);
      } else {
        setOnGoingVideo(false);
      }
    };
    handleStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [FetchedVideo]);
  const lunchMeeting = () => {
    setCount(1);
    if (count === 1) {
      return;
    }
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
    //eslint doesn't  play nice with JitsiMeetExternalAPI
    // eslint-disable-next-line no-undef
    const api = new JitsiMeetExternalAPI(domain, options)._url;
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
              status: "Ended",
            },
          });

          clearInterval(intervalId);
        } else {
          await UPDATEDOC("chats", activeChat.chatID, {
            VideoCall: {
              channel: fetchedVideoCall.channel,
              makerUID: fetchedVideoCall.makerUID,
              remoteUID: null,
              status: "Ended",
            },
          });

          clearInterval(intervalId);
        }
        await handleSendUpdate(`${user.displayName} has left a video call`);
      }
    }, 2000);
  };
  const startMeeting = async () => {
    const FetchedUser = await GETDOC("Users", user.uid);
    const FetchOtherUser = await GETDOC("Users", activeChat.user.uid);
    if (FetchedUser.hasCall) {
      CreateToast("you can only have one call active", "error");
      return;
    }
    if (FetchOtherUser.hasCall) {
      CreateToast("Other user is in a call right now", "error");
      return;
    }
    //set up the domain
    let fetchedData = await GETDOC("chats", activeChat.chatID);
    let fetchedVideoCall = fetchedData.VideoCall;
    if (fetchedVideoCall.makerUID) {
      await UPDATEDOC("chats", activeChat.chatID, {
        VideoCall: {
          channel: activeChat.chatID,
          makerUID: fetchedVideoCall.makerUID,
          remoteUID: user.uid,
          status: "Accepted",
        },
      });
      await handleSendUpdate(`${user.displayName} has joined the video call`);
    } else {
      await UPDATEDOC("chats", activeChat.chatID, {
        VideoCall: {
          channel: activeChat.chatID,
          makerUID: user.uid,
          remoteUID: null,
          status: "Ringing",
        },
      });
      await handleSendUpdate(`${user.displayName} has started a video call`);
    }
  };
  useEffect(() => {
    if (fetchedMeeting?.makerUID && fetchedMeeting?.remoteUID) {
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
      mediaContainer: [],
      text,
    };
    await UPDATEDOC("chats", activeChat.chatID, {
      messages: arrayUnion(objectToSend),
    });
    await UPDATEDOC("UsersChats", user.uid, {
      [activeChat.chatID + ".inChat"]: true,
      [activeChat.chatID + ".lastMessage"]: {
        UserSeen: true,
        text: text,
        Sender: "SYSTEM",
        Media: objectToSend.mediaContainer.length > 0 ? true : false,
      },
      [activeChat.chatID + ".date"]: serverTimestamp(),
      [activeChat.chatID + ".unSeenCount"]: 0,
    });
    //fetch the data from the other user's chat list
    const fetchedData = await GETDOC("UsersChats", activeChat.user.uid);
    const ChatData = fetchedData[activeChat.chatID];
    const FetchedUser = await GETDOC("Users", activeChat.user.uid);
    await UPDATEDOC("UsersChats", activeChat.user.uid, {
      [activeChat.chatID + ".lastMessage"]: {
        //update the last message with the text
        //if the other user was in chat then set this to true
        UserSeen: ChatData.inChat && FetchedUser.active ? true : false,
        text: text,
        Sender: "SYSTEM",
        Media: objectToSend.mediaContainer.length > 0 ? true : false,
      },
      //if the other user in chat then set this to 0 other than that increment the value by one
      [activeChat.chatID + ".unSeenCount"]:
        ChatData.inChat && FetchedUser.active ? 0 : ChatData.unSeenCount + 1,
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
