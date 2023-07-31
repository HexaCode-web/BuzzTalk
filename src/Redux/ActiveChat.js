import { createSlice } from "@reduxjs/toolkit";

const initialState = { chatID: null, user: null };

const ChatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    SetActiveChat: (state, action) => {
      state.chatID = action.payload.chatID;
      state.user = action.payload.otherUser;
    },
  },
});

export default ChatSlice.reducer;
export const { SetActiveChat } = ChatSlice.actions;
