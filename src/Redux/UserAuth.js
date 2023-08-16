import { createSlice } from "@reduxjs/toolkit";

const initialState = { user: null };

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    SetUser: (state, action) => {
      state.user = action.payload;
    },
    changeActive: (state, action) => {
      state.user.active = action.payload;
    },
  },
});
export default userSlice.reducer;
export const { SetUser, changeActive } = userSlice.actions;
