import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./counterSlice/counterSlice";
import movementsReducer from "./movementsSlice/movementsSlice";
import incomesReducer from "./incomesSlice/incomesSlice";
import authReducer from "./authSlice/authSlice";
import userReducer from "./userSlice/userSlice";
import periodReducer from "./periodSlice/periodSlice";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    movements: movementsReducer,
    incomes: incomesReducer,
    auth: authReducer,
    user: userReducer,
    period: periodReducer,
  },
});
