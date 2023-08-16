/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useContext } from "react";
import "./Chats.css";
import Chat from "../../Chat/Chat";
import { QUERY, SETDOC, GETDOC, UPDATEDOC, REALTIME } from "../../../server";
import { serverTimestamp } from "firebase/firestore";
import { useSelector, useDispatch } from "react-redux";
import { SetActiveChat } from "../../../Redux/ActiveChat";
import loadingGIF from "../../../assets/loading-97.gif";
const Chats = () => {
  const [searchValue, setSearchValue] = useState("");
  const [matchingChats, setMatchingChats] = useState([]);
  const [searchChat, setSearchChat] = useState(null);
  const [noMatches, setNoMatches] = useState(false);
  const [noUsers, setNoUsers] = useState(false);
  const [loading, setLoading] = useState(false);
  const currentUser = useSelector((state) => ({ ...state.user })).user;
  const [UserChats, setUserChats] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    // Call the REALTIME function with the appropriate arguments
    const unsubscribe = REALTIME("UsersChats", currentUser.uid, setUserChats);

    // Clean up the snapshot listener when the component unmounts
    return () => {
      unsubscribe();
    };
  }, [currentUser.uid]);
  const RunQuery = async () => {
    setLoading(true);
    const matches = await QUERY("Users", "displayName", "==", searchValue);
    if (matches.length === 0) {
      setSearchChat(null);

      setNoUsers(true);
    } else {
      setSearchChat(matches[0]);
      setNoMatches(false);
    }
    setLoading(false);
  };
  useEffect(() => {
    if (searchValue) {
      const TempData = Object.entries(UserChats).filter((chat) => {
        return chat[1].userInfo.displayName.startsWith(searchValue);
      });
      if (TempData.length > 0) {
        setMatchingChats(TempData);
      } else {
        setNoMatches(true);
      }
    } else {
      setNoMatches(false);
      setSearchChat(null);

      setMatchingChats([]);
    }
  }, [searchValue]);
  const NewChat = async () => {
    const combinedID =
      currentUser.uid > searchChat.uid
        ? currentUser.uid + searchChat.uid
        : searchChat.uid + currentUser.uid;
    const DataFound = await GETDOC("chats", combinedID);

    if (DataFound !== "Error") {
      setSearchChat(null);

      return;
    }
    await SETDOC(
      "chats",
      combinedID,
      {
        VideoCall: {
          channel: null,
          makerUID: null,
          remoteUID: null,
        },
        voiceCall: {
          channel: null,
          makerUID: null,
          remoteUID: null,
        },
        chatID: combinedID,
        messages: [],
      },
      true
    );

    await UPDATEDOC("UsersChats", currentUser.uid, {
      [combinedID + ".userInfo"]: {
        uid: searchChat.uid,
        displayName: searchChat.displayName,
        photoURL: searchChat.photoURL,
      },
      [combinedID + ".unSeenCount"]: 0,
      [combinedID + ".date"]: serverTimestamp(),
    });
    await UPDATEDOC("UsersChats", searchChat.uid, {
      [combinedID + ".userInfo"]: {
        uid: currentUser.uid,
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL,
      },
      [combinedID + ".unSeenCount"]: 0,

      [combinedID + ".date"]: serverTimestamp(),
    });
    setSearchChat(null);
    dispatch(
      SetActiveChat({
        chatID: combinedID,
        otherUser: {
          displayName: searchChat.displayName,
          photoURL: searchChat.photoURL,
          uid: searchChat.uid,
        },
      })
    );
  };

  const RenderGlobalSearch = () => {
    return (
      <Chat
        HandleClick={() => {
          NewChat();
        }}
        ChatData={{
          userInfo: {
            displayName: searchChat.displayName,
            photoURL: searchChat.photoURL,
            uid: searchChat.uid,
          },
        }}
        key={searchChat.uid}
      />
    );
  };
  let chatsToRender =
    matchingChats.length > 0 ? matchingChats : Object.entries(UserChats);
  const RenderChats = chatsToRender
    .sort((a, b) => b[1].date - a[1].date)
    .map((chat) => {
      return <Chat key={chat[0]} id={chat[0]} ChatData={chat[1]} />;
    });

  return (
    <>
      <div className="SearchBar">
        <input
          value={searchValue}
          onChange={(event) => {
            setSearchValue(event.target.value);
          }}
          type="Text"
          className="formItem Search"
          placeholder="Find a Conversation..."
        ></input>
      </div>
      {matchingChats.length === 0 && Object.entries(UserChats).length === 0 && (
        <p style={{ textAlign: "center", width: "100%", color: "white" }}>
          no open chats yet
        </p>
      )}
      {noMatches ? (
        <>
          <p style={{ textAlign: "center", width: "100%", color: "white" }}>
            No Matches in your Previous Chats
          </p>
          <span
            style={{
              textAlign: "center",
              width: "100%",
              color: "white",
              cursor: "pointer",
            }}
          >
            <p onClick={RunQuery}>Search for Users?</p>
          </span>
          {noUsers && (
            <p style={{ textAlign: "center", width: "100%", color: "white" }}>
              No Users Found
            </p>
          )}
          {loading && (
            <img
              style={{ maxWidth: "50px", margin: "auto" }}
              src={loadingGIF}
            ></img>
          )}
        </>
      ) : (
        <div className="Chats">
          {searchChat ? RenderGlobalSearch() : RenderChats}
        </div>
      )}
    </>
  );
};

export default Chats;
