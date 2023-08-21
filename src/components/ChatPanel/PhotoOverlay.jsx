import React from "react";

const PhotoOverlay = ({ photoURL, onClose }) => {
  return (
    <div className="overlay">
      <div className="overlay-content">
        <img src={photoURL} alt="Enlarged Photo" />
        <button className="close-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default PhotoOverlay;
