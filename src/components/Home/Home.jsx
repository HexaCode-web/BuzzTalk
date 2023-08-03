import React, { useEffect } from "react";
import Navbar from "../Sidebar/Navbar/Navbar";
import Chats from "../Sidebar/Chats/Chats";
import ChatPanel from "../ChatPanel/ChatPanel";

import "./Home.css";
import { UPDATEDOC } from "../../server";
import { useSelector } from "react-redux";
const Home = () => {
  const currentUser = useSelector((state) => ({ ...state.user })).user;

  useEffect(() => {
    const handleBeforeUnload = async () => {
      await UPDATEDOC("Users", currentUser.uid, {
        active: false,
      });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [currentUser.uid]);
  return (
    <div className="Home">
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
