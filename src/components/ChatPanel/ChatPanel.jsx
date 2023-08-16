import React, { useState, useEffect } from "react";
import "./ChatPanel.css";
import More from "../../assets/more.png";
import close from "../../assets/close.png";
import SendMsg from "./SendMsg";
import Messages from "./Messages";
import { useDispatch, useSelector } from "react-redux";
import { onSnapshot, doc } from "firebase/firestore";
import { DB, UPDATEDOC } from "../../server";
import VoiceCall from "./VoiceCall";
import { VideoCall } from "./VideoCall";
import CallPopup from "./CallPopup";
import { SetActiveChat } from "../../Redux/ActiveChat";
import VideoPopup from "./VideoPopup";
const ChatPanel = () => {
  const [fetchedMeeting, setFetchedMeeting] = useState(null);
  const [FetchedCall, setFetchedCall] = useState(null);
  const [secondUserInChat, setSecondUserInChat] = useState(null);
  const [secondUserActive, setSecondUserActive] = useState(null);
  const currentUser = useSelector((state) => ({ ...state.user })).user;

  const activeChat = useSelector((state) => ({ ...state.chat }));
  const dispatch = useDispatch();

  const closeChat = async () => {
    dispatch(
      SetActiveChat({
        chatID: null,
        otherUser: null,
      })
    );
    await UPDATEDOC("UsersChats", currentUser.uid, {
      [activeChat.chatID + ".inChat"]: false,
    });
  };
  useEffect(() => {
    // Call the REALTIME function with the appropriate arguments
    if (activeChat.chatID) {
      const CheckInChat = onSnapshot(
        doc(DB, "UsersChats", activeChat.user.uid),
        (doc) => {
          //look for changes in the call or the video objects in backend
          setSecondUserInChat(doc.data()[activeChat.chatID].inChat);
        }
      );
      const monitorSecondUserActivity = onSnapshot(
        doc(DB, "Users", activeChat.user.uid),
        (doc) => {
          //look for changes in the call or the video objects in backend
          setSecondUserActive(doc.data().active);
        }
      );
      const unsubscribe = onSnapshot(
        doc(DB, "chats", activeChat.chatID),
        (doc) => {
          //look for changes in the call or the video objects in backend
          setFetchedCall(doc.data().voiceCall);
          setFetchedMeeting(doc.data().VideoCall);
        }
      );

      // Clean up the snapshot listener when the component unmounts
      return () => {
        unsubscribe();
        CheckInChat();
        monitorSecondUserActivity();
      };
    }
  }, []);
  return (
    <>
      {activeChat.user ? (
        <div className="ChatPanel">
          <div className="TopBar">
            <span className="PersonName">
              {activeChat.user.displayName}
              <div
                id="circle"
                className={`circle ${
                  secondUserInChat && secondUserActive ? "" : "Hidden"
                }`}
              ></div>
            </span>

            <div className="Options">
              <VoiceCall />
              {/* if there is a change in the video then run this */}
              <VideoCall fetchedMeeting={fetchedMeeting} />

              {/* if there is a change in the call and the call is on "Ringing" then run this */}
              {FetchedCall?.status === "Ringing" && (
                <CallPopup FetchedCall={FetchedCall} />
              )}
              {fetchedMeeting?.status === "Ringing" && (
                <VideoPopup FetchedVideo={fetchedMeeting} />
              )}
              {/* to contain the video , will get deleted later */}
              <div id="Iframe"></div>
              {/* useful  later */}
              <img src={More} alt="More" />
              <img
                src={close}
                alt="close"
                style={{ minWidth: "30px", minHeight: "30px" }}
                onClick={closeChat}
              />
            </div>
          </div>
          <div className="MessagesWrapper">
            <Messages />
          </div>
          {/*send message component with all its  stuff */}
          <SendMsg />
        </div>
      ) : (
        //if not chat is active
        <div className="ChatPanel">
          <p style={{ margin: "auto" }}>
            select a conversation to start chatting
          </p>
        </div>
      )}
    </>
  );
};

export default ChatPanel;
