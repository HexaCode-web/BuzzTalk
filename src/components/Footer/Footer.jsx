import React from "react";
import "./Footer.css";
import { useSelector } from "react-redux";

const Footer = () => {
  const currentUser = useSelector((state) => ({ ...state.user }));

  return (
    <div className="BottomStyles">
      <div className="User">
        <img src={currentUser.user.photoURL} className="ProfilePic" />
        <div className="Info">
          <h5>{currentUser.user.displayName}</h5>
          <span>@{currentUser.user.userName}</span>
        </div>
      </div>
    </div>
  );
};

export default Footer;
