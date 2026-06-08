import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  groups: [],
  currentGroup: null,
  members: [],
  expenses: [],
  balances: [],
};

const groupsSlice = createSlice({
  name: "groups",
  initialState,
  reducers: {
    setGroups: (state, action) => {
      state.groups = action.payload;
    },
    addGroup: (state, action) => {
      state.groups.unshift(action.payload);
    },
    deleteGroup: (state, action) => {
      state.groups = state.groups.filter((g) => g.id !== action.payload);
      if (state.currentGroup?.id === action.payload) {
        state.currentGroup = null;
        state.members = [];
        state.expenses = [];
        state.balances = [];
      }
    },
    setCurrentGroup: (state, action) => {
      state.currentGroup = action.payload;
    },
    setMembers: (state, action) => {
      state.members = action.payload;
    },
    addMember: (state, action) => {
      state.members.push(action.payload);
    },
    removeMember: (state, action) => {
      state.members = state.members.filter((m) => m.id !== action.payload);
    },
    setExpenses: (state, action) => {
      state.expenses = action.payload;
    },
    addExpense: (state, action) => {
      state.expenses.unshift(action.payload);
    },
    deleteExpense: (state, action) => {
      state.expenses = state.expenses.filter((e) => e.id !== action.payload);
    },
    setBalances: (state, action) => {
      state.balances = action.payload;
    },
    clearGroupDetail: (state) => {
      state.currentGroup = null;
      state.members = [];
      state.expenses = [];
      state.balances = [];
    },
  },
});

export const {
  setGroups,
  addGroup,
  deleteGroup,
  setCurrentGroup,
  setMembers,
  addMember,
  removeMember,
  setExpenses,
  addExpense,
  deleteExpense,
  setBalances,
  clearGroupDetail,
} = groupsSlice.actions;

export default groupsSlice.reducer;
