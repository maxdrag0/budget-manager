import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  uid: null,
  email: null,
  isAuthenticated: false,
  isReady: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthUser: (state, action) => {
      const { uid, email } = action.payload;
      state.uid = uid;
      state.email = email;
      state.isAuthenticated = true;
      state.isReady = true;
    },

    clearAuthUser: (state) => {
      state.uid = null;
      state.email = null;
      state.isAuthenticated = false;
      state.isReady = true;
    },
  },
});

export const { setAuthUser, clearAuthUser } = authSlice.actions;
export default authSlice.reducer;
