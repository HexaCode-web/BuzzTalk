import React, { useEffect, useRef } from "react";
import Attachment from "../../assets/attachment.png";
import Upload from "../../assets/image.png";
import { useSelector } from "react-redux";
import { useState } from "react";
import { UPDATEDOC, UPLOADPHOTO } from "../../server";
import { Timestamp, arrayUnion, serverTimestamp } from "firebase/firestore";
import { v4 as uuid } from "uuid";
import Emojis from "./Emojis";
import emojiPic from "../../assets/emoji.png";
const SendMsg = () => {
  const activeChat = useSelector((state) => ({ ...state.chat }));
  const currentUser = useSelector((state) => ({ ...state.user })).user;
  const textareaRef = useRef(null);
  const [showPicker, setShowPicker] = useState(false);
  const [text, setText] = useState("");
  const [photo, setPhoto] = useState(null);
  const [newDocument, setNewDocument] = useState({
    FileName: "",
    id: "",
    fileExtension: "",
    tempFile: null,
  });
  const onEmojiClick = (emojiData, event) => {
    const emojiChar = String.fromCodePoint(parseInt(emojiData.unified, 16));

    setText((prevInput) => prevInput + emojiChar);

    setShowPicker(false);
  };
  const handleDocEdit = async (e) => {
    const file = e.target.files[0];
    const FileName = file.name;
    const fileExtension = file.name.split(".").pop();
    const id = uuid();
    setNewDocument((prev) => {
      return { ...prev, id, fileExtension, FileName, tempFile: file };
    });
  };

  const handleSend = async () => {
    setText("");
    let objectToSend = {
      id: uuid(),
      SenderID: currentUser.uid,
      date: Timestamp.now(),
      text: "",
    };
    if (photo) {
      const photoURL = await UPLOADPHOTO(
        `chat/${activeChat.chatID}/${uuid()}`,
        photo
      );
      objectToSend.photoURL = photoURL;
    }
    if (newDocument.tempFile) {
      const mediaURL = await UPLOADPHOTO(
        `chat/${activeChat.chatID}/${newDocument.id}`,
        newDocument.tempFile
      );

      objectToSend.media = {
        DownloadURL: mediaURL,
        FileName: newDocument.FileName,
        id: newDocument.id,
        fileExtension: newDocument.fileExtension,
      };
    }
    if (text) {
      objectToSend.text = text;
    }
    if (!text && !newDocument.tempFile && !photo) {
      return;
    }
    await UPDATEDOC("chats", activeChat.chatID, {
      messages: arrayUnion(objectToSend),
    });
    await UPDATEDOC("UsersChats", currentUser.uid, {
      [activeChat.chatID + ".lastMessage"]: {
        text: objectToSend.text,
        Sender: currentUser.uid,
        hasPhoto: objectToSend.photoURL ? true : false,
        document: objectToSend.media ? objectToSend.media.FileName : null,
      },
      [activeChat.chatID + ".date"]: serverTimestamp(),
    });

    await UPDATEDOC("UsersChats", activeChat.user.uid, {
      [activeChat.chatID + ".lastMessage"]: {
        text: objectToSend.text,
        Sender: currentUser.uid,
        hasPhoto: objectToSend.photoURL ? true : false,
        document: objectToSend.media ? objectToSend.media.FileName : null,
      },
      [activeChat.chatID + ".date"]: serverTimestamp(),
    });

    setNewDocument({
      FileName: "",
      id: "",
      fileExtension: "",
      tempFile: null,
    });
    setPhoto(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };
  return (
    <div className="BottomBar">
      <textarea
        className="Message"
        type="text"
        ref={textareaRef}
        onKeyPress={handleKeyPress}
        placeholder="Type something..."
        value={text}
        onChange={(event) => {
          setText(event.target.value);
        }}
      />
      <div className="Utilities">
        <img
          className="emoji-icon"
          src={emojiPic}
          onClick={() => setShowPicker((val) => !val)}
        />
        {showPicker && <Emojis HandleClick={onEmojiClick} />}
        <div className="formItem">
          <label htmlFor="File">
            <img src={Attachment} />
          </label>
          <input
            id="File"
            type="file"
            accept=".ppt, .pptx, .doc, .docx, .xls, .xlsx, .txt, .pdf"
            hidden
            name="File"
            onChange={handleDocEdit}
          />
        </div>
        <div className="formItem">
          <label htmlFor="photo">
            <img src={Upload} />
          </label>
          <input
            id="photo"
            type="file"
            accept="image/*"
            hidden
            name="photo"
            onChange={(e) => {
              setPhoto(e.target.files[0]);
            }}
          />
        </div>
        <button className="Send button" onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
};

export default SendMsg;
