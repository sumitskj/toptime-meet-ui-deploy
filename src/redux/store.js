import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../components/TopTime/slice/authSlice";
import bookingReducer from "../components/TopTime/slice/bookingSlice";
import timerControlReducer from "../components/TopTime/slice/timerControlSlice";

export default configureStore({
  reducer: {
    booking: bookingReducer,
    auth: authReducer,
    timer: timerControlReducer,
  },
});
