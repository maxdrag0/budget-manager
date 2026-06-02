import { createSlice } from "@reduxjs/toolkit";

const hoy = new Date();
const fechaProxima = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1);

const initialState = {
  month: fechaProxima.getMonth(),
  year: fechaProxima.getFullYear(),
};

const periodSlice = createSlice({
  name: "period",
  initialState,
  reducers: {
    setMonth: (state, action) => {
      state.month = action.payload;
    },
    setYear: (state, action) => {
      state.year = action.payload;
    },
    setPeriod: (state, action) => {
      state.year = action.payload.year;
      state.month = action.payload.month;
    },
    setToday: (state) => {
      const today = new Date();
      state.month = today.getMonth();
      state.year = today.getFullYear();
    },
    nextMonth: (state) => {
      if (state.month === 11) {
        state.month = 0;
        state.year += 1;
      } else {
        state.month += 1;
      }
    },
    prevMonth: (state) => {
      if (state.month === 0) {
        state.month = 11;
        state.year -= 1;
      } else {
        state.month -= 1;
      }
    }
  },
});

export const { setMonth, setYear, setPeriod, setToday, nextMonth, prevMonth } = periodSlice.actions;
export default periodSlice.reducer;
