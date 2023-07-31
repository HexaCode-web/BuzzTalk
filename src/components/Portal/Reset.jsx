import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setActivePage } from "../../Redux/ActivePage";
import { RESETPASSWORD } from "../../server";
import { CreateToast } from "../../App";

const Reset = () => {
  const activePage = useSelector((state) => state.activePage);

  const dispatch = useDispatch();
  const SubmitForm = async (e) => {
    e.preventDefault();

    const [emailField] = e.target;
    const email = emailField.value;
    try {
      await RESETPASSWORD(email);
    } catch (error) {
      CreateToast("something Went Wrong", "error");
    }
    CreateToast("Reset Email Sent", "success");
  };
  return (
    <div
      className={`Form-wrapper animate__animated ${
        activePage === "Reset" ? "animate__fadeInDown" : "animate__fadeOutDown"
      }`}
      style={{ padding: "20px" }}
    >
      <p>
        if you forgot your password you can type below the email that was
        attached to your account and we will send an email reset code
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
        <button
          className="animate__animated animate__fadeInUp button"
          style={{ animationDelay: ".5s", width: "90%" }}
        >
          Send Email
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
            dispatch(setActivePage("Login"));
          }}
        >
          Login
        </p>
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
          Register
        </p>
      </div>
    </div>
  );
};

export default Reset;
