import React, { useState, useEffect } from "react";
import "./ChatPanel.css";
import Video from "../../assets/videoChat.png";
import More from "../../assets/more.png";
import SendMsg from "./SendMsg";
import Messages from "./Messages";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuid } from "uuid";
import { UPDATEDOC } from "../../server";
import { onSnapshot, doc } from "firebase/firestore";
import { DB } from "../../server";
import VoiceChat from "./VoiceChat";

const ChatPanel = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => ({ ...state.user })).user;
  const [fetchedMeeting, setFetchedMeeting] = useState(null);
  const [FetchedCall, setFetchedCall] = useState(null);
  const activeChat = useSelector((state) => ({ ...state.chat }));
  useEffect(() => {
    // Call the REALTIME function with the appropriate arguments
    if (activeChat.chatID) {
      const unsubscribe = onSnapshot(
        doc(DB, "chats", activeChat.chatID),
        (doc) => {
          setFetchedCall(doc.data().voiceCall);
          setFetchedMeeting(doc.data().VideoCallLink);
        }
      );

      // Clean up the snapshot listener when the component unmounts
      return () => {
        unsubscribe();
      };
    }
  }, [activeChat.chatID, dispatch]);
  const startMeeting = async () => {
    const domain = "meet.jit.si";
    const options = {
      roomName: uuid(),
      width: 500,
      height: 500,
      parentNode: document.querySelector("#Iframe"),
      lang: "en",
      userInfo: {
        email: user.email,
        displayName: user.displayName,
      },
    };

    // eslint-disable-next-line no-undef
    const api = new JitsiMeetExternalAPI(domain, options)._url;
    await UPDATEDOC("chats", activeChat.chatID, {
      VideoCallLink: api,
    });
    const newWindow = window.open(api, "_blank", "width=500,height=500");

    const intervalId = setInterval(async () => {
      if (newWindow && newWindow.closed) {
        await UPDATEDOC("chats", activeChat.chatID, {
          VideoCallLink: null,
        });
        clearInterval(intervalId);
      }
    }, 1000);
    const parentElement = document.querySelector("#Iframe");
    parentElement.removeChild(parentElement.firstChild);
  };

  return (
    <>
      {activeChat.user ? (
        <div className="ChatPanel">
          <div className="TopBar">
            <span className="PersonName">{activeChat.user.displayName}</span>
            <div className="Options">
              <VoiceChat FetchedCall={FetchedCall} />

              <img src={Video} alt="Video" onClick={startMeeting} />
              <div
                id="circle"
                className={`circle ${fetchedMeeting ? "" : "Hidden"}`}
              ></div>

              <div id="Iframe"></div>
              <img src={More} alt="More" />
            </div>
          </div>
          <div className="MessagesWrapper">
            <Messages />
          </div>
          <SendMsg />
        </div>
      ) : (
        <div className="ChatPanel">
          <p style={{ margin: "auto" }}>
            click on a chat to start to start chatting
          </p>
        </div>
      )}
    </>
  );
};

export default ChatPanel;
