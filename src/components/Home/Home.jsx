import React from "react";
import Navbar from "../Sidebar/Navbar/Navbar";
import Chats from "../Sidebar/Chats/Chats";
import ChatPanel from "../ChatPanel/ChatPanel";

import "./Home.css";
import { useSelector } from "react-redux";
const Home = () => {
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
