// src/app/store.js
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../redux/features/userSlice";
import courseReducer from "../redux/features/courseSlice"

export const store = configureStore({
  reducer: {
   user: userReducer, 
   course : courseReducer,
  },
});