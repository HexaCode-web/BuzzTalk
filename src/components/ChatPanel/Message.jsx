import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import PhotoOverlay from "./PhotoOverlay";
const Message = ({ message, HideUserName, hideDate }) => {
  const activeChat = useSelector((state) => ({ ...state.chat }));
  const currentUser = useSelector((state) => ({ ...state.user })).user;
  const [showOverlay, setShowOverlay] = useState(false);
  const ref = useRef();

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  }, [message]);
  const [enlargedPhotoURL, setEnlargedPhotoURL] = useState("");
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

  const date = new Date(
    message.date.seconds * 1000 + message.date.nanoseconds / 1000000
  );
  const Sending = message.SenderID === currentUser.uid ? true : false;
  const handleImageClick = (photoURL) => {
    setEnlargedPhotoURL(photoURL);
    setShowOverlay(true);
  };

  const handleCloseOverlay = () => {
    setShowOverlay(false);
  };
  let systemSent = message.SenderID === "SYSTEM" ? true : false;
  return (
    <div
      className={`Message ${
        Sending ? "Sender" : systemSent ? "System" : "Receiver"
      } `}
      ref={ref}
    >
      {!systemSent && (
        <div className="messageInfo">
          <img
            src={Sending ? currentUser.photoURL : activeChat.user.photoURL}
            className="ProfilePic"
          />
        </div>
      )}
      <div className="messageWrapper" title={formatDateIn12HourFormat(date)}>
        {!systemSent && !HideUserName && (
          <span className="UserName">
            {Sending ? currentUser.displayName : activeChat.user.displayName}
          </span>
        )}
        <div className="messageBody">
          <span>{message.text}</span>
          {message.photoURL && (
            <img
              src={message.photoURL}
              alt="Message Photo"
              className="Review"
              onClick={() => handleImageClick(message.photoURL)}
            />
          )}
          {message.media && (
            <a href={message.media.DownloadURL}>{message.media.FileName}</a>
          )}
          {showOverlay && (
            <PhotoOverlay
              photoURL={enlargedPhotoURL}
              onClose={handleCloseOverlay}
            />
          )}
        </div>
        {!hideDate && (
          <div className="Date">{formatDateIn12HourFormat(date)}</div>
        )}
      </div>
    </div>
  );
};

export default Message;
