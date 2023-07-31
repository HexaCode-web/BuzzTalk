import React, { useState } from "react";
import Login from "./Login/Login";
import SignUp from "./SignUp/SignUp";
import Reset from "./Reset";
import "./Styles.css";
const Portal = () => {
  return (
    <div className="container">
      <Login />
      <SignUp />
      <Reset />
    </div>
  );
};

export default Portal;
