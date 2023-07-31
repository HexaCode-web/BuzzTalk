/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import "./input.css";
import Upload from "../../assets/Upload.png";
const Input = ({
  name,
  id,
  value,
  handleChange,
  type,
  label,
  className,
  placeholder,
  animationDelay,
}) => {
  const [inputEL, setInputEl] = useState(null);
  useEffect(() => {
    switch (type) {
      case "Image":
        setInputEl(
          <div className={`formItem ${className}`} style={{ animationDelay }}>
            <span>{label}</span>
            <label htmlFor="BG">
              <img src={Upload} style={{ width: "25px", cursor: "pointer" }} />
            </label>
            <input
              type="file"
              accept="image/*"
              hidden
              name={name}
              id={id}
              value={value}
              onChange={(event) => handleChange(event)}
            />
          </div>
        );
        break;
      case "Text":
        setInputEl(
          <div className={`formItem ${className}`} style={{ animationDelay }}>
            <label htmlFor={id}>{label}</label>
            <input
              placeholder={placeholder}
              type="text"
              name={name}
              id={id}
              value={value}
              onChange={(event) => handleChange(event)}
            />
          </div>
        );
        break;
      case "Email":
        setInputEl(
          <div className={`formItem ${className}`} style={{ animationDelay }}>
            <label htmlFor={id}>{label}</label>
            <input
              placeholder={placeholder}
              type="Email"
              name={name}
              id={id}
              value={value}
              onChange={(event) => handleChange(event)}
            />
          </div>
        );
        break;
      case "Password":
        setInputEl(
          <div className={`formItem ${className}`} style={{ animationDelay }}>
            <label htmlFor={id}>{label}</label>
            <input
              placeholder={placeholder}
              type="Password"
              name={name}
              id={id}
              value={value}
              onChange={(event) => handleChange(event)}
            />
          </div>
        );
        break;

      default:
        break;
    }
  }, []);

  return inputEL;
};

export default Input;
