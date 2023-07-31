import React from "react";

const PhotoOverlay = ({ photoURL, onClose }) => {
  return (
    <div className="photo-overlay">
      <div className="photo-overlay-content">
        <img src={photoURL} alt="Enlarged Photo" />
        <button className="close-button" onClick={onClose}>
          Clos
        </button>
      </div>
    </div>
  );
};

export default PhotoOverlay;
