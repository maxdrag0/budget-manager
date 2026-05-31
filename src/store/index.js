import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./counterSlice/counterSlice";
import movementsReducer from "./movementsSlice/movementsSlice";
import incomesReducer from "./incomesSlice/incomesSlice";
import authReducer from "./authSlice/authSlice";
import userReducer from "./userSlice/userSlice";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    movements: movementsReducer,
    incomes: incomesReducer,
    auth: authReducer,
    user: userReducer,
  },
});
