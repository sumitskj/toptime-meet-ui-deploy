import { createSlice } from "@reduxjs/toolkit";

const initialState = {};

export const authSlice = createSlice({
  name: "authData",
  initialState: initialState,
  reducers: {
    setAuth: (state, action) => {
      return action.payload;
    },
  },
});

export const { setAuth } = authSlice.actions;

export default authSlice.reducer;
