import { createSlice } from "@reduxjs/toolkit";

const initialState = "Login";
const ActivePageSlice = createSlice({
  name: "activePage",
  initialState,
  reducers: {
    setActivePage: (state, action) => {
      state = action.payload;
      return state;
    },
  },
});
export default ActivePageSlice.reducer;
export const { setActivePage } = ActivePageSlice.actions;
