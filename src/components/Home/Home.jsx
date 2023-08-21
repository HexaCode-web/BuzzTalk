import React, { useEffect, useRef, useState } from "react";
import Navbar from "../Sidebar/Navbar/Navbar";
import Chats from "../Sidebar/Chats/Chats";
import ChatPanel from "../ChatPanel/ChatPanel";

import "./Home.css";
import { GETDOC, UPDATEDOC } from "../../server";
import { useSelector, useDispatch } from "react-redux";
import { PopupElement } from "../PopupElement";

const Home = () => {
  const currentUser = useSelector((state) => ({ ...state.user })).user;
  const activeChat = useSelector((state) => ({ ...state.chat }));

  const dispatch = useDispatch();

  const ActiveRef = useRef(currentUser.active);
  useEffect(() => {
    const SetActive = async () => {
      try {
        if (ActiveRef) {
          UPDATEDOC("Users", currentUser.uid, {
            active: true,
          });
        }
      } catch (error) {
        console.log(error);
      }
    };

    const intervalId = setInterval(SetActive, 50000); // Call fetchData every 5 seconds

    return () => {
      clearInterval(intervalId); // Clean up interval when component unmounts
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = async (e) => {
      e.preventDefault();
      e.returnValue = "";
      if (ActiveRef.current) {
        ActiveRef.current = false;
      }
      UPDATEDOC("Users", currentUser.uid, {
        active: false,
        hasCall: false,
      });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [currentUser, dispatch]);
  useEffect(() => {
    const markAsDelivered = async () => {
      if (activeChat.chatID) {
        return;
      }

      const UserChatsIDS = currentUser.UserChats;

      UserChatsIDS.forEach(async (ChatID) => {
        const ChatData = await GETDOC("chats", ChatID);
        ChatData.messages.forEach((message) => {
          if (
            message.status === "Sent" &&
            message.SenderID !== currentUser.uid
          ) {
            message.status = "Delivered";
          }
        });
        await UPDATEDOC("chats", ChatID, {
          messages: ChatData.messages,
        });
      });
    };
    markAsDelivered();
  }, []);
  useEffect(() => {
    const intervalId = setInterval(async () => {
      if (ActiveRef.current === false) {
        ActiveRef.current = true;

        await UPDATEDOC("Users", currentUser.uid, {
          active: true,
        });
      }
    }, 5000); // 5000 milliseconds = 5 seconds

    return () => {
      clearInterval(intervalId); // Cleanup the interval when the component unmounts
    };
  }, [currentUser]);
  return (
    <div className="Home">
      <PopupElement />
      <div className="Container">
        <div className="SideBar">
          <Navbar />
          <Chats />
          <div className="BottomStyles"></div>
        </div>

        <ChatPanel />
      </div>
    </div>
  );
};

export default Home;
