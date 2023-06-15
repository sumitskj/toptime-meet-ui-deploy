import { createSlice } from "@reduxjs/toolkit";

const initialState = {};

export const bookingsSlice = createSlice({
  name: "bookingData",
  initialState: initialState,
  reducers: {
    setBookings: (state, action) => {
      return action.payload;
    },
  },
});

export const { setBookings } = bookingsSlice.actions;

export default bookingsSlice.reducer;
