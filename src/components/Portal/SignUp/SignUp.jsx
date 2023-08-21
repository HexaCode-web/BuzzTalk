import React, { useState } from "react";
import Upload from "../../../assets/Upload.png";
import {
  CURRENTUSER,
  NEWUSER,
  QUERY,
  SETDOC,
  UPDATEPROFILE,
  UPLOADPHOTO,
} from "../../../server";
import { CreateToast } from "../../../App";
import { useDispatch, useSelector } from "react-redux";
import { SetUser } from "../../../Redux/UserAuth";
import { setActivePage } from "../../../Redux/ActivePage";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const activePage = useSelector((state) => state.activePage);
  const navigate = useNavigate();

  const [uploading, setUploading] = useState(false);
  const dispatch = useDispatch();
  const [err, setErr] = useState("");
  const SubmitForm = async (e) => {
    setErr("");
    e.preventDefault();

    // Destructure form fields
    const [
      displayNameField,
      userNameField,
      emailField,
      passwordField,
      profilePicField,
    ] = e.target;
    const displayName = displayNameField.value;
    const userName = userNameField.value;

    const email = emailField.value;
    const password = passwordField.value;
    const profilePic = profilePicField.files[0];
    if (userName.includes(" ")) {
      setErr("userName cant include spaces");
      return;
    }
    // Check if uploading is in progress
    if (uploading) {
      setErr("Creating User, please wait...");
      return;
    }

    // Indicate user creation in progress
    CreateToast("Creating User");
    setUploading(true);
    const matches = await QUERY("Users", "userName", "==", userName);
    if (matches.length > 0) {
      setErr("userName name is already taken");
      setUploading(false);

      return;
    }
    try {
      const user = await NEWUSER(email, password);
      const photoURL = await UPLOADPHOTO(user.uid, profilePic);
      const UpdatedUser = await UPDATEPROFILE(
        user,
        { displayName: userName, photoURL },
        false
      );
      await SETDOC(
        "Users",
        user.uid,
        {
          displayName,
          userName: userName,
          email,
          UserChats: [],
          photoURL,
          uid: user.uid,
          hasCall: false,
          active: false,
        },
        true
      );
      await SETDOC("UsersChats", user.uid, {}, true);
      if (UpdatedUser) {
        CreateToast("Account has been created", "success");

        setUploading(false);
        const User = CURRENTUSER();
        dispatch(
          SetUser({
            userName: userName,
            uid: User.uid,
            displayName: displayName,
            photoURL: User.photoURL,
            email: User.email,
          })
        );
        navigate("/");
      }
    } catch (error) {
      setUploading(false);

      console.log(error.message);
      if (error.message.includes("auth/user-not-found")) {
        setErr("no such user");
      } else if (error.message.includes("invalid-email")) {
        setErr("invalid Email");
      } else if (error.message.includes("missing-password")) {
        setErr("Password cant be empty");
      } else if (error.message.includes("auth/wrong-password")) {
        setErr("Wrong Password if you forgot it, try resetting it");
      } else if (error.message.includes("auth/email-already-in-use")) {
        setErr("Email is taken");
      } else if (error.message.includes("network-request-failed")) {
        setErr("Connection Error");
      } else {
        setErr(error.message);
      }
    }
  };
  return (
    <div
      className={`Form-wrapper animate__animated  ${
        activePage === "SignUp" ? "animate__fadeInDown" : "animate__fadeOutDown"
      }`}
    >
      <h3
        className="animate__animated animate__fadeInDown"
        style={{ animationDelay: ".5s" }}
      >
        BuzzTalk
      </h3>
      <p
        className="animate__animated animate__fadeInDown"
        style={{ animationDelay: ".5s" }}
      >
        Register
      </p>
      <form
        style={{ width: "95%" }}
        onSubmit={(e) => {
          SubmitForm(e);
        }}
      >
        <div
          className="formItem animate__animated animate__fadeInLeft"
          style={{ animationDelay: ".5s" }}
        >
          <input
            required={true}
            type="Text"
            name="displayName"
            placeholder="Display name"
          />
        </div>
        <div
          className="formItem animate__animated animate__fadeInLeft"
          style={{ animationDelay: ".5s" }}
        >
          <input
            required={true}
            type="Text"
            name="userName"
            placeholder="userName"
          />
        </div>
        <div
          className="formItem animate__animated animate__fadeInRight"
          style={{ animationDelay: ".5s" }}
        >
          <input
            required={true}
            type="Email"
            name="Email"
            placeholder="Email"
          />
        </div>
        <div
          className="formItem animate__animated animate__fadeInLeft"
          style={{ animationDelay: ".5s" }}
        >
          <input
            required={true}
            type="Password"
            name="Password"
            placeholder="Password"
          />
        </div>
        <div
          className="formItem animate__animated animate__fadeInRight"
          style={{ animationDelay: ".5s", flexDirection: "row" }}
        >
          <span>Profile Pic:</span>
          <label htmlFor="ProfilePic">
            <img src={Upload} style={{ width: "25px", cursor: "pointer" }} />
          </label>
          <input
            required={false}
            type="file"
            accept="image/*"
            hidden
            name="ProfilePic"
            id="ProfilePic"
          />
        </div>
        {err && (
          <p style={{ color: "red", textAlign: "center", width: "100%" }}>
            {err}
          </p>
        )}
        <button
          className="animate__animated animate__fadeInUp button"
          style={{ animationDelay: ".5s", width: "95%" }}
        >
          Register
        </button>
      </form>
      <p
        className="animate__animated animate__fadeInUp"
        style={{ cursor: "pointer", animationDelay: ".5s" }}
        onClick={() => {
          dispatch(setActivePage("Login"));
        }}
      >
        already have an account? Login
      </p>
    </div>
  );
};

export default SignUp;
