import React from "react";
import "./Chat.css";
import { useDispatch, useSelector } from "react-redux";
import { SetActiveChat } from "../../Redux/ActiveChat";
const Chat = ({ id, HandleClick, ChatData }) => {
  const dispatch = useDispatch();
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

  const currentUser = useSelector((state) => ({ ...state.user })).user;
  const handleClick = () => {
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
  const Person = ChatData.lastMessage
    ? currentUser.uid === ChatData.lastMessage.Sender
      ? "You:"
      : ChatData.lastMessage.Sender === "SYSTEM"
      ? ""
      : `:${ChatData.userInfo.displayName}`
    : "";
  return (
    <div className="Chat" onClick={HandleClick ? HandleClick : handleClick}>
      <img src={ChatData.userInfo.photoURL} className="ProfilePic" />
      <div className="Details">
        <div className="Person-Date-wrapper">
          <span className="Person">{ChatData.userInfo.displayName}</span>

          <span className="Date">{formatDate(ChatData.date)}</span>
        </div>
        {ChatData.lastMessage && (
          <span className="LastText">
            {Person} {ChatData.lastMessage.text}
            <span>
              {ChatData.lastMessage.hasPhoto ? "Message Contains an image" : ""}
            </span>
            <span>
              {ChatData.lastMessage.document
                ? ChatData.lastMessage.document
                : ""}
            </span>
          </span>
        )}
      </div>
    </div>
  );
};

export default Chat;
