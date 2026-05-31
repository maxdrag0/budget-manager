import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  uid: null,
  displayName: null,
  name: null,
  lastname: null,
  email: null,
  photoURL: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserProfile: (state, action) => {
      const { uid, displayName, name, lastname, email, photoURL } = action.payload;
      if (uid !== undefined) state.uid = uid;
      if (displayName !== undefined) state.displayName = displayName;
      if (name !== undefined) state.name = name;
      if (lastname !== undefined) state.lastname = lastname;
      if (email !== undefined) state.email = email;
      if (photoURL !== undefined) state.photoURL = photoURL;
    },
    clearUserProfile: (state) => {
      state.uid = null;
      state.displayName = null;
      state.name = null;
      state.lastname = null;
      state.email = null;
      state.photoURL = null;
    },
  },
});

export const { setUserProfile, clearUserProfile } = userSlice.actions;

export default userSlice.reducer;
