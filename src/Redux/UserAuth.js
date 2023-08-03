import { createSlice } from "@reduxjs/toolkit";

const initialState = { user: null };

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    SetUser: (state, action) => {
      state.user = action.payload;
    },
    changeCallStatutes: (state, action) => {
      state.user.hasCall = action.payload;
    },
  },
});
export default userSlice.reducer;
export const { SetUser, changeCallStatutes } = userSlice.actions;
