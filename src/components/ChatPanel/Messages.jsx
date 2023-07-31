import React from "react";
import Message from "./Message";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { onSnapshot, doc } from "firebase/firestore";
import { DB } from "../../server";

const Messages = () => {
  const [Messages, setMessages] = useState([]);
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
  const RenderMessages = Messages.map((m) => {
    return <Message key={m.id} message={m} />;
  });
  return <div>{RenderMessages}</div>;
};

export default Messages;
