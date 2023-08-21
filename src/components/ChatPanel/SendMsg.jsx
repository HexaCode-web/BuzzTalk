import React, { useRef } from "react";
import Attachment from "../../assets/attachment.png";
import Upload from "../../assets/image.png";
import { useSelector } from "react-redux";
import { useState } from "react";
import { GETDOC, UPDATEDOC, UPLOADPHOTO } from "../../server";
import { Timestamp, arrayUnion, serverTimestamp } from "firebase/firestore";
import { v4 as uuid } from "uuid";
import Emojis from "./Emojis";
import emojiPic from "../../assets/emoji.png";
import "./SendMsg.css";
import close from "../../assets/close.png";
import PhotoOverlay from "./PhotoOverlay";
import pdf from "../../assets/pdf.png";
import doc from "../../assets/doc.png";
import docx from "../../assets/docx.png";
import ppt from "../../assets/ppt.png";
import pptx from "../../assets/pptx.png";
import xls from "../../assets/xls.png";
import xlss from "../../assets/xlss.png";
import txt from "../../assets/txt.png";
const SendMsg = () => {
  const activeChat = useSelector((state) => ({ ...state.chat }));
  const currentUser = useSelector((state) => ({ ...state.user })).user;
  const [showPicker, setShowPicker] = useState(false);
  const [text, setText] = useState("");
  const [mediaAR, setMediaAR] = useState([]);
  const [showOverlay, setShowOverlay] = useState(false);
  const [disableInput, setDisableInput] = useState(false);
  const [enlargedPhotoURL, setEnlargedPhotoURL] = useState("");

  const onEmojiClick = (emojiData, event) => {
    if (disableInput) {
      return;
    }
    const emojiChar = String.fromCodePoint(parseInt(emojiData.unified, 16));

    setText((prevInput) => prevInput + emojiChar);

    setShowPicker(false);
  };
  //on doc input
  const handleDocEdit = (e) => {
    if (disableInput) {
      return;
    }
    const file = e.target.files[0];
    const FileName = file.name;
    const fileExtension = file.name.split(".").pop();
    const id = uuid();

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setMediaAR((prev) => [
          ...prev,
          {
            id,
            FileName,
            fileExtension,
            PreviewURL: reader.result,
            filePath: file,
          },
        ]);
      };
      reader.readAsDataURL(file);
    }
  };
  //on photo input
  const handlePhotoInput = (e) => {
    if (disableInput) {
      return;
    }
    const file = e.target.files[0];
    const FileName = file.name;
    const fileExtension = file.name.split(".").pop();
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setMediaAR((prev) => [
          ...prev,
          {
            id: uuid(),
            FileName,
            fileExtension,
            PreviewURL: reader.result,
            filePath: file,
          },
        ]);
      };
      reader.readAsDataURL(file);
    }
  };
  //on send button
  const handleSend = async () => {
    //clear the text

    setText("");
    const fetchedData = await GETDOC("UsersChats", activeChat.user.uid);
    const ChatData = fetchedData[activeChat.chatID];
    const FetchedUser = await GETDOC("Users", activeChat.user.uid);
    //prebuild the object to send
    let objectToSend = {
      id: uuid(),
      SenderID: currentUser.uid,
      date: Timestamp.now(),
      text: "",
      mediaContainer: [],
      status:
        ChatData.inChat && FetchedUser.active
          ? "Seen"
          : FetchedUser.active
          ? "Delivered"
          : "Sent",
    };

    //if media exists
    if (mediaAR.length > 0) {
      await Promise.all(
        mediaAR.map(async (media) => {
          const DownloadURL = await UPLOADPHOTO(
            `chat/${activeChat.chatID}/${uuid()}`,
            media.filePath
          );
          objectToSend.mediaContainer.push({
            DownloadURL,
            FileName: media.FileName,
            id: media.id,
            fileExtension: media.fileExtension,
          });
        })
      );
    }

    //if text exists
    if (text) {
      // add it to the object

      objectToSend.text = text;
    }
    //if none exists do nothing
    if (!text && mediaAR.length === 0) {
      return;
    }
    //after that update the chat in the  backend
    await UPDATEDOC("chats", activeChat.chatID, {
      messages: arrayUnion(objectToSend),
    });
    // then update the active user's chat in the back end with the last message
    //and also update the date
    //as a precaution set the unSeenCount to 0 and set the "inChat" to true
    await UPDATEDOC("UsersChats", currentUser.uid, {
      [activeChat.chatID + ".inChat"]: true,
      [activeChat.chatID + ".lastMessage"]: {
        text: objectToSend.text,
        UserSeen: true,
        Sender: currentUser.uid,
        Media: objectToSend.mediaContainer.length > 0 ? true : false,
      },
      [activeChat.chatID + ".date"]: serverTimestamp(),
      [activeChat.chatID + ".unSeenCount"]: 0,
    });
    //fetch the data from the other user's chat list

    await UPDATEDOC("UsersChats", activeChat.user.uid, {
      [activeChat.chatID + ".lastMessage"]: {
        //update the last message with the text
        text: objectToSend.text,
        //if the other user was in chat then set this to true
        UserSeen: ChatData.inChat && FetchedUser.active ? true : false,
        Sender: currentUser.uid,
        Media: objectToSend.mediaContainer.length > 0 ? true : false,
      },
      //if the other user in chat then set this to 0 other than that increment the value by one
      [activeChat.chatID + ".unSeenCount"]:
        ChatData.inChat && FetchedUser.active ? 0 : ChatData.unSeenCount + 1,
      [activeChat.chatID + ".date"]: serverTimestamp(),
    });
    //empty the document and the photo
    setMediaAR([]);
  };
  //send when pressing enter
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };
  const RemoveUpload = (id) => {
    setMediaAR((prev) =>
      prev.filter((media) => {
        return media.id != id;
      })
    );
  };
  const RenderUploads = mediaAR.map((media) => {
    let Preview;
    switch (media.fileExtension) {
      case "ppt":
        Preview = ppt;
        break;
      case "pptx":
        Preview = pptx;

        break;
      case "doc":
        Preview = doc;

        break;
      case "docx":
        Preview = docx;

        break;
      case "xls":
        Preview = xls;

        break;
      case "xlsx":
        Preview = xlss;

        break;
      case "txt":
        Preview = txt;
        break;
      case "pdf":
        Preview = pdf;
        break;
      default:
        Preview = media.PreviewURL;
        break;
    }
    return (
      <div key={media.id} className="Media-Preview">
        <img
          src={close}
          onClick={() => {
            RemoveUpload(media.id);
          }}
          className="Delete"
        />
        {Preview && (
          <img
            src={Preview}
            className="Preview"
            onClick={() => handleImageClick(Preview)}
          />
        )}
        <span>{media.FileName}</span>
      </div>
    );
  });
  const handleImageClick = (photoURL) => {
    setEnlargedPhotoURL(photoURL);
    setShowOverlay(true);
  };
  const handleCloseOverlay = () => {
    setShowOverlay(false);
  };
  return (
    <div className="BottomBar">
      {showOverlay && (
        <PhotoOverlay
          photoURL={enlargedPhotoURL}
          onClose={handleCloseOverlay}
        />
      )}
      <div className="TopPart">
        <textarea
          disabled={disableInput}
          className="Message"
          type="text"
          id="Message"
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
              onChange={handlePhotoInput}
            />
          </div>
          <button className="Send button" onClick={handleSend}>
            Send
          </button>
        </div>
      </div>
      {mediaAR.length > 0 && <div className="Uploads">{RenderUploads}</div>}
    </div>
  );
};

export default SendMsg;
