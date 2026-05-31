import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  value: {},
};

const incomesSlice = createSlice({
  name: "incomes",
  initialState,
  reducers: {
    setIncome: (state, action) => {
      const { periodo, monto } = action.payload;
      state.value[periodo] = monto;
    },
    clearIncomes: (state) => {
      state.value = {};
    },
  },
});

export const { setIncome, clearIncomes } = incomesSlice.actions;
export default incomesSlice.reducer;
