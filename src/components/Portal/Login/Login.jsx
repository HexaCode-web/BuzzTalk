import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreateToast } from "../../../App";
import { CURRENTUSER, GETDOC, LOGIN, UPDATEDOC } from "../../../server";
import { useDispatch, useSelector } from "react-redux";
import { SetUser } from "../../../Redux/UserAuth";
import { setActivePage } from "../../../Redux/ActivePage";
const Login = () => {
  const activePage = useSelector((state) => state.activePage);
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const [err, setErr] = useState("");
  const SubmitForm = async (e) => {
    setErr("");
    e.preventDefault();

    const [emailField, passwordField] = e.target;

    const email = emailField.value;
    const password = passwordField.value;

    CreateToast("Logging in");

    try {
      await LOGIN(email, password);
      const User = CURRENTUSER();

      await UPDATEDOC("Users", User.uid, {
        active: true,
      });
      const FetchedUser = await GETDOC("Users", User.uid);
      dispatch(
        SetUser({
          uid: User.uid,
          displayName: FetchedUser.displayName,
          userName: FetchedUser.userName,
          photoURL: User.photoURL,
          email: User.email,
          UserChats: FetchedUser.UserChats,
          active: FetchedUser.active,
          hasCall: FetchedUser.hasCall,
        })
      );
      sessionStorage.setItem("Confirm", false);
      navigate("/");

      dispatch(setActivePage("null"));
    } catch (error) {
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
      return;
    }
  };
  return (
    <div
      className={`Form-wrapper animate__animated ${
        activePage === "Login" ? "animate__fadeInDown" : "animate__fadeOutDown"
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
        Login
      </p>
      <form style={{ width: "95%" }} onSubmit={SubmitForm}>
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
        {err && (
          <p style={{ color: "white", textAlign: "center", width: "100%" }}>
            {err}
          </p>
        )}
        <button
          className="animate__animated animate__fadeInUp button"
          style={{ animationDelay: ".5s", width: "90%" }}
        >
          Login
        </button>
      </form>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "90%",
          paddingLeft: "10px",
          paddingRight: "10px",
        }}
      >
        <p
          className="animate__animated animate__fadeInUp "
          style={{
            cursor: "pointer",
            animationDelay: ".5s",
            fontSize: ".85rem",
          }}
          onClick={() => {
            dispatch(setActivePage("SignUp"));
          }}
        >
          No account? Register
        </p>
        <p
          className="animate__animated animate__fadeInUp "
          style={{
            cursor: "pointer",
            animationDelay: ".5s",
            fontSize: ".85rem",
          }}
          onClick={() => {
            dispatch(setActivePage("Reset"));
          }}
        >
          Need Help?
        </p>
      </div>
    </div>
  );
};

export default Login;
