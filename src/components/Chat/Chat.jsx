import React, { useEffect, useState } from "react";
import "./Chat.css";
import { useDispatch, useSelector } from "react-redux";
import { SetActiveChat } from "../../Redux/ActiveChat";
import { GETDOC, UPDATEDOC } from "../../server";
import { onSnapshot, doc } from "firebase/firestore";
import { DB } from "../../server";
const Chat = ({ id, HandleClick, ChatData }) => {
  const [Activity, setActivity] = useState(null);
  //this is the chat head
  const currentChat = useSelector((state) => ({ ...state.chat }));
  const currentUser = useSelector((state) => ({ ...state.user })).user;
  const dispatch = useDispatch();
  //display the time of the last massage
  function formatDateIn12HourFormat(date) {
    const day = date.getDate();
    const month = date.getMonth() + 1; // Month is zero-based, so add 1
    const year = date.getFullYear();

    // Get the time in 12-hour format
    const hours = date.getHours() % 12 || 12; // Convert to 12-hour format
    const minutes = date.getMinutes();
    const ampm = date.getHours() >= 12 ? "PM" : "AM";

    // Format the date and time as a string
    const formattedDate = `${month}/${day}/${year}`;
    const formattedTime = `${hours}:${minutes
      .toString()
      .padStart(2, "0")} ${ampm}`;

    return ` ${formattedDate} ${formattedTime} `;
  }
  function formatDate(Timestamp) {
    if (!ChatData.date) {
      return;
    }
    const First = new Date(
      Timestamp.seconds * 1000 + Timestamp.nanoseconds / 1000000
    );
    const date = new Date(formatDateIn12HourFormat(First));
    const now = new Date();

    // If the date is within the same day, display only the time in 12-hour format
    if (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    ) {
      const hours = date.getHours() % 12 || 12; // Convert to 12-hour format
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const period = date.getHours() >= 12 ? "PM" : "AM";
      return `${hours}:${minutes} ${period}`;
    }

    // If the date is yesterday, display "Yesterday"
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    ) {
      return "Yesterday";
    }

    // Otherwise, display the date in "MM/DD/YYYY" format
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }
  const handleClick = async () => {
    //get the user chats of the active user
    const UserChats = await GETDOC("UsersChats", currentUser.uid);
    //loop over them
    for (const key in UserChats) {
      if (key === id /* this is the id of the chat head*/) {
        UserChats[key].inChat = true;
        //reset hte unSeenCount
        UserChats[key].unSeenCount = 0;
      } else {
        //make every other chat "inChat" value false
        UserChats[key].inChat = false;
      }
    }
    //send hte updated value
    await UPDATEDOC("UsersChats", currentUser.uid, UserChats);
    //mark the last message as seen
    await UPDATEDOC("UsersChats", currentUser.uid, {
      [id + ".lastMessage" + ".UserSeen"]: true,
    });
    //redux
    dispatch(
      SetActiveChat({
        chatID: id,
        otherUser: {
          displayName: ChatData.userInfo.displayName,
          photoURL: ChatData.userInfo.photoURL,
          uid: ChatData.userInfo.uid,
        },
      })
    );
  };
  //if the lastMessage property exists check if the sender id matches the active one
  //if yes then it will displayed "you", if its from system, nothing will be displayed
  //if its from the other user then display their name
  const Person = ChatData.lastMessage
    ? currentUser.uid === ChatData.lastMessage.Sender
      ? "You"
      : ChatData.lastMessage.Sender === "SYSTEM"
      ? ""
      : `${ChatData.userInfo.displayName}`
    : "";
  useEffect(() => {
    // Call the REALTIME function with the appropriate arguments

    const unsubscribe = onSnapshot(
      doc(DB, "Users", ChatData.userInfo.uid),
      (doc) => {
        doc.exists() && setActivity(doc.data().active);
      }
    );

    // Clean up the snapshot listener when the component unmounts
    return () => {
      unsubscribe();
    };
  }, [ChatData]);
  return (
    //render the chat head
    <div
      className={`Chat ${currentChat.chatID === id ? "ActiveChat" : ""}`}
      onClick={HandleClick ? HandleClick : handleClick}
    >
      <div className="ProfilePic-wrapper">
        <img src={ChatData.userInfo.photoURL} className="ProfilePic" />
        {Activity && (
          <div className="Activity animate__animated animate__fadeIn"></div>
        )}
      </div>
      <div className="Details">
        <div className="Person-Date-wrapper">
          <span className="Person">{ChatData.userInfo.displayName}</span>

          <span className="Date">{formatDate(ChatData.date)}</span>
        </div>
        {ChatData.lastMessage && (
          <span className="LastText">
            {Person}: {ChatData.lastMessage.text}
            <span>
              {ChatData.lastMessage.Media ? "Message Contains Media" : ""}
            </span>
            {!ChatData.lastMessage.UserSeen && (
              <span className="UnreadCount">
                <span className="Number">
                  {ChatData.unSeenCount != 0 ? ChatData.unSeenCount : ""}
                </span>
              </span>
            )}
          </span>
        )}
      </div>
    </div>
  );
};

export default Chat;
