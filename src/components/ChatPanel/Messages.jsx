import React from "react";
import Message from "./Message";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { onSnapshot, doc } from "firebase/firestore";
import { DB } from "../../server";

const Messages = () => {
  const [Messages, setMessages] = useState([]);
  function LastTextMin(messageDate, previousMessage) {
    const date = new Date(
      messageDate.seconds * 1000 + messageDate.nanoseconds / 1000000
    );
    // Get the time in 12-hour format
    const NewTextMin = date.getMinutes();
    let OldTextMin;
    // Format the date and time as a string

    // Use the previousMessage to do any comparison or logic related to the previous message
    if (previousMessage) {
      const previousMessageDate = new Date(
        previousMessage.date.seconds * 1000 +
          previousMessage.date.nanoseconds / 1000000
      );
      OldTextMin = previousMessageDate.getMinutes();
    }

    return NewTextMin === OldTextMin;
  }

  const activeChat = useSelector((state) => ({ ...state.chat }));
  useEffect(() => {
    // Call the REALTIME function with the appropriate arguments

    const unsubscribe = onSnapshot(
      doc(DB, "chats", activeChat.chatID),
      (doc) => {
        doc.exists() && setMessages(doc.data().messages);
      }
    );

    // Clean up the snapshot listener when the component unmounts
    return () => {
      unsubscribe();
    };
  }, [activeChat.chatID]);
  const RenderMessages = Messages.map((m, index) => {
    // Check if it is the first message (index === 0) or if the previous message is from a different sender
    const isDifferentSender =
      index === 0 || Messages[index - 1].SenderID !== m.SenderID;
    const previousMessage = index === 0 ? null : Messages[index + 1];
    return (
      <Message
        key={m.id}
        message={m}
        HideUserName={!isDifferentSender}
        hideDate={LastTextMin(m.date, previousMessage)}
      />
    );
  });
  return <div>{RenderMessages}</div>;
};

export default Messages;
