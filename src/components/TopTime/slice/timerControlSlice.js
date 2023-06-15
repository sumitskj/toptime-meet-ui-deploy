import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  start: false,
};

export const timerControlSlice = createSlice({
  name: "timerControl",
  initialState: initialState,
  reducers: {
    setTimerState: (state, action) => {
      console.log("setting timer state : ", action.payload);
      state.start = action.payload;
    },
  },
});

export const { setTimerState } = timerControlSlice.actions;

export default timerControlSlice.reducer;
