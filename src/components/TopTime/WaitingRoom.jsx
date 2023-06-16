import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getBookingDetails } from "./api/toptimeApi";
import { ErrorDialog } from "../../primitives/DialogContent";
import { styled } from "@100mslive/react-ui";
import { storeTopTimeAuth } from "./store/localStore";
import { useSearchParam } from "react-use";
import { QUERY_PARAM_AUTH_TOKEN } from "../../common/constants";
import { useDispatch } from "react-redux";
import { setBookings } from "./slice/bookingSlice";
import { setAuth } from "./slice/authSlice";

const WaitingRoom = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { bookingId: bookingId, role: userRole } = useParams(); // from the url
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [booking, setBooking] = useState(null);
  const loginUrl = process.env.REACT_APP_TOPTIME_UI_URI + "/login";
  const [timeLeft, setTimeLeft] = useState("");
  let authToken = useSearchParam(QUERY_PARAM_AUTH_TOKEN);

  useEffect(() => {
    dispatch(setAuth(authToken));
    const getBookings = async () => {
      if (userRole !== "user" && userRole !== "professional")
        throw Error("Bad Request. Role is incorrect.");
      const bookingRes = await getBookingDetails(bookingId, authToken);
      if (bookingRes.ok) {
        const bkd = await bookingRes.json();
        setBooking(bkd);
        dispatch(setBookings(bkd));
      }
    };
    getBookings().catch(err => {
      console.error("error in fetching bookings ", err);
      setError(err.status);
    });
  }, []);

  useEffect(() => {
    if (booking !== null) {
      if (userRole === "user") {
        setName(booking.userFirstName);
      }
      if (userRole === "professional") {
        setName(booking.professionalFirstName);
      }
      console.log("booking ", booking);
      const timer = setInterval(() => {
        setTimeLeft(calculateTimeLeft(new Date(booking.finalBookingTime)));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [booking]);

  const calculateTimeLeft = target => {
    let difference = target - new Date();
    let timeLeft = {};
    if (difference > 0) {
      timeLeft = {
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    } else {
      if (booking !== null && (booking.status === 3 || booking.status === 4))
        navigate(`/preview/${booking.roomId}/${userRole}/${name}`);
    }
    return timeLeft;
  };

  const Link = styled("a", {
    color: "#2f80e1",
  });

  
  return (
    <>
      {error !== null && (
        <ErrorDialog title={"Error"}>
          Error in loading page. Please try refreshing page again. If issue persist then you may have accessed an unauthorised resource. Please first authenticate
          yourself at{" "}
          <Link target="_blank" href={loginUrl} rel="noreferrer">
            Login
          </Link>
        </ErrorDialog>
      )}
      {booking !== null && booking.status !== 3 && booking.status !== 4 && (
        <ErrorDialog title={"Error"}>Meeting is already completed</ErrorDialog>
      )}
      {error === null &&
        booking !== null &&
        (booking.status === 3 || booking.status === 4) && (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                width: "100vw",
                height: "100vh",
              }}
            >
              {timeLeft === "" && (
                <div
                  style={{
                    color: "white",
                    fontSize: "1.5rem",
                    fontWeight: "500",
                  }}
                >
                  Loading...
                </div>
              )}
              {timeLeft !== "" && (
                <div
                  style={{
                    color: "white",
                    fontSize: "1.5rem",
                    fontWeight: "600",
                  }}
                >
                  Please wait. Your call will start in
                </div>
              )}
              {timeLeft !== "" && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      margin: "1rem",
                      padding: "1rem",
                      fontSize: "1.2rem",
                      color: "white",
                      backgroundColor: "#465366",
                      borderRadius: "12px",
                      fontWeight: "500",
                    }}
                  >
                    {timeLeft.minutes} min
                  </div>
                  <div
                    style={{
                      margin: "1rem",
                      padding: "1rem",
                      fontSize: "1.2rem",
                      color: "white",
                      backgroundColor: "#465366",
                      borderRadius: "12px",
                      fontWeight: "500",
                    }}
                  >
                    {timeLeft.seconds} sec
                  </div>
                </div>
              )}
            </div>
          </>
        )}
    </>
  );
};

export default WaitingRoom;
