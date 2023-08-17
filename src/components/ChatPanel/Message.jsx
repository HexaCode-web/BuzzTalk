import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import PhotoOverlay from "./PhotoOverlay";
import "./Message.css";
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
  const RenderMedia = message.mediaContainer?.map((media) => {
    const validExtensions = [
      "pdf",
      "txt",
      "xlsx",
      "xls",
      "docx",
      "doc",
      "pptx",
      "ppt",
    ];

    if (validExtensions.includes(media.fileExtension)) {
      return (
        <a key={media.id} href={media.DownloadURL}>
          {media.FileName}
        </a>
      );
    } else {
      return (
        <img
          key={media.id}
          src={media.DownloadURL}
          alt="Message Photo"
          className="Review"
          onClick={() => handleImageClick(media.DownloadURL)}
        />
      );
    }
  });
  return (
    <div
      className={`Message ${
        Sending ? "Sender" : systemSent ? "System" : "Receiver"
      } `}
      ref={ref}
    >
      {showOverlay && (
        <PhotoOverlay
          photoURL={enlargedPhotoURL}
          onClose={handleCloseOverlay}
        />
      )}
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
          {RenderMedia}
        </div>
        {!hideDate && (
          <div className="Date">{formatDateIn12HourFormat(date)}</div>
        )}
      </div>
    </div>
  );
};

export default Message;
