// src/features/user/userSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
};

const userSlice = createSlice({
  name: "user", // updated slice name
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload; // set user data
    },
    clearUser: (state) => {
      state.user = null;
    },
  },
});

// Export actions
export const { setUser, clearUser } = userSlice.actions;

// Export reducer
export default userSlice.reducer;