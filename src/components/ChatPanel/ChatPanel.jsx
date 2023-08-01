import React, { useState, useEffect } from "react";
import "./ChatPanel.css";
import More from "../../assets/more.png";
import SendMsg from "./SendMsg";
import Messages from "./Messages";
import { useDispatch, useSelector } from "react-redux";
import { onSnapshot, doc } from "firebase/firestore";
import { DB } from "../../server";
import VoiceCall from "./VoiceCall";
import { VideoCall } from "./VideoCall";

const ChatPanel = () => {
  const dispatch = useDispatch();
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
          setFetchedMeeting(doc.data().VideoCall);
        }
      );

      // Clean up the snapshot listener when the component unmounts
      return () => {
        unsubscribe();
      };
    }
  }, [activeChat.chatID, dispatch]);
  return (
    <>
      {activeChat.user ? (
        <div className="ChatPanel">
          <div className="TopBar">
            <span className="PersonName">{activeChat.user.displayName}</span>
            <div className="Options">
              <VoiceCall FetchedCall={FetchedCall} />
              <VideoCall fetchedMeeting={fetchedMeeting} />

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
          <p style={{ margin: "auto" }}>select a chat to start chatting</p>
        </div>
      )}
    </>
  );
};

export default ChatPanel;
