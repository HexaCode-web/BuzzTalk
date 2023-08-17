import React, { useEffect, useState } from "react";
import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
export const PopupElement = () => {
  useEffect(() => {
    const agreePopup = sessionStorage.getItem("Confirm");
    if (agreePopup === "false") {
      console.log(agreePopup);
      document.getElementById("hiddenButton").click();
    }
  }, []);
  return (
    <Popup
      trigger={<button id="hiddenButton" style={{ display: "none" }} />}
      modal
      nested
      closeOnDocumentClick={false} // Prevent modal from closing on outside click
    >
      {(close) => (
        <div className="modal animate__animated animate__bounceIn">
          <button className="close" onClick={close}>
            &times;
          </button>
          <div className="header">Hey there!</div>
          <div className="content">
            Just a friendly reminder to log out before you leave the website.
            Doing so helps prevent any misleading 'Active' status. Thanks for
            keeping things accurate
          </div>
          <div className="actions">
            <button
              className="button"
              onClick={() => {
                sessionStorage.setItem("Confirm", true);
                close();
              }}
            >
              Okay!
            </button>
          </div>
        </div>
      )}
    </Popup>
  );
};
