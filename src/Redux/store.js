import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./UserAuth";
import ActivePage from "./ActivePage";
import ActiveChat from "./ActiveChat";
const store = configureStore({
  reducer: {
    user: userReducer,
    activePage: ActivePage,
    chat: ActiveChat,
  },
});
export default store;
