import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  uid: null,
  displayName: null,
  name: null,
  lastname: null,
  email: null,
  photoURL: null,
  isPremium: false,
  adActionCount: 0,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserProfile: (state, action) => {
      const { uid, displayName, name, lastname, email, photoURL, isPremium } = action.payload;
      if (uid !== undefined) state.uid = uid;
      if (displayName !== undefined) state.displayName = displayName;
      if (name !== undefined) state.name = name;
      if (lastname !== undefined) state.lastname = lastname;
      if (email !== undefined) state.email = email;
      if (photoURL !== undefined) state.photoURL = photoURL;
      if (isPremium !== undefined) state.isPremium = isPremium;
    },
    setPremium: (state, action) => {
      state.isPremium = action.payload;
    },
    incrementAdActionCount: (state) => {
      state.adActionCount += 1;
    },
    clearUserProfile: (state) => {
      state.uid = null;
      state.displayName = null;
      state.name = null;
      state.lastname = null;
      state.email = null;
      state.photoURL = null;
      state.isPremium = false;
      state.adActionCount = 0;
    },
  },
});

export const { setUserProfile, clearUserProfile, setPremium, incrementAdActionCount } = userSlice.actions;

export default userSlice.reducer;
