import React from "react";
import "./Navbar.css";
import { GETDOC, SIGNOUT, UPDATEDOC } from "../../../server";
import { useDispatch, useSelector } from "react-redux";
import { SetUser } from "../../../Redux/UserAuth";
import { Navigate } from "react-router-dom";
import { setActivePage } from "../../../Redux/ActivePage";
import { SetActiveChat } from "../../../Redux/ActiveChat";
import { CreateToast } from "../../../App";
const Navbar = () => {
  const currentUser = useSelector((state) => ({ ...state.user }));
  const currentChat = useSelector((state) => ({ ...state.chat }));
  const dispatch = useDispatch();
  const LogOut = async () => {
    const FetchedUser = await GETDOC("Users", currentUser.user.uid);
    sessionStorage.setItem("Confirm", false);

    if (FetchedUser.hasCall) {
      CreateToast("Please end the active call first", "error");
      return;
    }
    SIGNOUT();
    dispatch(setActivePage("Login"));
    dispatch(SetUser(null));
    dispatch(
      SetActiveChat({
        chatID: null,
        otherUser: null,
      })
    );
    UPDATEDOC("Users", currentUser.user.uid, {
      active: false,
      hasCall: false,
    });
    if (currentChat.chatID) {
      UPDATEDOC("UsersChats", currentUser.user.uid, {
        [currentChat.chatID + ".inChat"]: false,
      });
    }
    <Navigate to="/Portal" />;
  };
  return (
    <div className="Navbar">
      <h4 className="Logo">BuzzTalk</h4>
      <button
        className="button"
        onClick={() => {
          LogOut();
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default Navbar;
