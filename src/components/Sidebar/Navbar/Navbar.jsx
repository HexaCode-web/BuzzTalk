import React from "react";
import "./Navbar.css";
import { SIGNOUT, UPDATEDOC } from "../../../server";
import { useDispatch, useSelector } from "react-redux";
import { SetUser } from "../../../Redux/UserAuth";
import { Navigate } from "react-router-dom";
import { setActivePage } from "../../../Redux/ActivePage";
const Navbar = () => {
  const currentUser = useSelector((state) => ({ ...state.user }));
  const dispatch = useDispatch();
  const LogOut = async () => {
    await SIGNOUT();
    dispatch(SetUser(null));
    dispatch(setActivePage("Login"));
    await UPDATEDOC("Users", currentUser.user.uid, {
      active: false,
    });

    <Navigate to="/Portal" />;
  };
  return (
    <div className="Navbar">
      <h4 className="Logo">BuzzTalk</h4>
      <div className="User">
        <img src={currentUser.user.photoURL} className="ProfilePic" />
        <h5>{currentUser.user.displayName}</h5>
        <button
          className="button"
          onClick={() => {
            LogOut();
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;
