import React, { useEffect, useRef, useState } from "react";
import Navbar from "../Sidebar/Navbar/Navbar";
import Chats from "../Sidebar/Chats/Chats";
import ChatPanel from "../ChatPanel/ChatPanel";

import "./Home.css";
import { UPDATEDOC } from "../../server";
import { useSelector, useDispatch } from "react-redux";
import { PopupElement } from "../PopupElement";

const Home = () => {
  const currentUser = useSelector((state) => ({ ...state.user })).user;

  const dispatch = useDispatch();

  const ActiveRef = useRef(currentUser.active);
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
